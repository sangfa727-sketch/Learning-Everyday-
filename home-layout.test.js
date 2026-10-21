import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("home page keeps the original skill cards and learning workbench visible", async () => {
  const [html, css] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8")
  ]);
  for (const skill of ["reading", "listening", "writing", "speaking"]) {
    assert.match(html, new RegExp('data-skill="' + skill + '"'));
  }
  assert.match(html, /id="skills-level-page"/);
  assert.match(html, /id="vocabulary-list"/);
  assert.match(html, /id="practice-heading"/);
  assert.match(html, /id="letter-practice-heading"/);
  assert.doesNotMatch(css, /body\[data-page="home"\] #curriculum-workbench,body\[data-page="home"\] #practice-panel\{display:none\}/);
  assert.match(css, /body\[data-page="home"\] #skills-level-page\{display:block\}/);
  assert.match(css, /body\[data-page="home"\] \.skills-level-page \.skill-level-picker\{display:none\}/);\n  assert.match(css, /body\[data-page="home"\] #practice-panel,body\[data-page="home"\] #curriculum-workbench\{display:none\}/);
});
