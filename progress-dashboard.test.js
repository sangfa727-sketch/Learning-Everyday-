import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("progress dashboard exposes bilingual exercise status for all skills and levels", async () => {
  const [html, ui, styles] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8")
  ]);
  assert.match(html, /id="progress-details"/);
  assert.match(ui, /reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking"/);
  assert.match(ui, /စာဖတ်ခြင်း/);
  assert.match(ui, /for \(const level of LEVELS\)/);
  assert.match(ui, /getPracticeCount\(skill, level\.id\)/);
  assert.match(ui, /progress\.completed, `\$\{skill\}:\$\{level\.id\}:\$\{index\}`/);
  assert.match(styles, /\.progress-details\{display:grid/);
  assert.match(styles, /@media\(max-width:560px\)\{\.progress-details/);
});
