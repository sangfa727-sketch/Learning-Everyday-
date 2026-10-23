import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("dedicated study path includes all six CEFR levels and all four skills", async () => {
  const [page, script, worker] = await Promise.all([
    readFile(new URL("./study-path.html", import.meta.url), "utf8"),
    readFile(new URL("./study-path.js", import.meta.url), "utf8"),
    readFile(new URL("./sw.js", import.meta.url), "utf8")
  ]);
  for (const skill of ["reading", "listening", "writing", "speaking"]) {
    assert.match(page, new RegExp('data-study-skill="' + skill + '"'));
    assert.match(script, new RegExp(skill + ":"));
  }
  for (const level of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
    assert.match(script, new RegExp("\\b" + level + "\\s*:"));
  }
  assert.match(script, /studyPath\.answer\./);
  assert.match(worker, /"\.\/study-path\.html"/);
  assert.match(worker, /"\.\/study-path\.js"/);
  assert.match(worker, /"\.\/study-path\.css"/);
});
