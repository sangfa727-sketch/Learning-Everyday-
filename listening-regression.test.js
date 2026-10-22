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
