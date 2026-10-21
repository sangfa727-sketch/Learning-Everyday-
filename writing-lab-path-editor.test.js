import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, rm, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("Smart Writing Lab paste-to-path editor exposes conversion, draggable ordered points, preview, and export", async () => {
  const html = await readFile(new URL("./writing-lab.html", import.meta.url), "utf8");
  for (const id of ["paste-letter-input", "convert-pasted-path", "editable-path-svg", "path-point-list", "replay-pasted-path", "save-pasted-path", "generated-path-code", "copy-path-code"]) {
    assert.match(html, new RegExp('id="' + id + '"'), "missing editor control: " + id);
  }
  assert.match(html, /function glyphContours\(letter\)/);
  assert.match(html, /normalizePastedLetter\(raw\)/);
  assert.match(html, /writing-lab-unicode\.js/);
  assert.match(html, /function parseSvgPath\(raw\)/);
  assert.match(html, /const master=document\.createElementNS\(svgNS,"path"\)/);
  assert.match(html, /box=master\.getBBox\(\)/);
  assert.match(html, /const authored=styleSelect\.value==="cursive"\?cursivePathsFor\(letter\):null/);
  assert.match(html, /hand-authored cursive centerline/);
  assert.match(html, /path\.getPointAtLength\(length\*i\/count\)/);
  assert.match(html, /pathSvg\.addEventListener\("pointermove"/);
  assert.match(html, /getScreenCTM\(\)\.inverse\(\)/);
  assert.match(html, /editableOrder\[order-1\],editableOrder\[order\]/);
  assert.match(html, /learning-everyday-letter-path\.json/);
  assert.match(html, /navigator\.clipboard\.writeText\(code\)/);
  assert.match(html, /Font outline သည် လက်ရေး centerline မဟုတ်ပါ/);
  assert.match(html, /id="saved-path-library"/);
  assert.match(html, /le\.writingLab\.savedLetterPaths\.v1/);
  assert.match(html, /function renderSavedPaths\(\)/);
  assert.match(html, /saved-path-list/);
  assert.match(html, /သိမ်းထားသော path ကို ပြန်ဖွင့်ပြီးပါပြီ/);
});

test("embedded Smart Writing Lab module passes Node syntax validation", async () => {
  const html = await readFile(new URL("./writing-lab.html", import.meta.url), "utf8");
  const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  assert.ok(match, "module script must exist");
  const dir = await mkdtemp(join(tmpdir(), "learning-everyday-lab-"));
  const file = join(dir, "writing-lab-check.mjs");
  try {
    await writeFile(file, match[1], "utf8");
    const checked = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    assert.equal(checked.status, 0, checked.stderr || checked.stdout);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
