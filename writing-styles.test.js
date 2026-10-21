import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("cursive sample, animation, and tracing use the same Script glyph", async () => {
  const [ui, css, html] = await Promise.all([
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
    readFile(new URL("./index.html", import.meta.url), "utf8")
  ]);
  assert.match(ui, /sample\.textContent = selectedStyle === "cursive" \? \(CURSIVE_GLYPHS\[selectedLetter\] \?\? selectedLetter\)/);
  assert.match(ui, /const stylePaths = selectedStyle === "print" \? guide\.paths : selectedStyle === "calligraphy" \? \(calligraphyPathsFor\(selectedLetter\) \?\? guide\.paths\) : \[\]/);
  assert.match(ui, /glyph\.textContent = selectedStyle === "cursive" \? \(CURSIVE_GLYPHS\[selectedLetter\] \?\? selectedLetter\)/);
  assert.match(ui, /const traceGlyph = selectedStyle === "cursive" \? \(CURSIVE_GLYPHS\[selectedLetter\] \?\? selectedLetter\)/);
  assert.match(ui, /function renderAlphabetGrid\(\)/);
  assert.match(ui, /letter-alphabet-choice/);
  assert.match(ui, /Uppercase A–Z/);
  assert.match(ui, /Lowercase a–z/);
  assert.match(html, /id="letter-alphabet-grid"/);
  assert.match(css, /\.letter-template-glyph\.style-cursive/);
  assert.match(css, /trace-script-glyph/);
  assert.match(css, /letter-alphabet-row/);
  assert.match(ui, /function cursivePathsFor\(letter\)/);
  assert.match(ui, /const CALLIGRAPHY_PATH_OVERRIDES = Object\.freeze\(\{/);
  assert.match(ui, /function calligraphyPathsFor\(letter\)/);
  assert.match(ui, /const handPaths = selectedStyle === "calligraphy" \? calligraphyPathsFor\(selectedLetter\) : null/);
  assert.match(ui, /Exact Script glyph outline animation/);
  assert.match(ui, /authentic pen-stroke order is still being refined/);
  assert.match(ui, /function traceStrokeWidth\(style, pressure = 0\.5\)/);
  assert.match(ui, /drawTraceSegment\(context, stroke, previous, normalizedPoint/);
  assert.match(css, /\.letter-guide-strokes\.style-calligraphy/);
  assert.match(css, /\.letter-stroke\.calligraphy-highlight/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
