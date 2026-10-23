import test from "node:test";
import assert from "node:assert/strict";
import { DICTIONARY, lookupWord, lookupWordInContext, tokenizeStory, splitEnglishSentences } from "./learning-core.js";
import { readFile } from "node:fs/promises";
import { VOCABULARY_CATEGORIES } from "./curriculum.js";

const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const css = await readFile(new URL("./styles.css", import.meta.url), "utf8");
const dictionarySource = await readFile(new URL("./dictionary.js", import.meta.url), "utf8");

test("sentence segmentation does not split English titles or quoted sentence endings", () => {
  const sentences = splitEnglishSentences('Mr. Daniel spoke to Ms. Khin. "Be careful!" Lina said. The river rose.');
  assert.deepEqual(sentences.map((sentence) => sentence.text), [
    "Mr. Daniel spoke to Ms. Khin.",
    '"Be careful!"',
    "Lina said.",
    "The river rose."
  ]);
  assert.deepEqual(sentences.map((sentence) => sentence.index), [0, 1, 2, 3]);
  for (const sentence of sentences) {
    assert.equal(sentence.text, 'Mr. Daniel spoke to Ms. Khin. "Be careful!" Lina said. The river rose.'.slice(sentence.start, sentence.end).trim());
  }
});

test("Listening word context and sentence translation use the same sentence segmentation helper", () => {
  assert.match(app, /function sentenceAtOffset\(paragraph, offset\) \{\s*const sentences = splitEnglishSentences\(paragraph\)/);
  assert.match(app, /const englishSentences = splitEnglishSentences\(paragraph\)/);
});

test("Listening story selection accepts the existing joined text and legacy paragraph arrays", () => {
  const routeStart = app.indexOf('if (activeListeningStoryId !== selected.id)');
  const routeEnd = app.indexOf('library.hidden = true;', routeStart);
  assert.ok(routeStart >= 0 && routeEnd > routeStart, "Listening story selection route should exist");
  const source = app.slice(routeStart, routeEnd);
  assert.match(source, /story = typeof selected\.text === "string" \? selected\.text : selected\.text\.join\("\\n\\n"\);/);
  assert.match(source, /currentStoryParagraphIndex = 0;/);
  assert.match(source, /renderStory\(\);/);
});

test("paragraph translation refreshes during manual navigation and automatic narration", () => {
  assert.match(app, /function refreshCurrentStoryTranslation\(\) \{\s*const selected = LISTENING_STORIES\.find\(\(item\) => item\.id === activeListeningStoryId\);\s*if \(selected\) renderStoryTranslation\(selected\);\s*\}/);
  const speakStart = app.indexOf("function speakStory()");
  const speakEnd = app.indexOf("\nfunction startSpeakingPractice()", speakStart);
  const speak = app.slice(speakStart, speakEnd);
  assert.match(speak, /currentStoryParagraphIndex = paragraph\.index;[\s\S]*?renderStory\(\);\s*refreshCurrentStoryTranslation\(\);/);
  const prevStart = app.indexOf('$("#story-previous").addEventListener("click"');
  const nextStart = app.indexOf('$("#story-next").addEventListener("click"');
  const closeStart = app.indexOf('$("#close-word").addEventListener("click"');
  assert.match(app.slice(prevStart, nextStart), /renderStory\(\);\s*refreshCurrentStoryTranslation\(\);/);
  assert.match(app.slice(nextStart, closeStart), /renderStory\(\);\s*refreshCurrentStoryTranslation\(\);/);
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

test("spoken-word highlighting is visibly styled, accessible, and scrolls into view", () => {
  const start = app.indexOf("function highlightSpeechWord(charIndex)");
  const end = app.indexOf("\nfunction getStoryParagraphs()", start);
  assert.ok(start >= 0 && end > start, "speech highlight helper should exist");
  const source = app.slice(start, end);
  assert.match(source, /active\.classList\.add\("speech-current-word"\)/);
  assert.match(source, /active\.setAttribute\("aria-current", "true"\)/);
  assert.match(source, /scrollIntoView\(\{ block: "nearest", behavior: "smooth" \}\)/);
  assert.match(css, /\.speech-current-word\s*\{[^}]*background:\s*#ffe58a/s);
  assert.match(css, /#lesson-text \.lesson-word\.speech-current-word:focus-visible/);
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
  const appText = await readFile(new URL("./app.js", import.meta.url), "utf8");
  const storyStart = appText.indexOf('id: "garden-bird"');
  const storyEnd = appText.indexOf("\n  },", storyStart);
  const story = appText.slice(storyStart, storyEnd);
  const textStart = story.indexOf("text: [");
  const textEnd = story.indexOf("].join", textStart);
  const paragraphs = [...story.slice(textStart, textEnd).matchAll(/^\s*("(?:\\.|[^"\\])*")\s*,?\s*$/gm)]
    .map((match) => JSON.parse(match[1]));
  const missing = [...new Set(tokenizeStory(paragraphs.join(" ")).filter((token) => token.word).map((token) => token.word).filter((word) => !lookupWord(word)))];
  assert.deepEqual(missing, [], "Every word in Maya’s Garden should have a Myanmar dictionary entry");
});

test("every tappable word in The River That Remembered resolves to an offline dictionary entry", () => {
  const storyStart = app.indexOf('id: "river-remembers"');
  assert.ok(storyStart >= 0, "River story should exist in Listening");
  const storyEnd = app.indexOf("\n  },", storyStart);
  const story = app.slice(storyStart, storyEnd);
  const textStart = story.indexOf("text: [");
  const textEnd = story.indexOf("].join", textStart);
  assert.ok(textStart >= 0 && textEnd > textStart, "River story text should be readable by the regression check");
  const paragraphs = [...story.slice(textStart, textEnd).matchAll(/^\s*("(?:\\.|[^"\\])*")\s*,?\s*$/gm)]
    .map((match) => JSON.parse(match[1]));
  assert.equal(paragraphs.length, 35, "River story paragraphs should remain available for vocabulary audit");
  const missing = [...new Set(tokenizeStory(paragraphs.join(" ")).filter((token) => token.word).map((token) => token.word).filter((word) => !lookupWord(word)))];
  assert.deepEqual(missing, [], "Every clickable River story word must have an offline dictionary entry");
});

test("curly apostrophe possessives remain tappable and reuse the base-word meaning", () => {
  const tokens = tokenizeStory("Lina’s notebook and the river’s level.");
  assert.equal(tokens.find((token) => token.text === "Lina’s").word, "lina's");
  assert.equal(lookupWord("Lina’s"), DICTIONARY.lina);
  assert.equal(lookupWord("river’s"), DICTIONARY.river);
});


test("every clickable word in every Listening story resolves in the shared offline dictionary", () => {
  const storyRefs = [...app.matchAll(/id:\s*"([^"]+)",\s*title:\s*"([^"]+)"/g)];
  assert.equal(storyRefs.length, 7, "all seven Listening stories should be audited");
  for (let i = 0; i < storyRefs.length; i += 1) {
    const storyStart = storyRefs[i].index;
    const storyEnd = i + 1 < storyRefs.length ? storyRefs[i + 1].index : app.length;
    const story = app.slice(storyStart, storyEnd);
    const textStart = story.indexOf("text: [");
    const textEnd = story.indexOf("].join", textStart);
    assert.ok(textStart >= 0 && textEnd > textStart, storyRefs[i][2] + " should have readable story text");
    const paragraphs = [...story.slice(textStart, textEnd).matchAll(/^\s*("(?:\\.|[^"\\])*")\s*,?\s*$/gm)]
      .map((match) => JSON.parse(match[1]));
    const missing = [...new Set(tokenizeStory(paragraphs.join(" ")).filter((token) => token.word).map((token) => token.word).filter((word) => !lookupWord(word)))];
    assert.deepEqual(missing, [], storyRefs[i][2] + " has clickable words missing from the shared dictionary");
  }
});


test("word tap triggers only one pronunciation request", () => {
  const showStart = app.indexOf("function showWord(");
  const showEnd = app.indexOf("\nfunction setLanguage(", showStart);
  const showSource = app.slice(showStart, showEnd);
  assert.ok(showStart >= 0 && showEnd > showStart, "word detail renderer should exist");
  assert.ok(!showSource.includes("pronounceWord(word)"), "showWord should not speak automatically because the click handler owns pronunciation");
  assert.ok(app.includes("showWord(part.word, wordParagraphIndex);\n      pronounceWord(part.word);"), "tapping a word should display its details and request pronunciation exactly once");
});


test("shared dictionary keys are unique and every entry has complete English and Myanmar fields", async () => {
  const dictionarySource = await readFile(new URL("./dictionary.js", import.meta.url), "utf8");
  const keys = [...dictionarySource.matchAll(/^\s{2}([a-z][a-z'-]*):\s*\{/gm)].map((match) => match[1]);
  assert.ok(keys.length > 0, "shared dictionary should contain entries");
  assert.equal(new Set(keys).size, keys.length, "shared dictionary source must not contain duplicate keys");

  for (const key of keys) {
    const entry = DICTIONARY[key];
    assert.ok(entry, `dictionary entry should export: ${key}`);
    assert.equal(typeof entry.meaning, "string", `${key} should have an English meaning`);
    assert.ok(entry.meaning.trim(), `${key} English meaning must not be empty`);
    assert.equal(typeof entry.usage, "string", `${key} should have an example sentence`);
    assert.ok(entry.usage.trim(), `${key} example sentence must not be empty`);
    assert.equal(typeof entry.my, "string", `${key} should have a Myanmar meaning`);
    assert.ok(entry.my.trim(), `${key} Myanmar meaning must not be empty`);
  }
});


test("ambiguous Listening vocabulary includes the story-relevant senses", () => {
  const rose = DICTIONARY.rose;
  assert.ok(rose, "rose should be available in the shared dictionary");
  assert.match(rose.meaning, /past tense of rise/i);
  assert.match(rose.meaning, /flower/i);
  assert.match(rose.usage, /river rose/i);
  assert.match(rose.usage, /rose grew in the garden/i);
  assert.match(rose.my, /မြင့်တက်လာခဲ့သည်/);
  assert.match(rose.my, /နှင်းဆီပန်း/);
});


test("rose context distinguishes a flower held in a hand from a hand moving upward", () => {
  const flower = lookupWordInContext("rose", "She carried a rose in her hand.");
  assert.match(flower.meaning, /flowering plant/i);
  assert.equal(flower.my, "နှင်းဆီပန်း");

  const movement = lookupWordInContext("rose", "Her hand rose slowly above her head.");
  assert.match(movement.meaning, /past tense of rise/i);
  assert.match(movement.my, /မြင့်တက်လာခဲ့သည်/);
});


test("shared dictionary covers multiple senses used by Listening story context", () => {
  assert.match(DICTIONARY.close.meaning, /near in distance/i);
  assert.match(DICTIONARY.close.meaning, /shut something/i);
  assert.match(DICTIONARY.light.meaning, /not heavy/i);
  assert.match(DICTIONARY.light.meaning, /small in amount/i);
  assert.match(DICTIONARY.kind.meaning, /type or sort/i);
  assert.match(DICTIONARY.kind.meaning, /care and concern/i);
  assert.match(DICTIONARY.change.meaning, /become different/i);
  assert.match(DICTIONARY.change.meaning, /money returned/i);
  assert.match(DICTIONARY.present.meaning, /being in a place/i);
  assert.match(DICTIONARY.present.meaning, /show or explain/i);
});



test("context-aware lookup keeps possessive names and inflected verbs context-correct", () => {
  assert.match(lookupWordInContext("Rose's", "Ms Rose's class visited the town museum.").my, /လူအမည်/);
  assert.match(lookupWordInContext("changed", "She changed her daily routine.").my, /ပြောင်းလဲ/);
});

test("context-aware lookup distinguishes common story senses for kind, left, mean, like, and still", () => {
  assert.match(lookupWordInContext("kind", "Lina's grandmother offered another kind of evidence.").my, /အမျိုးအစား/);
  assert.match(lookupWordInContext("left", "She planted flowers and left a small patch of soil for insects.").my, /ချန်ထားခဲ့သည်/);
  assert.match(lookupWordInContext("mean", "Her notes helped explain why sunshine did not mean the river was safe.").my, /ဆိုလိုသည်/);
  assert.match(lookupWordInContext("like", "Wetlands acted like natural bowls.").my, /ကဲ့သို့/);
  assert.match(lookupWordInContext("still", "Maya made sure there was still room for every visitor.").my, /ကျန်ရှိနေသေးသော/);
});

test("context-aware lookup identifies presentation verbs separately from being present", () => {
  assert.match(lookupWordInContext("presented", "Lina and her classmates presented their findings at the meeting.").my, /တင်ပြခဲ့သည်/);
  assert.match(lookupWordInContext("present", "The students recorded readings with an adult present.").my, /ရောက်ရှိနေသော/);
});

test("context-aware lookup resolves river, importance, and effort vocabulary", () => {
  assert.match(lookupWordInContext("bank", "Lina counted marks on a stone near the bank.").my, /မြစ်ကမ်းပါး/);
  assert.match(lookupWordInContext("current", "The bridge was closed because the current was too strong.").my, /ရေစီးအား/);
  assert.match(lookupWordInContext("level", "The river level rose overnight.").my, /ရေအမြင့်/);
  assert.match(lookupWordInContext("mattered", "Lina wondered why that open area mattered.").my, /အရေးပါခဲ့သည်/);
  assert.match(lookupWordInContext("hard", "Careful observation was as important as hard work.").my, /ကြိုးစားအားထုတ်မှု/);
});

test("context-aware lookup distinguishes water, plant, records, and changes by usage", () => {
  assert.match(lookupWordInContext("water", "The river gave the town drinking water, fish, and fertile soil.").my, /^ရေ$/);
  assert.match(lookupWordInContext("water", "Maya decided to water the garden early.").my, /ရေလောင်းသည်/);
  assert.match(lookupWordInContext("watered", "Maya watered the plants before sunrise.").my, /ရေလောင်းခဲ့သည်/);
  assert.match(lookupWordInContext("plant", "They proposed to plant suitable trees along the bank.").my, /စိုက်ပျိုးသည်/);
  assert.match(lookupWordInContext("plant", "Each plant needs care.").my, /^အပင်$/);
  assert.match(lookupWordInContext("records", "Together they checked the records and found a route.").my, /^မှတ်တမ်းများ$/);
  assert.match(lookupWordInContext("changed", "Grandmother helped her change her routine.").my, /ပြောင်းလဲခဲ့သည်/);
  assert.match(lookupWordInContext("changes", "Lina noticed these changes near the river.").my, /^ပြောင်းလဲမှုများ$/);
});

test("context-aware word lookup selects the sense supported by the tapped sentence", () => {
  assert.match(lookupWordInContext("rose", "The river rose after heavy rain.").my, /မြင့်တက်လာခဲ့သည်/);
  assert.match(lookupWordInContext("rose", "A red rose grew in the garden.").my, /နှင်းဆီပန်း/);
  assert.match(lookupWordInContext("rose", "A beautiful rose near the river looked lovely.").my, /နှင်းဆီပန်း/);
  assert.match(lookupWordInContext("looking", "Looking back, I learned from my mistake.").my, /အတိတ်ကို ပြန်လည်စဉ်းစားကြည့်ခြင်း/);
  assert.match(lookupWordInContext("back", "Looking back, I learned from my mistake.").my, /အတိတ်ကို ပြန်လည်စဉ်းစားကြည့်သည်/);
  assert.match(lookupWordInContext("looked", "She looked back at the house.").my, /နောက်ဘက်သို့ လှည့်ကြည့်ခဲ့သည်/);
  assert.match(lookupWordInContext("back", "She looked back at the house.").my, /နောက်ဘက်/);
  assert.match(lookupWordInContext("saw", "They saw the bird in the tree.").my, /မြင်တွေ့ခဲ့သည်/);
  assert.match(lookupWordInContext("saw", "The carpenter used a saw to cut wood.").my, /လွှ/);
  assert.match(lookupWordInContext("well", "The village well supplied water.").my, /ရေတွင်း/);
  assert.match(lookupWordInContext("well", "The students worked well together.").my, /ကောင်းစွာ/);
  assert.match(lookupWordInContext("found", "Lina found the puppy near the market.").my, /တွေ့ရှိခဲ့သည်/);
  assert.match(lookupWordInContext("change", "Mr Lin returned the correct change.").my, /ပြန်အမ်းငွေ/);
  assert.match(lookupWordInContext("change", "She changed her daily routine.").my, /ပြောင်းလဲသည်/);
  assert.match(lookupWordInContext("means", "Caring for nature means asking questions.").my, /ဆိုလိုသည်/);
  assert.match(lookupWordInContext("rose", "Ms Rose's class visited the town museum.").my, /လူအမည်/);
  assert.match(lookupWordInContext("well", "a well-intentioned warning").my, /ရည်ရွယ်ချက်ကောင်း/);
  assert.match(lookupWordInContext("light", "After a light shower, streams ran across the earth.").my, /မိုးဖွဲဖွဲ/);
  assert.match(lookupWordInContext("close", "new houses were built close to the water").my, /နီးသော/);
  assert.match(lookupWordInContext("present", "With their teacher present, they spoke to shopkeepers.").my, /ရောက်ရှိနေသော/);
  assert.match(lookupWordInContext("back", "Back at school, the class shared what they had learned.").my, /ပြန်လည်ရောက်ရှိသောအခါ/);
  assert.match(lookupWordInContext("back", "the year written on its back").my, /နောက်ကျောဘက်တွင်/);
});

test("shared dictionary preserves common ambiguous word senses found in Listening stories", () => {
  assert.match(DICTIONARY.lives.meaning, /is alive|resides/i);
  assert.match(DICTIONARY.lives.meaning, /plural of life/i);
  assert.match(DICTIONARY.saw.meaning, /past tense of see/i);
  assert.match(DICTIONARY.saw.meaning, /tool used for cutting wood/i);
  assert.match(DICTIONARY.found.meaning, /past tense of find/i);
  assert.match(DICTIONARY.means.meaning, /method or way/i);
  assert.match(DICTIONARY.well.meaning, /good or satisfactory way/i);
  assert.match(DICTIONARY.well.meaning, /hole for water/i);
  assert.ok(lookupWord("lives") === DICTIONARY.lives, "exact inflected form should win over the generic irregular mapping");
  assert.ok(lookupWord("saw") === DICTIONARY.saw, "exact word should retain its contextual senses");
  assert.ok(lookupWord("found") === DICTIONARY.found, "exact word should retain its contextual senses");
  assert.ok(lookupWord("means") === DICTIONARY.means, "exact word should retain its contextual senses");
});


test("canceled word-pronunciation events cannot overwrite the status of newer speech", () => {
  assert.match(app, /let activeWordUtterance = null;/);
  const start = app.indexOf("function pronounceWord(word)");
  const end = app.indexOf("\nfunction sentenceAtOffset(", start);
  assert.ok(start >= 0 && end > start, "pronounceWord should be defined");
  const source = app.slice(start, end);
  assert.match(source, /activeWordUtterance = utterance;/);
  assert.match(source, /utterance\.onend = \(\) => \{\s*if \(activeWordUtterance === utterance\) activeWordUtterance = null;/);
  assert.match(source, /utterance\.onerror = \(\) => \{\s*if \(activeWordUtterance !== utterance\) return;/);
  assert.match(source, /activeWordUtterance = null;[\s\S]*?window\.speechSynthesis\.cancel\(\);/);
  const stopStart = app.indexOf("function stopStoryNarration()");
  const stopEnd = app.indexOf("\nfunction clearSpeechHighlight()", stopStart);
  assert.match(app.slice(stopStart, stopEnd), /activeWordUtterance = null;/);
});

test("Listening word pronunciation selects an English voice and uses an English locale fallback", () => {
  const start = app.indexOf("function selectedEnglishVoice()");
  const end = app.indexOf("\nif (\"speechSynthesis\" in window)", start);
  assert.ok(start >= 0 && end > start, "English voice selection helper should exist");
  const voiceSource = app.slice(start, end);
  assert.match(voiceSource, /\^en\(\[_-\]\|\$\)/i, "only English-language voices should be selected");
  assert.match(voiceSource, /en-US/i, "US English should be the explicit fallback preference");
  const pronounceStart = app.indexOf("function pronounceWord(word)");
  const pronounceEnd = app.indexOf("\nfunction sentenceAtOffset", pronounceStart);
  const pronounceSource = app.slice(pronounceStart, pronounceEnd);
  assert.match(pronounceSource, /utterance\.lang = voice\?\.lang \|\| \"en-US\"/);
  assert.match(pronounceSource, /window\.speechSynthesis\.cancel\(\)/, "a new word request should cancel overlapping speech");
  assert.match(pronounceSource, /clampSpeechRate\(/, "speech speed should use the validated rate");
});

test("Shared dictionary covers common words and keeps name translations reusable", () => {
  for (const word of ["town", "books", "into", "stood", "used", "damaged", "higher", "felt", "understood", "leaving", "thanked", "prepared", "quickly", "village", "lina", "nora", "ben", "daniel", "milo"]) {
    assert.ok(lookupWord(word), "shared dictionary should include " + word);
  }
});

test("every English word in all seven Listening stories resolves through the shared dictionary", () => {
  const storiesStart = app.indexOf("const LISTENING_STORIES = [");
  const arrayStart = app.indexOf("[", storiesStart);
  const storiesSource = findBalancedBlock(app, arrayStart, "[", "]");
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
    if (char === '"' || char === "'" || char === "`") {
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

  assert.equal(storyBlocks.length, 7, "expected the seven current Listening stories");
  const missingByStory = [];
  for (const block of storyBlocks) {
    const id = block.match(/id: *"([^"]+)"/)?.[1] ?? "unknown";
    const words = countArrayStringEntries(block, "text")
      .join(" ")
      .match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) ?? [];
    const missing = [...new Set(words.map((word) => word.toLowerCase()))]
      .filter((word) => !lookupWord(word));
    if (missing.length) missingByStory.push({ id, missing });
  }
  assert.deepEqual(missingByStory, [], "every story word should resolve, with no missing words: " + JSON.stringify(missingByStory));
});

test("shared dictionary contains no duplicate English headword declarations", () => {
  const seen = new Set();
  const duplicates = [];
  for (const [, word] of dictionarySource.matchAll(/^\s{2}"?([a-z'-]+)"?:\s*\{/gm)) {
    if (seen.has(word)) duplicates.push(word);
    seen.add(word);
  }
  assert.deepEqual(duplicates, [], "duplicate headwords cause silent last-entry-wins translation changes");
});

test("Listening Myanmar translations preserve key safety and everyday meanings", () => {
  assert.match(app, /လိုက်ဖမ်းရင်း ယာဉ်သွားလာနေသော လမ်းထဲသို့ မလိုက်သွားရန်/);
  assert.doesNotMatch(app, /ယာဉ်အသွားအလာထဲသို့ မောင်းလိုက်ခြင်း/);
  assert.match(app, /မည်မျှမကြာခဏ တီးလေ့ရှိခဲ့သလဲ/);
  assert.match(app, /စာအုပ်ငှားရန်သာမက အခြားလုပ်ငန်းများအတွက်ပါ အသုံးဝင်သောနေရာ/);
  assert.match(app, /ရေထည့်ထားသော ပန်းကန်တိမ်တိမ်မှ ရေသောက်ရန်/);
});

test("common Listening past-tense words retain past-tense Myanmar meanings", () => {
  const expected = {
    explained: /ရှင်းပြခဲ့သည်/,
    showed: /ပြသခဲ့သည်/,
    compared: /နှိုင်းယှဉ်ခဲ့သည်/,
    noticed: /သတိပြုမိခဲ့သည်/,
    agreed: /သဘောတူခဲ့သည်/,
    called: /ခေါ်ခဲ့သည်|ဖုန်းဆက်ခဲ့သည်/,
    shared: /မျှဝေခဲ့သည်/,
    worked: /လုပ်ဆောင်ခဲ့သည်|အလုပ်လုပ်ခဲ့သည်/,
    repaired: /ပြုပြင်ခဲ့သည်/,
    displayed: /ပြသခဲ့သည်/,
    gathered: /စုဆောင်းခဲ့သည်|စုပုံခဲ့သည်/,
    confirmed: /အတည်ပြုခဲ့သည်/,
    updated: /ပြင်ဆင်မွမ်းမံခဲ့သည်/,
    visited: /သွားရောက်လည်ပတ်ခဲ့သည်/,
    discussed: /ဆွေးနွေးခဲ့သည်/,
    recognised: /မှတ်မိခဲ့သည်|ခွဲခြားသိရှိခဲ့သည်/
  };
  for (const [word, meaning] of Object.entries(expected)) {
    assert.match(lookupWord(word)?.my ?? "", meaning, word + " should keep its past-tense meaning");
  }
});

test("contextual lookup distinguishes closed places, phone calls, and presented findings", () => {
  assert.match(lookupWordInContext("closed", "Lina heard a whimper near a closed shop.").my, /^ပိတ်ထားသော$/);
  assert.match(lookupWordInContext("closed", "The bridge had been closed because the current was too strong.").my, /ပိတ်ထားသည်/);
  assert.match(lookupWordInContext("called", "He called the number on the tag.").my, /^ဖုန်းဆက်ခဲ့သည်$/);
  assert.match(lookupWordInContext("called", "The girl called its name, Milo.").my, /အမည်ဖြင့် ခေါ်ခဲ့သည်/);
  assert.match(lookupWordInContext("presented", "The students presented their findings to officials.").my, /^တင်ပြခဲ့သည်$/);
  assert.match(lookupWordInContext("mattered", "Lina wondered why the open area mattered.").my, /^အရေးပါခဲ့သည်$/);
});

test("context-aware lookup resolves gerunds and participles in common Listening phrases", () => {
  assert.match(lookupWordInContext("meeting", "The school marked a safe meeting point.").my, /တွေ့ဆုံရာနေရာ/);
  assert.match(lookupWordInContext("drinking", "The shelter provided drinking water.").my, /^သောက်သုံးရေ$/);
  assert.match(lookupWordInContext("standing", "The bridge was still standing after the storm.").my, /မပြိုမလဲ ကျန်ရှိနေသော/);
  assert.match(lookupWordInContext("moving", "They listened to water moving under thin sheets of ice.").my, /စီးဆင်းနေသော/);
});

test("plural noun lookup handles adjective-led story phrases", () => {
  assert.match(lookupWordInContext("questions", "They prepared a short questionnaire with simple questions.").my, /မေးခွန်းများ/);
  assert.match(lookupWordInContext("apples", "Nora picked firm apples without bruises.").my, /ပန်းသီးများ/);
  assert.match(lookupWordInContext("desks", "Children learned in a classroom with wooden desks.").my, /စားပွဲများ/);
  assert.match(lookupWordInContext("routes", "The map showed safe routes to higher ground.").my, /လမ်းကြောင်းများ/);
});

test("plural noun lookup handles safety and everyday vocabulary phrases", () => {
  assert.match(lookupWordInContext("adults", "Students should ask trusted adults for help.").my, /လူကြီးများ/);
  assert.match(lookupWordInContext("books", "Children chose picture books at the library.").my, /စာအုပ်များ/);
  assert.match(lookupWordInContext("sellers", "Fruit sellers answered Nora's questions.").my, /ရောင်းသူများ/);
  assert.match(lookupWordInContext("workers", "Health workers checked the warning signs.").my, /အလုပ်သမားများ|ဝန်ထမ်းများ/);
  assert.match(lookupWordInContext("tools", "Maya stored her garden tools carefully.").my, /ကိရိယာများ/);
});

test("context-aware lookup preserves plural nouns without pluralizing third-person verbs", () => {
  assert.match(lookupWordInContext("students", "The students compared maps and photographs.").my, /ကျောင်းသားများ/);
  assert.match(lookupWordInContext("trees", "They planted suitable trees along the bank.").my, /^သစ်ပင်များ$/);
  assert.match(lookupWordInContext("flowers", "Maya waters the flowers.").my, /^ပန်းများ$/);
  assert.match(lookupWordInContext("waters", "Maya waters the flowers.").my, /^ရေလောင်းသည်$/);
});

test("dictionary returns correct plural forms for children and contextual mistakes", () => {
  assert.equal(lookupWord("children")?.my, "ကလေးများ");
  assert.equal(lookupWordInContext("mistakes", "The town learned from its mistakes.").my, "အမှားများ");
});

test("context-aware lookup distinguishes address nouns and verbs and plural nouns", () => {
  assert.match(lookupWordInContext("addresses", "The map did not include private home addresses.").my, /^လိပ်စာများ$/);
  assert.match(lookupWordInContext("addresses", "The plan addresses the town's need for clear warnings.").my, /^ကိုင်တွယ်ဖြေရှင်းသည်$/);
  assert.match(lookupWordInContext("mistakes", "The town learned from its mistakes.").my, /အမှားများ/);
});

test("common Listening participles and gerunds have standalone dictionary entries", () => {
  assert.match(lookupWord("rising")?.my ?? "", /မြင့်တက်လာသော/);
  assert.match(lookupWord("missing")?.my ?? "", /ပျောက်ဆုံးနေသော/);
  assert.match(lookupWord("meeting")?.my ?? "", /အစည်းအဝေး/);
  assert.match(lookupWord("recording")?.my ?? "", /မှတ်တမ်းတင်ခြင်း/);
  assert.match(lookupWord("learning")?.my ?? "", /သင်ယူခြင်း/);
  assert.match(lookupWord("children")?.my ?? "", /^ကလေးများ$/);
});

test("sentence-by-sentence Myanmar translation aligns with every English sentence in all Listening stories", () => {
  const storiesStart = app.indexOf("const LISTENING_STORIES = [");
  const arrayStart = app.indexOf("[", storiesStart);
  const storiesSource = findBalancedBlock(app, arrayStart, "[", "]");
  const storyBlocks = [];
  let quote = null;
  let escaped = false;
  let depth = 0;
  let objectStart = -1;
  for (let index = 0; index < storiesSource.length; index += 1) {
    const char = storiesSource[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") {
      if (depth === 0) objectStart = index;
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0 && objectStart >= 0) {
        storyBlocks.push(storiesSource.slice(objectStart, index + 1));
        objectStart = -1;
      }
    }
  }

  assert.equal(storyBlocks.length, 7, "all seven Listening stories should be checked");
  for (const block of storyBlocks) {
    const id = block.match(/id:\s*"([^"]+)"/)?.[1] ?? "unknown";
    const english = countArrayStringEntries(block, "text");
    const myanmar = countArrayStringEntries(block, "paragraphTranslations");
    assert.equal(myanmar.length, english.length, id + " should translate every paragraph");
    for (let index = 0; index < english.length; index += 1) {
      const englishCount = splitEnglishSentences(english[index]).length;
      const myanmarCount = myanmar[index].split(/[။.]+/).map((part) => part.trim()).filter(Boolean).length;
      assert.equal(myanmarCount, englishCount, id + " paragraph " + (index + 1) + " must have one Myanmar translation segment per English sentence");
    }
  }
});



test("Listening Myanmar translations preserve the meaning of nearby people and museum questions", () => {
  const puppyStart = app.indexOf('id: "lost-puppy"');
  const puppyEnd = app.indexOf("\n  },", puppyStart);
  assert.ok(puppyStart >= 0 && puppyEnd > puppyStart, "Lost Puppy story should exist");
  const puppy = app.slice(puppyStart, puppyEnd);
  assert.match(puppy, /အနီးအနားတွင် လူတစ်ဦးမျှ မရှိပါ/);
  assert.doesNotMatch(puppy, /အနီးတွင် ပိုင်ရှင်မရှိပါ/);

  const museumStart = app.indexOf('id: "school-trip"');
  const museumEnd = app.indexOf("\n  },", museumStart);
  assert.ok(museumStart >= 0 && museumEnd > museumStart, "Museum story should exist");
  const museum = app.slice(museumStart, museumEnd);
  assert.match(museum, /ပြတိုက်က အဖြေရှာရာတွင် ကူညီပေးနိုင်မည့် မေးခွန်းနှစ်ခု/);
  assert.doesNotMatch(museum, /ပြတိုက်က ဖြေရှင်းပေးနိုင်မည့် မေးခွန်းနှစ်ခု/);
  assert.match(museum, /ခေတ်မီစက်များ အသုံးများမလာမီ/);
  assert.match(museum, /ကလေးတွေကို သင်ခန်းစာတက်ဖို့ ခေါ်ပြီး အစည်းအဝေးစတော့မယ့်အချိန်မှာ လူတွေကို သတိပေးဖို့/);
  assert.doesNotMatch(museum, /ခေတ်မီစက်များ မပေါ်ပေါက်မီ/);
  assert.match(puppy, /ခွေးကလေးသည် တုန်နေခြင်း ရပ်သွားပြီး/);

  const riverStart = app.indexOf('id: "river-remembers"');
  const riverEnd = app.indexOf("\n\n];", riverStart);
  assert.ok(riverStart >= 0 && riverEnd > riverStart, "River story should exist");
  const river = app.slice(riverStart, riverEnd);
  assert.match(river, /ရေစီးသန်ပြီး အန္တရာယ်ရှိသော ရေထဲသို့ မဝင်ရ/);
  assert.match(river, /ကြည်လင်နေသောရေသည်ပင် သောက်သုံးရန် ဘေးကင်းမည်ဟု မဆိုနိုင်ကြောင်း/);
  assert.match(river, /သောက်ရေထောက်ပံ့မှု အခြေအနေကို စစ်ဆေး/);
  assert.doesNotMatch(river, /အန္တရာယ်ရှိအောင် မြန်မြန်စီးနေသောရေထဲသို့/);
});


test("contextual dictionary distinguishes a current contact number from river current and a bell calling people", () => {
  const contact = lookupWordInContext("current", "Her family put a current contact number on their own pet's tag.");
  assert.match(contact.meaning, /up-to-date/);
  assert.match(contact.my, /လက်ရှိအသုံးပြုနေသော/);

  const river = lookupWordInContext("current", "The bridge was closed because the current was too strong.");
  assert.match(river.meaning, /flow of water/);
  assert.match(river.my, /ရေစီးအား/);

  const bell = lookupWordInContext("called", "He learned that the bell called children to lessons and warned people when a meeting was about to begin.");
  assert.match(bell.meaning, /summoned or signaled people/);
  assert.match(bell.my, /ခေါ်ယူခဲ့သည်/);
});


test("contextual dictionary distinguishes looking at something from looking a certain way", () => {
  const lookedClear = lookupWordInContext("looked", "She explained that water that looked clear could still be unsafe.");
  assert.match(lookedClear.meaning, /appeared or seemed/);
  assert.match(lookedClear.my, /ပုံရသည်/);

  const lookedAt = lookupWordInContext("looked", "The puppy stopped shaking and looked at her.");
  assert.match(lookedAt.my, /ကြည့်/);
  assert.doesNotMatch(lookedAt.my, /ပုံရသည်/);

  const changedLives = lookupWordInContext("changed", "The building changed their lives.");
  assert.match(changedLives.meaning, /affected or altered people's lives/);
  assert.match(changedLives.my, /ဘဝများကို ပြောင်းလဲစေခဲ့သည်/);
});


test("direct uses a natural Myanmar meaning when describing rainwater flow", () => {
  const direct = lookupWordInContext("direct", "Wetlands can direct rainwater more slowly toward streams.");
  assert.match(direct.meaning, /guide or control the course/);
  assert.match(direct.my, /လမ်းကြောင်းကို ထိန်းညှိသည်/);
});

test("river-story vocabulary distinguishes a staff gauge from school staff and a drainage screen from a display screen", () => {
  const gauge = lookupWordInContext("staff", "Ms Khin showed them a safe staff gauge fixed beside a protected viewing platform.");
  assert.match(gauge.meaning, /marked pole or measuring device/);
  assert.match(gauge.my, /ရေအမြင့်တိုင်းတာရန်/);

  const workers = lookupWordInContext("staff", "The school staff checked the emergency plan.");
  assert.match(workers.meaning, /people who work for an organisation/);
  assert.match(workers.my, /ဝန်ထမ်းများ/);

  const drainScreen = lookupWordInContext("screen", "The town council agreed to repair the damaged drainage screen.");
  assert.match(drainScreen.meaning, /grate or barrier/);
  assert.match(drainScreen.my, /ရေထုတ်ပေါက်တွင် အမှိုက်များ မဝင်စေရန် တပ်ဆင်ထားသော ဇကာ/);

  const displayScreen = lookupWordInContext("screen", "She looked at the computer screen.");
  assert.match(displayScreen.meaning, /surface that displays images or information/);
  assert.match(displayScreen.my, /မျက်နှာပြင်/);
});


test("tapping another story word dismisses the open card without opening a replacement on the same tap", () => {
  assert.match(app, /let dismissedWordButton = null/);
  assert.match(app, /if \(dismissedWordButton === button\) \{\s*dismissedWordButton = null;\s*return;/);
  assert.match(app, /if \(tappedWord\) \{\s*\/\/ Dismiss the existing card on this tap; require a separate tap to open another word\.\s*dismissedWordButton = tappedWord;\s*card\.hidden = true;\s*return;/);
});


test("service worker refreshes the app shell cache and includes the shared offline dictionary", async () => {
  const sw = await readFile(new URL("./sw.js", import.meta.url), "utf8");
  assert.match(sw, /CACHE_NAME\s*=\s*"learning-everyday-shell-v42"/);
  assert.match(sw, /APP_SHELL\s*=\s*\[[^\]]*"\.\/dictionary\.js"/s);
});

test("every shared dictionary entry has a non-empty Myanmar meaning", () => {
  const missing = Object.entries(DICTIONARY)
    .filter(([word, entry]) => !entry || typeof entry.my !== "string" || !entry.my.trim())
    .map(([word]) => word);
  assert.deepEqual(missing, [], "all offline dictionary entries should include a Myanmar meaning");
});


test("all topic vocabulary translations are available from the shared offline dictionary without duplicate headwords", () => {
  const sourceKeys = [...dictionarySource.matchAll(/^\\s{2}(?:([a-z][a-z0-9'-]*)|"([^"]+)"): \\{/gm)]
    .map((match) => (match[1] || match[2]).toLocaleLowerCase("en"));
  assert.equal(new Set(sourceKeys).size, sourceKeys.length, "dictionary headwords, including multi-word phrases, must not be duplicated");

  let checked = 0;
  for (const category of VOCABULARY_CATEGORIES) {
    for (const [word, translation, example] of category.words) {
      const entry = lookupWord(word);
      assert.ok(entry, `topic vocabulary should resolve in the shared dictionary: ${word}`);
      assert.ok(entry.my?.trim(), `${word} should have a Myanmar translation`);
      assert.ok(entry.meaning?.trim(), `${word} should have an English meaning`);
      assert.ok(entry.usage?.trim(), `${word} should have an example sentence`);
      checked += 1;
    }
  }
  assert.equal(checked, 320, "all 320 topic vocabulary cards should connect to the shared dictionary");
});
