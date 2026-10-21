import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("progress has a reachable bilingual route and dedicated page layout", async () => {
  const [app, html, css] = await Promise.all([
    readFile(new URL("./app.js", import.meta.url), "utf8"),
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8")
  ]);
  assert.match(app, /"home", "reading", "listening", "writing", "speaking", "progress"/);
  assert.match(app, /progressLink:"Progress"/);
  assert.match(app, /progressLink:"လေ့လာမှုတိုးတက်မှု"/);
  assert.match(html, /href="#\/progress"[^>]*data-i18n="progressLink"/);
  assert.match(css, /body\[data-page="progress"\] #curriculum-workbench \.progress-tools\{display:block/);
  assert.match(css, /body\[data-page="progress"\] #practice-panel\{display:none/);
});
