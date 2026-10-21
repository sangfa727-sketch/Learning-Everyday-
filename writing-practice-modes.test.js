import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const ui = readFileSync(new URL("./curriculum-ui.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");

test("Writing Practice exposes Alphabet, Print, Handwriting and Hide card controls", () => {
  for (const id of ["writing-mode-alphabet", "writing-mode-print", "writing-mode-handwriting", "hide-writing-card", "show-writing-card"]) {
    assert.ok(html.includes(`id="${id}"`), `missing ${id}`);
  }
  assert.match(html, /id="handwriting-reference" class="script-reference"/);
  assert.match(html, /id="smart-writing-lab" class="curriculum-card letter-practice"/);
});

test("Print mode restores the stroke-by-stroke guide without exposing tracing or the preview card", () => {
  assert.match(ui, /function setWritingMode\(mode\)/);
  assert.match(ui, /const printMode = mode === "print"/);
  assert.match(ui, /tools\.hidden = !printMode/);
  assert.match(ui, /selectedStyle = printMode \? "print" : "cursive"/);
  assert.match(ui, /function renderLetterGuide\(\)/);
  assert.match(ui, /const stylePaths = selectedStyle === "cursive"/);
  assert.match(html, /id="letter-animation" class="letter-animation"/);
  assert.match(html, /id="letter-alphabet-grid" class="letter-alphabet-grid"/);
  assert.ok(css.includes("#legacy-letter-tools .letter-preview,#legacy-letter-tools .tracing-board-wrap{display:none!important}"));
});

test("Handwriting mode retains both ruled-paper script alphabets and Alphabet/Hide can hide the card", () => {
  assert.match(html, /Uppercase A–Z/);
  assert.match(html, /Lowercase a–z/);
  assert.equal((html.match(/class="script-letter" role="listitem"/g) ?? []).length, 52);
  assert.match(ui, /writing-mode-alphabet.*setWritingMode\("alphabet"\)/);
  assert.match(ui, /hide-writing-card.*setWritingMode\("alphabet"\)/);
  assert.match(ui, /show-writing-card.*setWritingMode\("handwriting"\)/);
  assert.match(css, /#smart-writing-lab\[hidden\],#show-writing-card\[hidden\]\{display:none!important\}/);
});
