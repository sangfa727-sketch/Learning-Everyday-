import test from "node:test";
import assert from "node:assert/strict";
import {
  LETTERS, WRITING_STYLES, normalizePoint, smoothPoints, getStrokeEndpoints,
  buildSample, parseSavedSamples, serializeSavedSamples
} from "./writing-lab-core.js";
import { CURSIVE_GUIDES, getCursiveGuide } from "./writing-lab-guides.js";

test("all 52 English uppercase and lowercase letters are available", () => {
  assert.equal(LETTERS.length, 52);
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz") assert.ok(LETTERS.includes(letter));
});

test("pointer points retain normalized coordinates, elapsed time, and pressure", () => {
  assert.deepEqual(normalizePoint(60, 40, { left: 10, top: 20, width: 100, height: 40 }, 1250, 0.8, 1000),
    { x: 0.5, y: 0.5, t: 250, pressure: 0.8 });
});

test("smoothing preserves exact start and end points", () => {
  const points = [{x:0,y:0,t:0,pressure:0.5},{x:0.4,y:0.8,t:10,pressure:0.6},{x:1,y:1,t:20,pressure:0.7}];
  const smooth = smoothPoints(points);
  assert.deepEqual(smooth[0], points[0]);
  assert.deepEqual(smooth.at(-1), points.at(-1));
  assert.equal(smooth.length, points.length);
});

test("a saved sample records target letter, style, duration, stroke order and endpoints", () => {
  const sample = buildSample({
    letter: "g", style: "cursive", startedAt: 100, finishedAt: 850, createdAt: "2026-10-22T00:00:00.000Z",
    strokes: [{points:[
      {x:0.1,y:0.2,t:0,pressure:0.5},
      {x:0.4,y:0.7,t:300,pressure:0.8},
      {x:0.8,y:0.9,t:700,pressure:0.7}
    ]}]
  });
  assert.equal(sample.targetLetter, "g");
  assert.equal(sample.style, "cursive");
  assert.equal(sample.durationMs, 750);
  assert.equal(sample.strokeCount, 1);
  assert.deepEqual(sample.strokes[0].startPoint, {x:0.1,y:0.2,t:0,pressure:0.5});
  assert.deepEqual(sample.strokes[0].endPoint, {x:0.8,y:0.9,t:700,pressure:0.7});
  assert.equal(sample.recognition.status, "not-automatically-verified");
});

test("invalid target, style and empty sample are rejected", () => {
  assert.throws(() => buildSample({letter:"@",style:"print",strokes:[{points:[{x:0,y:0,t:0}]}],startedAt:0,finishedAt:1}));
  assert.throws(() => buildSample({letter:"A",style:"neon",strokes:[{points:[{x:0,y:0,t:0}]}],startedAt:0,finishedAt:1}));
  assert.throws(() => buildSample({letter:"A",style:"print",strokes:[],startedAt:0,finishedAt:1}));
  assert.deepEqual(WRITING_STYLES, ["print","cursive","calligraphy"]);
});

test("saved sample list safely round-trips and ignores invalid storage", () => {
  const sample = buildSample({letter:"B",style:"calligraphy",strokes:[{points:[{x:0.2,y:0.2,t:0,pressure:0.5}]}],startedAt:0,finishedAt:20});
  const parsed = parseSavedSamples(serializeSavedSamples([sample]));
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].targetLetter, "B");
  assert.deepEqual(parseSavedSamples("{bad json"), []);
  assert.deepEqual(parseSavedSamples(JSON.stringify([{targetLetter:"?",style:"print",kind:"learning-everyday-handwriting-sample",strokes:[]}])), []);
});

test("conservative smoothing keeps a straight line straight", () => {
  const points = [
    {x:0,y:0.5,t:0,pressure:0.5},
    {x:0.25,y:0.5,t:10,pressure:0.5},
    {x:0.5,y:0.5,t:20,pressure:0.5},
    {x:0.75,y:0.5,t:30,pressure:0.5},
    {x:1,y:0.5,t:40,pressure:0.5}
  ];
  const smooth = smoothPoints(points);
  assert.ok(smooth.every(point => Math.abs(point.y - 0.5) < 1e-12));
  assert.deepEqual(smooth[0], points[0]);
  assert.deepEqual(smooth.at(-1), points.at(-1));
});

test("conservative smoothing reduces a small wobble without replacing the drawn path", () => {
  const points = [
    {x:0,y:0,t:0,pressure:0.5},
    {x:0.25,y:0.02,t:10,pressure:0.5},
    {x:0.5,y:-0.015,t:20,pressure:0.5},
    {x:0.75,y:0.015,t:30,pressure:0.5},
    {x:1,y:0,t:40,pressure:0.5}
  ];
  const originalCopy = structuredClone(points);
  const smooth = smoothPoints(points);
  assert.deepEqual(points, originalCopy, "raw captured points must not be mutated");
  assert.ok(Math.abs(smooth[1].y) < Math.abs(points[1].y));
  assert.ok(Math.abs(smooth[2].y) < Math.abs(points[2].y));
  assert.ok(Math.abs(smooth[3].y) < Math.abs(points[3].y));
  assert.ok(Math.abs(smooth[2].y - points[2].y) < 0.02, "shape change must remain small");
});


test("robust smoothing reduces a large isolated mouse jump while preserving endpoints", () => {
  const points = [
    {x:0,y:0.5,t:0,pressure:0.5},
    {x:0.2,y:0.5,t:10,pressure:0.5},
    {x:0.4,y:0.5,t:20,pressure:0.5},
    {x:0.6,y:0.95,t:30,pressure:0.5},
    {x:0.8,y:0.5,t:40,pressure:0.5},
    {x:1,y:0.5,t:50,pressure:0.5}
  ];
  const smooth = smoothPoints(points);
  assert.deepEqual(smooth[0], points[0]);
  assert.deepEqual(smooth.at(-1), points.at(-1));
  assert.ok(Math.abs(smooth[3].y - 0.5) < Math.abs(points[3].y - 0.5));
});

