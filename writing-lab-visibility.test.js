import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Smart Writing Lab is hidden from navigation while the Writing Practice shows a static script alphabet", async () => {
  const [html, app, css, sw, lab, curriculum] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./app.js", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
    readFile(new URL("./sw.js", import.meta.url), "utf8"),
    readFile(new URL("./writing-lab.html", import.meta.url), "utf8"),
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8")
  ]);

  assert.doesNotMatch(html, /writing-lab\.html#paste-path-editor/);
  assert.doesNotMatch(html, /id="writing-lab-nav-link"/);
  assert.doesNotMatch(html, /id="writing-lab-entry"/);
  assert.match(html, /id="smart-writing-lab" class="curriculum-card letter-practice"/);
  assert.match(html, /id="script-uppercase-heading">Uppercase A–Z<\/h4>/);
  assert.match(html, /id="script-lowercase-heading">Lowercase a–z<\/h4>/);
  assert.match(html, /𝒜.*ℬ.*𝒞.*𝒵/s);
  assert.match(html, /𝒶.*𝒷.*𝒸.*𝓏/s);
  assert.match(html, /id="legacy-letter-tools" hidden aria-hidden="true"/);
  assert.match(html, /class="script-alphabet-paper"/);
  assert.match(css, /\.script-alphabet-paper/);
  assert.match(css, /#legacy-letter-tools\[hidden\]\{display:none!important\}/);
  assert.match(curriculum, /letterTitle: "Script-style alphabet reference"/);
  assert.match(curriculum, /letterTitle: "Script အက္ခရာ နမူနာ"/);
  assert.match(sw, /learning-everyday-shell-v29/);
  assert.match(lab, /id="paste-path-editor"/);
  assert.match(lab, /id="editable-path-svg"/);
  assert.match(lab, /id="path-point-list"/);
  assert.match(app, /le\.writingLab\.sampleExported\.v3/);
});
