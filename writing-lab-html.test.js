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


test("Smart Writing Lab exposes pen assistance modes and an adjustable stabilizer", async () => {
  const html = await readFile(new URL("./writing-lab.html", import.meta.url), "utf8");
  assert.match(html, /id="pen-mode"/);
  assert.match(html, /value="stabilized"/);
  assert.match(html, /value="natural"/);
  assert.match(html, /value="curve"/);
  assert.match(html, /value="freehand"/);
  assert.match(html, /id="stabilizer"[^>]*type="range"/);
  assert.match(html, /point\.pressure = Number/);
  assert.match(html, /context\.lineWidth = Math\.max\(1\.2, baseWidth \* pressureFactor \* speedFactor\)/);
});


test("stabilizer zero disables curve rendering and Curve Pen follows the selected strength", async () => {
  const html = await readFile(new URL("./writing-lab.html", import.meta.url), "utf8");
  assert.match(html, /const useSmooth = strength\(\) > 0 && \(smooth \|\| mode === "stabilized" \|\| mode === "curve"\)/);
  assert.match(html, /const useCurve = mode === "curve" && strength\(\) > 0/);
  assert.match(html, /if \(useCurve && points\.length > 2\)/);
  assert.match(html, /const points = useSmooth \? smoothPoints\(stroke\.points, strength\(\)\) : stroke\.points/);
  assert.doesNotMatch(html, /Math\.max\(strength\(\), 0\.85\)/);
});


test("original preview renders raw captured strokes independently of selected pen mode", async () => {
  const html = await readFile(new URL("./writing-lab.html", import.meta.url), "utf8");
  assert.match(html, /function drawStroke\(context, stroke, width, height, smooth = false, progress = 1, raw = false\)/);
  assert.match(html, /const mode = raw \? "freehand" : penModeSelect\.value/);
  assert.match(html, /const useSmooth = !raw && strength\(\) > 0/);
  assert.match(html, /smooth, 1, el === originalCanvas/);
});
