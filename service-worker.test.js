import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("service worker app shell caches every local JavaScript module imported by the app", async () => {
  const [worker, app, curriculumUi] = await Promise.all([
    readFile(new URL("./sw.js", import.meta.url), "utf8"),
    readFile(new URL("./app.js", import.meta.url), "utf8"),
    readFile(new URL("./curriculum-ui.js", import.meta.url), "utf8")
  ]);
  const shellMatch = worker.match(/const APP_SHELL = (\[[\s\S]*?\]);/);
  assert.ok(shellMatch, "APP_SHELL should be declared as a static array");
  const shell = JSON.parse(shellMatch[1]);
  const imports = [app, curriculumUi].flatMap((source) =>
    [...source.matchAll(/from\s+["']\.\/([^"']+\.js)["']/g)].map((match) => "./" + match[1])
  );
  for (const path of new Set(imports)) {
    assert.ok(shell.includes(path), `offline app shell must cache imported module: ${path}`);
  }
});

test("service worker cache version changes when the shell is revised", async () => {
  const worker = await readFile(new URL("./sw.js", import.meta.url), "utf8");
  assert.match(worker, /const CACHE_NAME = "learning-everyday-shell-v25";/);
  assert.match(worker, /"\.\/progress-state\.js"/);
});
