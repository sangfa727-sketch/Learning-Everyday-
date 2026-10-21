import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("print, cursive, and calligraphy animate letter stroke paths distinctly", async () => {
  const [ui, css] = await Promise.all([
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8")
  ]);
  assert.match(ui, /if \(guide\.paths\.length\)/);
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
