import test from "node:test";
import assert from "node:assert/strict";
import { DICTIONARY, lookupWord } from "./learning-core.js";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const css = await readFile(new URL("./styles.css", import.meta.url), "utf8");

test("Listening story selection accepts the existing joined text and legacy paragraph arrays", () => {
  const routeStart = app.indexOf('if (activeListeningStoryId !== selected.id)');
  const routeEnd = app.indexOf('library.hidden = true;', routeStart);
  assert.ok(routeStart >= 0 && routeEnd > routeStart, "Listening story selection route should exist");
  const source = app.slice(routeStart, routeEnd);
  assert.match(source, /story = typeof selected\.text === "string" \? selected\.text : selected\.text\.join\("\\n\\n"\);/);
  assert.match(source, /currentStoryParagraphIndex = 0;/);
  assert.match(source, /renderStory\(\);/);
});

test("Listening narration queues paragraph chunks with story-global highlight offsets", () => {
  const start = app.indexOf("function speakStory()");
  const end = app.indexOf("\nfunction startSpeakingPractice()", start);
  assert.ok(start >= 0 && end > start, "speakStory should be defined");
  const source = app.slice(start, end);
  assert.match(source, /const paragraphPattern = \/\[\^\\n\]\+\/g;/);
  assert.match(source, /paragraphs\.push\(\{ text, start: match\.index \+ match\[0\]\.indexOf\(text\) \}\)/);
  assert.match(source, /highlightSpeechWord\(paragraph\.start \+ event\.charIndex\)/);
  assert.match(source, /utterance\.onend = \(\) => \{\s*if \(activeStoryUtterance !== utterance\) return;\s*speakNextParagraph\(\);/);
});

test("stale speech events cannot change the current playback or highlight state", () => {
  const start = app.indexOf("function speakStory()");
  const end = app.indexOf("\nfunction startSpeakingPractice()", start);
  const source = app.slice(start, end);
  for (const handler of ["onstart", "onboundary", "onend", "onerror"]) {
    const handlerStart = source.indexOf("utterance." + handler);
    assert.ok(handlerStart >= 0, `${handler} handler should exist`);
    const handlerEnd = source.indexOf("\n    };", handlerStart);
    assert.ok(handlerEnd > handlerStart, `${handler} handler should close`);
    assert.match(
      source.slice(handlerStart, handlerEnd),
      /if \(activeStoryUtterance !== utterance\) return;/,
      `${handler} should ignore events from canceled or superseded utterances`
    );
  }

  const stopStart = app.indexOf("function stopStoryNarration()");
  const stopEnd = app.indexOf("\nfunction clearSpeechHighlight()", stopStart);
  assert.ok(stopStart >= 0 && stopEnd > stopStart, "stopStoryNarration should be defined");
  const stopSource = app.slice(stopStart, stopEnd);
  assert.match(stopSource, /activeStoryUtterance = null;/);
  assert.match(stopSource, /window\.speechSynthesis\.cancel\(\)/);
  assert.match(stopSource, /clearSpeechHighlight\(\)/);
});

test("Listening translation control exists and keeps its expanded state synchronized", () => {
  assert.match(html, /id="toggle-story-translation"/);
  assert.match(html, /id="story-translation"[^>]*hidden/);
  const start = app.indexOf('$("#toggle-story-translation").addEventListener("click"');
  const end = app.indexOf('\n$("#play-button")', start);
  assert.ok(start >= 0 && end > start, "translation toggle click handler should exist");
  const source = app.slice(start, end);
  assert.match(source, /panel\.hidden = !panel\.hidden/);
  assert.match(source, /setAttribute\("aria-expanded", String\(!panel\.hidden\)\)/);
  assert.match(source, /renderStoryTranslation\(selected\)/);
});


test("Listening word lookup remains readable and non-overlapping on mobile", () => {
  assert.match(css, /\.word-card\s*\{\s*grid-template-columns:\s*minmax\(0,\s*\.72fr\)\s+minmax\(0,\s*1\.28fr\)/);
  assert.match(css, /#word-definition\s*\{\s*grid-column:\s*2/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)\s*\{\s*\.word-card\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /\.word-card \.word-myanmar-translation,\s*\.word-card \.word-context-translation,\s*\.word-card-actions\s*\{\s*grid-column:\s*1;\s*grid-row:\s*auto/);
  assert.match(css, /\.story-translation-paragraph\s*\{[^}]*overflow-wrap:\s*anywhere/s);
});


function findBalancedBlock(source, start, openChar, closeChar) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return "";
}

function countArrayStringEntries(source, property) {
  const propertyIndex = source.indexOf(property + ": [");
  assert.ok(propertyIndex >= 0, `Missing ${property} array`);
  const arrayStart = source.indexOf("[", propertyIndex);
  const arraySource = findBalancedBlock(source, arrayStart, "[", "]");
  assert.ok(arraySource, `Unclosed ${property} array`);
  return [...arraySource.matchAll(/"(?:\\.|[^"\\])*"/g)].map(([entry]) => JSON.parse(entry));
}

test("every Listening story has one non-empty Myanmar translation per English paragraph", () => {
  const storiesStart = app.indexOf("const LISTENING_STORIES = [");
  assert.ok(storiesStart >= 0, "Listening story collection should exist");
  const arrayStart = app.indexOf("[", storiesStart);
  const storiesSource = findBalancedBlock(app, arrayStart, "[", "]");
  assert.ok(storiesSource, "Listening story collection should be closed");

  const storyBlocks = [];
  let quote = null;
  let escaped = false;
  let objectDepth = 0;
  let objectStart = -1;
  for (let index = 0; index < storiesSource.length; index += 1) {
    const char = storiesSource[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") {
      if (objectDepth === 0) objectStart = index;
      objectDepth += 1;
    } else if (char === "}") {
      objectDepth -= 1;
      if (objectDepth === 0 && objectStart >= 0) {
        storyBlocks.push(storiesSource.slice(objectStart, index + 1));
        objectStart = -1;
      }
    }
  }

  assert.ok(storyBlocks.length > 0, "At least one Listening story should be defined");
  const storyIds = new Set();
  for (const block of storyBlocks) {
    const id = block.match(/id: *"([^"]+)"/)?.[1];
    assert.ok(id, "Each Listening story should have an ID");
    assert.ok(!storyIds.has(id), `Duplicate Listening story ID: ${id}`);
    storyIds.add(id);

    const englishParagraphs = countArrayStringEntries(block, "text");
    const translations = countArrayStringEntries(block, "paragraphTranslations");
    assert.ok(englishParagraphs.length > 0, `${id} should have English paragraphs`);
    assert.equal(
      translations.length,
      englishParagraphs.length,
      `${id} must have one Myanmar translation for each English paragraph`
    );
    translations.forEach((translation, index) => {
      assert.ok(translation.trim().length > 0, `${id} paragraph ${index + 1} translation must not be empty`);
    });
  }
});


test("Listening reader renders one paragraph at a time with working previous/next controls", () => {
  assert.match(html, /id="story-pagination"[^>]*hidden/);
  assert.match(html, /id="story-previous"/);
  assert.match(html, /id="story-next"/);
  assert.match(app, /function getStoryParagraphs\(\)/);
  assert.match(app, /const paragraph = paragraphs\[currentStoryParagraphIndex\]/);
  assert.match(app, /currentStoryParagraphIndex = paragraph\.index/);
  assert.match(app, /\$\("#story-next"\)\.addEventListener\("click"/);
  assert.match(app, /\$\("#story-previous"\)\.addEventListener\("click"/);
});

test("word meaning card is anchored as an overlay and closes on outside tap or Escape", () => {
  assert.match(html, /id="word-sentence-context"/);
  assert.match(app, /card\.classList\.add\("word-card-floating"\)/);
  assert.match(app, /document\.addEventListener\("pointerdown"/);
  assert.match(app, /event\.key === "Escape"/);
  assert.match(css, /\.word-card\.word-card-floating\s*\{[^}]*position:\s*fixed/s);
  assert.match(css, /\.word-card\.word-card-floating\s*\{[^}]*z-index:\s*1000/s);
});

test("sentence translation is shown only when sentence counts align; otherwise paragraph translation is labelled honestly", () => {
  assert.match(app, /translatedSentences\.length === englishSentences\.length/);
  assert.match(app, /ဝါကျဘာသာပြန်/);
  assert.match(app, /စာပိုဒ်ဘာသာပြန်/);
});

test("story-card navigation is committed before speech cleanup so cleanup errors cannot block opening", () => {
  const start = app.indexOf('card.addEventListener("click", () => {', app.indexOf("function renderListeningLibrary()"));
  const end = app.indexOf("\n    });", start);
  assert.ok(start >= 0 && end > start, "story card click handler should exist");
  const source = app.slice(start, end);
  const navigation = source.indexOf('location.hash = `#/listening/${item.id}`;');
  const cleanup = source.indexOf("stopStoryNarration();");
  assert.ok(navigation >= 0 && cleanup > navigation, "route must change before speech cleanup");
  assert.match(source, /try\s*\{\s*stopStoryNarration\(\);\s*\}\s*catch\s*\{/);
});

test("tapping an English story word speaks it aloud and translation follows the current paragraph", () => {
  const renderStart = app.indexOf("function renderStory()");
  const renderEnd = app.indexOf("\nfunction pronounceWord", renderStart);
  assert.ok(renderStart >= 0 && renderEnd > renderStart, "story renderer should exist");
  const renderSource = app.slice(renderStart, renderEnd);
  assert.ok(renderSource.includes("showWord(part.word, wordParagraphIndex);"));
  assert.ok(renderSource.includes("pronounceWord(part.word);"));
  assert.ok(renderSource.includes("renderStoryTranslation(selected)"));

  const translationStart = app.indexOf("function renderStoryTranslation(selected)");
  const translationEnd = app.indexOf("\nfunction stopStoryNarration", translationStart);
  assert.ok(translationStart >= 0 && translationEnd > translationStart, "translation renderer should exist");
  const translationSource = app.slice(translationStart, translationEnd);
  assert.ok(translationSource.includes("])[currentStoryParagraphIndex]"));
  assert.ok(translationSource.includes("${currentStoryParagraphIndex + 1}."));
  assert.ok(!translationSource.includes("]).entries()"), "translation should not render every paragraph at once");
});

test("tapping a Listening story card immediately renders the selected story reader", () => {
  const libraryStart = app.indexOf("function renderListeningLibrary()");
  const libraryEnd = app.indexOf("\nfunction syncListeningView", libraryStart);
  assert.ok(libraryStart >= 0 && libraryEnd > libraryStart, "story library renderer should exist");
  const source = app.slice(libraryStart, libraryEnd);
  const clickStart = source.indexOf('card.addEventListener("click"');
  const clickEnd = source.indexOf("\n    });", clickStart);
  assert.ok(clickStart >= 0 && clickEnd > clickStart, "story card click handler should exist");
  const handler = source.slice(clickStart, clickEnd);
  assert.match(handler, /location\.hash = `#\/listening\/\$\{item\.id\}`;/);
  assert.match(handler, /renderPage\(\);/);
  assert.match(handler, /window\.scrollTo\(\{ top: 0, behavior: "auto" \}\)/);
  const routeStart = app.indexOf("function syncListeningView");
  const routeEnd = app.indexOf("\nfunction renderStoryTranslation", routeStart);
  assert.ok(routeStart >= 0 && routeEnd > routeStart, "story route renderer should exist");
  assert.match(app.slice(routeStart, routeEnd), /library\.hidden = true;\s*panel\.hidden = false;\s*back\.hidden = false;/);
});


test("Listening word lookup prioritizes Myanmar meaning and includes common Maya story vocabulary", async () => {
  const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
  const core = await readFile(new URL("./dictionary.js", import.meta.url), "utf8");
  const head = html.indexOf('<div class="word-card-head">');
  const meaning = html.indexOf('id="word-myanmar-translation"', head);
  const definition = html.indexOf('id="word-definition"', head);
  assert.ok(head >= 0 && meaning > head && definition > meaning, "Myanmar meaning should appear directly after the selected word, before English definition");
  for (const [word, meaningText] of [["small", "သေးငယ်သော"], ["house", "အိမ်"], ["garden", "ပန်းပင်"]]) {
    const entry = core.match(new RegExp(String.raw`\b${word}: \{[^}]*my: "([^"]+)"`));
    assert.ok(entry, "offline dictionary should define " + word);
    assert.ok(entry[1].includes(meaningText), word + " should have a Myanmar meaning");
  }
});


test("every distinct word in Maya’s Garden story has an offline dictionary entry", async () => {
  const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
  const storyStart = app.indexOf('id: "garden-bird"');
  const storyEnd = app.indexOf('id: "market-morning"', storyStart);
  assert.ok(storyStart >= 0 && storyEnd > storyStart, "Maya’s Garden story should exist");
  const story = app.slice(storyStart, storyEnd);
  const paragraphs = countArrayStringEntries(story, "text");
  const words = [...new Set(paragraphs.join(" ").match(/[A-Za-z]+(?:['-][A-Za-z]+)*/g) || [])];
  const missing = words.filter((word) => !lookupWord(word));
  assert.deepEqual(missing, [], "Every word in Maya’s Garden should have a Myanmar dictionary entry");
});

test("Listening uses one standalone shared dictionary as the source of truth", async () => {
  const dictionarySource = await readFile(new URL("./dictionary.js", import.meta.url), "utf8");
  const declaredKeys = [...dictionarySource.matchAll(/^\s{2}([a-z][a-z'-]*):\s*\{/gm)].map((match) => match[1]);
  assert.ok(Object.keys(DICTIONARY).length >= 300, "shared dictionary should retain the existing vocabulary");
  assert.equal(new Set(declaredKeys).size, declaredKeys.length, "dictionary source must not declare duplicate word keys");
  assert.equal(declaredKeys.length, Object.keys(DICTIONARY).length, "every declared dictionary entry should be represented exactly once");
});

test("irregular forms resolve to a direct dictionary entry or a verified base-word entry", () => {
  const pairs = [
    ["went", "go"], ["gone", "go"], ["saw", "see"], ["seen", "see"],
    ["took", "take"], ["taken", "take"], ["gave", "give"], ["given", "give"],
    ["brought", "bring"], ["bought", "buy"], ["thought", "think"], ["caught", "catch"],
    ["found", "find"], ["told", "tell"], ["said", "say"], ["ran", "run"],
    ["sat", "sit"], ["fell", "fall"], ["stood", "stand"], ["felt", "feel"],
    ["knew", "know"], ["known", "know"], ["understood", "understand"],
    ["wrote", "write"], ["written", "write"], ["ate", "eat"], ["eaten", "eat"],
    ["drank", "drink"], ["drunk", "drink"], ["spoke", "speak"], ["spoken", "speak"],
    ["broke", "break"], ["broken", "break"], ["chose", "choose"], ["chosen", "choose"],
    ["kept", "keep"], ["slept", "sleep"], ["forgot", "forget"], ["forgotten", "forget"],
    ["held", "hold"], ["heard", "hear"], ["lost", "lose"], ["won", "win"],
    ["sent", "send"], ["spent", "spend"], ["built", "build"], ["met", "meet"],
    ["made", "make"], ["did", "do"], ["done", "do"], ["had", "have"],
    ["children", "child"], ["men", "man"], ["women", "woman"],
    ["feet", "foot"], ["teeth", "tooth"], ["mice", "mouse"],
  ];
  for (const [form, base] of pairs) {
    assert.ok(DICTIONARY[base], "base dictionary entry should exist for " + form + " -> " + base);
    const expected = Object.prototype.hasOwnProperty.call(DICTIONARY, form) ? DICTIONARY[form] : DICTIONARY[base];
    assert.equal(lookupWord(form), expected, form + " should resolve to its direct entry or the verified base entry for " + base);
  }
});

test("unknown and empty word lookups do not return an unrelated translation", () => {
  assert.equal(lookupWord(""), null);
  assert.equal(lookupWord("   "), null);
  assert.equal(lookupWord("qzxv-unlisted-word"), null);
});

test("shared dictionary covers common A1 market vocabulary and resolves the irregular form woke", () => {
  const words = [
    "wake", "breakfast", "cloth", "apple", "banana", "egg", "bunch", "coriander",
    "count", "walk", "familiar", "smell", "arrange", "neat", "row", "baker",
    "shopper", "price", "greet", "firm", "skin", "brown", "spot", "pick",
    "stall", "search", "card", "coin", "enough", "loaf", "item", "pay",
    "correct", "offer", "carry", "basket", "gate", "expensive", "consider",
    "flavour", "value", "comfortable", "wonder", "busy", "praise", "polite",
    "decide", "trip", "brother", "practise", "wash", "toast", "table", "tea",
    "elderly", "kindness", "choice"
  ];
  for (const word of words) {
    const entry = lookupWord(word);
    assert.ok(entry, "shared dictionary should resolve " + word);
    assert.ok(entry.meaning.trim(), word + " should have an English meaning");
    assert.ok(entry.usage.trim(), word + " should have an example sentence");
    assert.ok(entry.my.trim(), word + " should have a Myanmar meaning");
  }
  assert.equal(lookupWord("woke"), DICTIONARY.wake, "woke should resolve through its irregular base form");
  assert.ok(lookupWord("apples"), "regular plural forms should reuse the shared apple entry");
  assert.ok(lookupWord("counted"), "regular past forms should reuse the shared count entry");
});

test("shared dictionary covers key rainy-afternoon vocabulary and common inflected forms", () => {
  const words = [
    "lunch", "dark", "air", "cool", "rise", "hang", "clothes", "indoors",
    "minute", "tap", "roof", "window", "silver", "football", "wet", "field",
    "watch", "wait", "front", "grow", "tall", "paper", "colour", "pencil",
    "cross", "beneath", "example", "life", "miss", "drawing", "discuss",
    "original", "version", "proud", "rainy", "continue", "late", "listen", "weekend"
  ];
  for (const word of words) {
    const entry = lookupWord(word);
    assert.ok(entry, "shared dictionary should resolve " + word);
    assert.ok(entry.meaning.trim() && entry.usage.trim() && entry.my.trim(), word + " should have all dictionary fields");
  }
  assert.equal(lookupWord("grown"), DICTIONARY.grow);
  assert.equal(lookupWord("tapped"), DICTIONARY.tap);
  assert.equal(lookupWord("coloured"), DICTIONARY.colour);
});

test("shared dictionary covers lost-puppy and museum vocabulary with inflected word lookup", () => {
  const words = [
    "cardboard", "paw", "tired", "hurt", "distance", "shake", "bowl", "shopkeeper",
    "online", "daughter", "hurry", "girl", "recognise", "wag", "tail", "slip",
    "grocery", "poster", "step", "chase", "injury", "guidance", "seriously",
    "rescue", "alone", "pet", "readable", "properly", "herself", "hero", "pause",
    "allow", "situation", "promise", "safe", "mean", "love", "friday", "enter",
    "calmly", "receive", "task", "discover", "wear", "pot", "glass", "modern",
    "machine", "equipment", "farm", "today", "letter", "classroom", "desk",
    "encourage", "memorise", "bell", "warn", "begin", "pattern", "question",
    "research", "ring", "complete", "explanation", "match", "correction", "source",
    "claim", "study", "meaningful", "connect", "sketch", "ready", "closely"
  ];
  for (const word of words) {
    const entry = lookupWord(word);
    assert.ok(entry, "shared dictionary should resolve " + word);
    assert.ok(entry.meaning.trim() && entry.usage.trim() && entry.my.trim(), word + " should have all dictionary fields");
  }
  for (const [form, base] of [
    ["walking", "walk"], ["paws", "paw"], ["shopkeepers", "shopkeeper"],
    ["hurried", "hurry"], ["recognised", "recognise"], ["wagged", "wag"],
    ["slipped", "slip"], ["groceries", "grocery"], ["received", "receive"],
    ["worn", "wear"], ["rung", "ring"], ["began", "begin"],
    ["safer", "safe"], ["taller", "tall"], ["lighter", "light"], ["easier", "easy"]
  ]) {
    assert.equal(lookupWord(form), DICTIONARY[base], form + " should resolve to " + base);
  }
});

test("shared dictionary covers village-library vocabulary and irregular shelf plural", () => {
  const words = [
    "textbook", "nearest", "unused", "become", "solve", "villager", "carpenter",
    "shelf", "collect", "paint", "lock", "donation", "progress", "rule", "reader",
    "weekday", "hour", "turn", "welcome", "sign", "belong", "aloud", "teenager",
    "month", "finish", "homework", "announce", "event", "organise", "request",
    "activity", "dictionary", "graded", "practical", "business", "weekly", "circle",
    "passage", "learner", "unfamiliar", "embarrass", "publish", "individual",
    "respect", "habit", "member", "celebration", "regularly", "invite"
  ];
  for (const word of words) {
    const entry = lookupWord(word);
    assert.ok(entry, "shared dictionary should resolve " + word);
    assert.ok(entry.meaning.trim() && entry.usage.trim() && entry.my.trim(), word + " should have all dictionary fields");
  }
  assert.equal(lookupWord("shelves"), DICTIONARY.shelf);
  assert.ok(lookupWord("villagers"));
  assert.ok(lookupWord("dictionaries"));
  assert.ok(lookupWord("activities"));
});
