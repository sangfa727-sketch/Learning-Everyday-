import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const ui = readFileSync(new URL("./curriculum-ui.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");

test("Writing Practice exposes exactly Print and Handwriting mode controls", () => {
  assert.ok(html.includes('id="writing-mode-print"'));
  assert.ok(html.includes('id="writing-mode-handwriting"'));
  for (const id of ["writing-mode-alphabet", "hide-writing-card", "show-writing-card"]) {
    assert.ok(!html.includes(`id="${id}"`), `unexpected extra control: ${id}`);
    assert.ok(!ui.includes(`#${id}`), `unexpected listener/reference: ${id}`);
  }
  assert.equal((html.match(/id="writing-mode-(?:print|handwriting)"/g) ?? []).length, 2);
  assert.match(html, /id="handwriting-reference" class="script-reference"/);
  assert.match(html, /id="smart-writing-lab" class="curriculum-card letter-practice"/);
  assert.match(html, /Choose Print for step-by-step letter strokes, or Handwriting for cursive letter forms\./);
});

test("Print mode preserves the stroke-by-stroke guide", () => {
  assert.match(ui, /function setWritingMode\(mode\)/);
  assert.match(ui, /const printMode = mode === "print"/);
  assert.match(ui, /tools\.hidden = !printMode/);
  assert.match(ui, /selectedStyle = printMode \? "print" : "cursive"/);
  assert.match(ui, /function renderLetterGuide\(\)/);
  assert.match(ui, /const stylePaths = selectedStyle === "cursive"/);
  assert.match(html, /id="letter-animation" class="letter-animation"/);
  assert.match(html, /id="letter-alphabet-grid" class="letter-alphabet-grid"/);
  assert.match(css, /#legacy-letter-tools\s+\.letter-preview,\s*#legacy-letter-tools\s+\.tracing-board-wrap\{display:none!important\}/);
});

test("Handwriting mode retains both ruled-paper script alphabets", () => {
  assert.match(html, /Uppercase A–Z/);
  assert.match(html, /Lowercase a–z/);
  assert.equal((html.match(/class="script-letter" role="listitem"/g) ?? []).length, 52);
  assert.match(ui, /writing-mode-print.*setWritingMode\("print"\)/);
  assert.match(ui, /writing-mode-handwriting.*setWritingMode\("handwriting"\)/);
});
