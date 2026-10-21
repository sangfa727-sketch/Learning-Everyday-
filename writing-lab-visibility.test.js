import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Smart Writing Lab is reachable, route-focused, and refreshed from cache", async () => {
  const [html, app, css, sw, lab, curriculum] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./app.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
    readFile(new URL("./sw.js", import.meta.url), "utf8"),
    readFile(new URL("./writing-lab.html", import.meta.url), "utf8"),
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8")
  ]);

  assert.match(html, /href="\.\/writing-lab\.html">Smart Writing Lab<\/a>/);
  assert.match(html, /id="smart-writing-lab"/);
  assert.match(curriculum, /letterTitle: "Smart Writing Lab"/);
  assert.match(css, /body\[data-page="writing"\] #curriculum-workbench #smart-writing-lab/);
  assert.match(css, /body:not\(\[data-page="home"\]\) \.hero/);
  assert.match(css, /body\[data-page="reading"\] #skills-level-page/);
  assert.doesNotMatch(css, /body\[data-page="reading"\]\s+#practice-panel\s*,?\s*\{/);
  assert.match(css, /body\[data-page="listening"\] #skills-level-page/);
  assert.match(css, /body\[data-page="speaking"\] #skills-level-page/);
  assert.match(css, /body\[data-page="progress"\] #skills-level-page/);
  assert.match(css, /body\[data-page="progress"\] #curriculum-workbench > #smart-writing-lab/);
  assert.match(css, /body\[data-page="writing"\] #practice-panel\s*\{\s*display: none !important;/);
  assert.match(css, /body\[data-page="listening"\] #curriculum-workbench/);
  assert.match(css, /body\[data-page="speaking"\] #curriculum-workbench/);

  // Use a versioned completion key so an older test export cannot permanently hide the new entry.
  assert.match(app, /le\.writingLab\.sampleExported\.v2/);
  assert.match(lab, /le\.writingLab\.sampleExported\.v2/);
  assert.match(sw, /learning-everyday-shell-v10/);
  assert.match(sw, /"\.\/writing-lab\.html"/);
});
