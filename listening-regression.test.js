import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const css = await readFile(new URL("./styles.css", import.meta.url), "utf8");

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
