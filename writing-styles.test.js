import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("print, cursive, and calligraphy animate letter stroke paths distinctly", async () => {
  const [ui, css] = await Promise.all([
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8")
  ]);
  assert.match(ui, /if \(stylePaths\.length\)/);
  assert.match(ui, /const CURSIVE_LOWERCASE_PATHS = Object\.freeze\(\{/);
  for (const letter of "abcdefghijklmnopqrstuvwxyz") {
    assert.match(ui, new RegExp("^  " + letter + ": \\[", "m"), `missing hand-authored cursive form for ${letter}`);
  }
  assert.ok(ui.includes("const CURSIVE_UPPERCASE_PATHS = Object.freeze({"));
  assert.ok(ui.includes("function cursivePathsFor(letter)"));
  assert.match(ui, /const CALLIGRAPHY_PATH_OVERRIDES = Object\.freeze\(\{/);
  assert.match(ui, /function calligraphyPathsFor\(letter\)/);
  for (const letter of ["a", "o", "f", "A", "F"]) {
    assert.match(ui, new RegExp("^  " + letter + ": \\[", "m"), `missing distinct calligraphy exemplar for ${letter}`);
  }
  assert.match(ui, /selectedStyle === "calligraphy" \? \(calligraphyPathsFor\(selectedLetter\) \?\? guide\.paths\)/);
  assert.match(ui, /selectedStyle === "calligraphy" \? calligraphyPathsFor\(selectedLetter\) : cursivePathsFor\(selectedLetter\)/);
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    assert.ok(ui.includes("  " + letter + ": ["), `missing hand-authored cursive capital for ${letter}`);
  }
  assert.ok(ui.includes('const handPaths = selectedStyle === "print" ? null : cursivePathsFor(selectedLetter)'));
  assert.match(ui, /letter-guide-strokes style-/);
  assert.match(ui, /path\.classList\.add/);
  assert.match(ui, /calligraphy-highlight/);
  assert.match(ui, /skewX\(-7\) translate\(5 0\)/);
  assert.match(ui, /function traceStrokeWidth\(style, pressure = 0\.5\)/);
  assert.match(ui, /drawTraceSegment\(context, stroke, previous, normalizedPoint/);
  assert.match(css, /\.letter-guide-strokes\.style-cursive/);
  assert.match(css, /\.letter-guide-strokes\.style-calligraphy/);
  assert.match(css, /\.letter-stroke\.calligraphy-highlight/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
