import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

test("Smart Writing Lab inline module script has valid JavaScript syntax", async () => {
  const html = await readFile(new URL("./writing-lab.html", import.meta.url), "utf8");
  const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  assert.ok(match, "writing-lab.html should contain its module script");
  const directory = await mkdtemp(join(tmpdir(), "learning-everyday-writing-lab-"));
  const file = join(directory, "writing-lab-inline.mjs");
  try {
    await writeFile(file, match[1], "utf8");
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
