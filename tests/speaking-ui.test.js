import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, ui, styles, worker] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../speaking.js", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../sw.js", import.meta.url), "utf8")
]);

test("speaking page has category and dedicated conversation containers with accessible controls", () => {
  for (const id of ["speaking-library", "speaking-category-grid", "speaking-conversation", "speaking-dialogue-lines", "speaking-back", "speaking-play-all", "speaking-stop", "speaking-speed", "speaking-status"]) {
    assert.ok(html.includes('id="' + id + '"'), "missing #" + id);
  }
  assert.match(html, /src="\.\/speaking\.js"/);
  assert.match(ui, /location\.hash = "#\/speaking\/"/);
  assert.match(ui, /addEventListener\("hashchange", renderSpeakingRoute\)/);
});

test("leaving the Speaking route only cancels shared TTS when a conversation was active", () => {
  const start = ui.indexOf("if (!isSpeaking) {", ui.indexOf("function renderSpeakingRoute"));
  const end = ui.indexOf("\n  renderCategories();", start);
  assert.ok(start >= 0 && end > start, "non-Speaking route branch should exist");
  const branch = ui.slice(start, end);
  assert.match(branch, /if \(activeConversation\) stopPlayback\(\);/);
  assert.match(branch, /activeConversation = null;/);
  assert.doesNotMatch(branch, /\n\s{4}stopPlayback\(\);/);
});

test("speaking UI keeps two topic cards per row on narrow screens and hides the microphone practice panel", () => {
  assert.match(styles, /\.speaking-category-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /body\[data-page="speaking"\]\s+#practice-panel\s*\{\s*display:\s*none\s*!important/);
});

test("speaking assets are included in the offline app shell with a new cache version", () => {
  assert.match(worker, /learning-everyday-shell-v42/);
  assert.match(worker, /"\.\/speaking\.js"/);
  assert.match(worker, /"\.\/speaking-data\.js"/);
});
