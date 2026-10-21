import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("practice card title follows the selected skill instead of repeating the four-skills overview", async () => {
  const [html, ui] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8")
  ]);
  assert.doesNotMatch(html, /Four skills · six levels/i);
  assert.match(html, /id="practice-heading">Reading practice</);
  assert.match(ui, /skillLabels\[activeSkill\]/);
  assert.match(ui, /Skills & Levels to change your skill or level/);
  assert.match(html, /id="skills-level-page"/);
  assert.match(html, /id="level-options"/);
  assert.match(ui, /button\.dataset\.level = level\.id/);
  assert.match(ui, /ကျွမ်းကျင်မှုအလိုက် လေ့ကျင့်ခန်း/);
  assert.match(ui, /စာဖတ်ခြင်း/);
  assert.match(ui, /နားထောင်ခြင်း/);
  assert.match(ui, /စာရေးခြင်း/);
  assert.match(ui, /စကားပြောခြင်း/);
});