test("robust smoothing retains the overall direction of a broad curve", () => {
  const points = [
    {x:0,y:0.9,t:0,pressure:0.5},
    {x:0.2,y:0.7,t:10,pressure:0.5},
    {x:0.4,y:0.45,t:20,pressure:0.5},
    {x:0.6,y:0.25,t:30,pressure:0.5},
    {x:0.8,y:0.1,t:40,pressure:0.5},
    {x:1,y:0.05,t:50,pressure:0.5}
  ];
  const smooth = smoothPoints(points);
  assert.ok(smooth[1].y > smooth[2].y);
  assert.ok(smooth[2].y > smooth[3].y);
  assert.ok(smooth[3].y > smooth[4].y);
});


test("stabilization strength zero preserves every captured coordinate", () => {
  const points = [
    {x:0,y:0,t:0,pressure:0.5},
    {x:0.25,y:0.02,t:10,pressure:0.6},
    {x:0.5,y:-0.015,t:20,pressure:0.7},
    {x:0.75,y:0.015,t:30,pressure:0.8},
    {x:1,y:0,t:40,pressure:0.5}
  ];
  const smooth = smoothPoints(points, 0);
  assert.deepEqual(smooth, points);
  assert.notEqual(smooth, points, "render output must be a separate array");
});

test("higher stabilization strength suppresses more small wobble without mutating raw points", () => {
  const points = [
    {x:0,y:0,t:0,pressure:0.5},
    {x:0.25,y:0.02,t:10,pressure:0.5},
    {x:0.5,y:-0.015,t:20,pressure:0.5},
    {x:0.75,y:0.015,t:30,pressure:0.5},
    {x:1,y:0,t:40,pressure:0.5}
  ];
  const raw = structuredClone(points);
  const light = smoothPoints(points, 0.25);
  const strong = smoothPoints(points, 1);
  assert.ok(Math.abs(strong[2].y) <= Math.abs(light[2].y));
  assert.deepEqual(points, raw);
});


test("maximum stabilization visibly suppresses repeated small pointer jitter", () => {
  const points = [
    {x:0,y:0.5,t:0,pressure:0.5},
    {x:0.2,y:0.515,t:10,pressure:0.5},
    {x:0.4,y:0.486,t:20,pressure:0.5},
    {x:0.6,y:0.514,t:30,pressure:0.5},
    {x:0.8,y:0.487,t:40,pressure:0.5},
    {x:1,y:0.5,t:50,pressure:0.5}
  ];
  const rawDeviation = points.slice(1,-1).reduce((sum,p)=>sum+Math.abs(p.y-0.5),0);
  const smooth = smoothPoints(points, 1);
  const smoothDeviation = smooth.slice(1,-1).reduce((sum,p)=>sum+Math.abs(p.y-0.5),0);
  assert.ok(smoothDeviation < rawDeviation * 0.7, `expected meaningful visible reduction: ${smoothDeviation} < ${rawDeviation * 0.7}`);
  assert.deepEqual(smooth[0], points[0]);
  assert.deepEqual(smooth.at(-1), points.at(-1));
});

test("strong stabilization suppresses a sharp isolated pointer spike", () => {
  const points = [
    {x:0,y:0.5,t:0,pressure:0.5},
    {x:0.2,y:0.5,t:10,pressure:0.5},
    {x:0.4,y:0.5,t:20,pressure:0.5},
    {x:0.6,y:0.96,t:30,pressure:0.5},
    {x:0.8,y:0.5,t:40,pressure:0.5},
    {x:1,y:0.5,t:50,pressure:0.5}
  ];
  const smooth = smoothPoints(points, 1);
  assert.ok(Math.abs(smooth[3].y - 0.5) < 0.1, "large isolated jump should be rejected");
});

test("corner preservation keeps a deliberate right-angle turn recognizable", () => {
  const points = [
    {x:0.1,y:0.1,t:0,pressure:0.5},
    {x:0.4,y:0.1,t:10,pressure:0.5},
    {x:0.7,y:0.1,t:20,pressure:0.5},
    {x:0.7,y:0.4,t:30,pressure:0.5},
    {x:0.7,y:0.7,t:40,pressure:0.5}
  ];
  const smooth = smoothPoints(points, 1);
  assert.ok(Math.abs(smooth[2].x - 0.7) < 0.1);
  assert.ok(Math.abs(smooth[2].y - 0.1) < 0.1);
});


test("cursive guide provides separate ordered strokes for all 52 Latin letters", () => {
  assert.equal(Object.keys(CURSIVE_GUIDES).length, 52);
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz") {
    const strokes = getCursiveGuide(letter);
    assert.ok(Array.isArray(strokes) && strokes.length > 0, `missing cursive guide for ${letter}`);
    for (const path of strokes) {
      assert.match(path, /^M\s*-?\d/);
      assert.match(path, /[A-Z]/);
    }
  }
});

test("cursive lowercase a and o have distinct stroke constructions", () => {
  assert.notDeepEqual(getCursiveGuide("a"), getCursiveGuide("o"));
  assert.ok(getCursiveGuide("a").length > 0);
  assert.ok(getCursiveGuide("o").length > 0);
});

test("cursive guide lookup rejects unsupported glyphs", () => {
  assert.equal(getCursiveGuide("@"), null);
  assert.equal(getCursiveGuide("𝒶"), null);
});
