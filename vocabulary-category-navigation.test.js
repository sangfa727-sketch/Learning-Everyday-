import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ui = readFileSync(new URL("./curriculum-ui.js", import.meta.url), "utf8");
const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
const sw = readFileSync(new URL("./sw.js", import.meta.url), "utf8");

test("vocabulary categories navigate to a dedicated topic route", () => {
  assert.match(ui, /location\.hash = \`#\/reading\/\$\{category\.id\}\`/);
  assert.match(ui, /function syncVocabularyRoute\(\)/);
  assert.match(ui, /VOCABULARY_CATEGORIES\.find\(\(item\) => item\.id === requestedId\)/);
});

test("vocabulary page has an explicit back-to-categories control", () => {
  assert.match(html, /id="vocabulary-back-to-categories"/);
  assert.match(ui, /location\.hash = "#\/reading"/);
  assert.match(ui, /addEventListener\("hashchange", \(\) => \{[\s\S]*?syncVocabularyRoute\(\)/);
});

test("category cards remain two columns and the selected topic gets a focused page", () => {
  assert.match(css, /\.vocabulary-topic-picker\s*\{\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /body\[data-page="reading"\]\[data-vocabulary-category\]/);
});

test("service worker shell cache is bumped for the navigation change", () => {
  assert.match(sw, /learning-everyday-shell-v42/);
});
