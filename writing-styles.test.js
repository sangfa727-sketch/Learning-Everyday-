import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("cursive practice animates hand-authored strokes and traces the same paths", async () => {
  const [ui, css, html] = await Promise.all([
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
    readFile(new URL("./index.html", import.meta.url), "utf8")
  ]);
  assert.match(ui, /sample\.replaceChildren\(\)/);
  assert.match(ui, /const samplePaths = cursivePathsFor\(selectedLetter\) \?\? \[\]/);
  assert.match(ui, /letter-sample-svg/);
  assert.match(ui, /letter-sample-stroke/);
  assert.match(ui, /const stylePaths = selectedStyle === "print"/);
  assert.match(ui, /cursivePathsFor\(selectedLetter\)/);
  assert.match(ui, /Cursive · \$\{visibleStrokeCount\} hand-drawn strokes animated in sequence/);
  assert.match(ui, /glyph\.textContent = selectedStyle === "cursive" \? \(CURSIVE_GLYPHS\[selectedLetter\] \?\? selectedLetter\)/);
  assert.match(ui, /Font glyph is only a fallback when no hand-authored stroke paths exist/);
  assert.match(ui, /context\.strokeText\(selectedLetter, rect\.width \/ 2, rect\.height \* 0\.76\)/);
  assert.match(ui, /function renderAlphabetGrid\(\)/);
  assert.match(ui, /letter-alphabet-choice/);
  assert.match(ui, /Uppercase A–Z/);
  assert.match(ui, /Lowercase a–z/);
  assert.match(html, /id="letter-alphabet-grid"/);
  assert.match(css, /\.letter-template-glyph\.style-cursive/);
  assert.match(css, /\.letter-sample-svg/);
  assert.match(css, /\.letter-sample-stroke/);
  assert.match(css, /@keyframes trace-script-glyph\{0%\{stroke-dashoffset:1000;fill:transparent\}82%\{stroke-dashoffset:0;fill:transparent\}100%\{stroke-dashoffset:0;fill:rgba\(71,123,98,\.08\)\}\}/);
  assert.match(css, /trace-script-glyph/);
  assert.match(css, /letter-alphabet-row/);
  assert.match(ui, /function cursivePathsFor\(letter\)/);
  assert.match(ui, /const CALLIGRAPHY_PATH_OVERRIDES = Object\.freeze\(\{/);
  assert.match(ui, /function calligraphyPathsFor\(letter\)/);
  assert.match(ui, /const handPaths = selectedStyle === "cursive"/);
  assert.match(ui, /follow the hand-drawn centerline strokes in order/);
  assert.match(ui, /function traceStrokeWidth\(style, pressure = 0\.5\)/);
  assert.match(ui, /drawTraceSegment\(context, stroke, previous, point, width, height\)/);
  assert.match(css, /\.letter-guide-strokes\.style-calligraphy/);
  assert.match(css, /\.letter-stroke\.calligraphy-highlight/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test("Smart Writing Lab visibly exposes all 52 letters and the selected Script glyph animation", async () => {
  const lab = await readFile(new URL("./writing-lab.html", import.meta.url), "utf8");
  assert.match(lab, /import \{ CURSIVE_GLYPHS \} from "\.\/curriculum\.js"/);
  assert.match(lab, /id="script-reference-panel"/);
  assert.match(lab, /id="letter-picker-grid"/);
  assert.match(lab, /for \(const letter of LETTERS\)/);
  assert.match(lab, /CURSIVE_GLYPHS\[letter\] \?\? letter/);
  assert.match(lab, /const targetGlyph = style === "cursive" \? \(CURSIVE_GLYPHS\[letter\] \?\? letter\) : letter/);
  assert.match(lab, /referenceGlyph\.setAttribute\("font-style", style === "calligraphy" \? "italic" : "normal"\)/);
  assert.match(lab, /id="replay-reference"/);
  assert.match(lab, /script-reference-trace/);
  assert.match(lab, /renderSavedList\(\); renderModeLabel\(\); resizeAll\(\); renderReference\(\)/);
});
