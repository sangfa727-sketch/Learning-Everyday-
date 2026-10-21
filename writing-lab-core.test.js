import test from "node:test";
import assert from "node:assert/strict";
import {
  LETTERS, WRITING_STYLES, normalizePoint, smoothPoints, getStrokeEndpoints,
  buildSample, parseSavedSamples, serializeSavedSamples
} from "./writing-lab-core.js";

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
