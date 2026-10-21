import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { cursivePathsFor, splitCursiveStrokes } from "./cursive-paths.js";

test("cursive practice animates hand-authored strokes and traces the same paths", async () => {
  const [ui, css, html, pathsModule] = await Promise.all([
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./cursive-paths.js", import.meta.url), "utf8")
  ]);
  assert.match(ui, /sample\.replaceChildren\(\)/);
  assert.match(ui, /const samplePaths = cursivePathsFor\(selectedLetter\) \?\? \[\]/);
  assert.match(ui, /letter-sample-svg/);
  assert.match(ui, /letter-sample-stroke/);
  assert.match(ui, /const stylePaths = selectedStyle === "cursive"/);
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
  assert.doesNotMatch(html, /<option value="calligraphy">Calligraphy<\/option>/);
  assert.doesNotMatch(ui, /CALLIGRAPHY_PATH_OVERRIDES|function calligraphyPathsFor/);
  assert.match(css, /\.letter-template-glyph\.style-cursive/);
  assert.match(css, /\.letter-sample-svg/);
  assert.match(css, /\.letter-sample-stroke/);
  assert.match(css, /@keyframes trace-script-glyph\{0%\{stroke-dashoffset:1000;fill:transparent\}82%\{stroke-dashoffset:0;fill:transparent\}100%\{stroke-dashoffset:0;fill:rgba\(71,123,98,\.08\)\}\}/);
  assert.match(css, /trace-script-glyph/);
  assert.match(css, /letter-alphabet-row/);
  assert.match(pathsModule, /export function cursivePathsFor\(letter\)/);
  assert.match(pathsModule, /export function splitCursiveStrokes\(paths\)/);
  assert.match(ui, /const handPaths = selectedStyle === "cursive"/);
  assert.match(ui, /follow the hand-drawn centerline strokes in order/);
  assert.match(ui, /Mark each pen-down start so disconnected strokes and pen lifts are visible/);
  assert.match(ui, /class", "letter-stroke-number"/);
  assert.match(ui, /starts here/);
  assert.ok(ui.includes(String.raw`const move = d.match(/^M\s*([-\d.]+)[ ,]+([-\d.]+)/);`), "stroke-start markers must parse SVG move coordinates");
  assert.match(ui, /function traceStrokeWidth\(style, pressure = 0\.5\)/);
  assert.match(ui, /drawTraceSegment\(context, stroke, previous, point, width, height\)/);
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
  assert.match(lab, /const paths = style === "cursive" \? splitCursiveStrokes\(cursivePathsFor\(letter\)\) : \[\]/);
  assert.match(lab, /id="replay-reference"/);
  assert.match(lab, /script-reference-trace/);
  assert.match(lab, /class", "script-reference-glyph"/);
  assert.match(lab, /context\.stroke\(new Path2D\(d\)\)/);
  assert.match(lab, /import \{ cursivePathsFor, splitCursiveStrokes \} from "\.\/cursive-paths\.js"/);
  assert.match(lab, /renderSavedList\(\); renderSavedPaths\(\); renderModeLabel\(\); resizeAll\(\); renderReference\(\)/);
});


test("shared cursive stroke data covers all 52 letters and keeps lowercase a and o distinct", () => {
  const letters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"];
  for (const letter of letters) {
    const paths = cursivePathsFor(letter);
    assert.ok(Array.isArray(paths) && paths.length > 0, `missing cursive path for ${letter}`);
    assert.ok(splitCursiveStrokes(paths).length > 0, `missing ordered strokes for ${letter}`);
  }
  assert.notDeepEqual(cursivePathsFor("a"), cursivePathsFor("o"));
  assert.notEqual(splitCursiveStrokes(cursivePathsFor("a")).join("|"), splitCursiveStrokes(cursivePathsFor("o")).join("|"));
  assert.match(cursivePathsFor("a")[0], /C51 59 52 68 52 77/);
  assert.match(cursivePathsFor("o")[0], /C54 60 58 73 66 79/);
  assert.ok(splitCursiveStrokes(cursivePathsFor("E")).length > cursivePathsFor("E").length, "multiple SVG move commands must become separate pen-down strokes");
});
