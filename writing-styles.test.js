import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("print, cursive, and calligraphy use visibly distinct letter templates", async () => {
  const [ui, css] = await Promise.all([
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8")
  ]);
  assert.match(ui, /selectedStyle === "print" && guide\.paths\.length/);
  assert.match(ui, /letter-template-glyph style-\$\{selectedStyle\}/);
  assert.match(ui, /letter-style-flourish/);
  assert.match(ui, /"Segoe Print", "Comic Sans MS", cursive/);
  assert.match(ui, /"URW Chancery L", "Brush Script MT", "Apple Chancery", cursive/);
  assert.match(css, /\.letter-sample\.style-cursive/);
  assert.match(css, /\.letter-sample\.style-calligraphy/);
});
