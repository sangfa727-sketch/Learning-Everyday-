export const LETTERS = Object.freeze([
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."abcdefghijklmnopqrstuvwxyz"
]);

export const WRITING_STYLES = Object.freeze(["print", "cursive", "calligraphy"]);
export const SAVED_SAMPLES_KEY = "le.writingLab.samples.v1";

export function normalizePoint(clientX, clientY, rect, timestamp, pressure = 0.5, startedAt = timestamp) {
  if (!rect || !Number.isFinite(rect.width) || !Number.isFinite(rect.height) || rect.width <= 0 || rect.height <= 0) {
    throw new TypeError("A non-empty drawing rectangle is required.");
  }
  const clamp = (value) => Math.max(0, Math.min(1, value));
  return {
    x: Number(clamp((clientX - rect.left) / rect.width).toFixed(5)),
    y: Number(clamp((clientY - rect.top) / rect.height).toFixed(5)),
    t: Math.max(0, Math.round(timestamp - startedAt)),
    pressure: Number.isFinite(pressure) && pressure > 0 ? Number(Math.max(0, Math.min(1, pressure)).toFixed(3)) : 0.5
  };
}

export function smoothPoints(points) {
  if (!Array.isArray(points) || points.length < 3) return (points ?? []).map((point) => ({ ...point }));

  // Robust two-stage filtering:
  // 1) a local median rejects isolated large mouse jumps/spikes;
  // 2) a light weighted pass softens remaining jitter.
  // Exact first/last points, timing, pressure, and point order are preserved.
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  const filtered = points.map((point, index) => {
    if (index === 0 || index === points.length - 1) return { ...point };
    const from = Math.max(0, index - 2);
    const to = Math.min(points.length - 1, index + 2);
    const window = points.slice(from, to + 1);
    return {
      ...point,
      x: median(window.map((item) => item.x)),
      y: median(window.map((item) => item.y))
    };
  });
  return filtered.map((point, index) => {
    if (index === 0 || index === filtered.length - 1) return { ...point };
    const previous = filtered[index - 1];
    const next = filtered[index + 1];
    return {
      ...point,
      x: previous.x * 0.2 + point.x * 0.6 + next.x * 0.2,
      y: previous.y * 0.2 + point.y * 0.6 + next.y * 0.2
    };
  });
}

export function getStrokeEndpoints(points) {
  if (!Array.isArray(points) || points.length === 0) throw new TypeError("A stroke must contain at least one point.");
  const toEndpoint = (point) => ({ x: point.x, y: point.y, t: point.t, pressure: point.pressure });
  return { startPoint: toEndpoint(points[0]), endPoint: toEndpoint(points[points.length - 1]) };
}

export function buildSample({ letter, style, strokes, startedAt, finishedAt, createdAt = new Date().toISOString() }) {
  if (!LETTERS.includes(letter)) throw new TypeError("Choose one English uppercase or lowercase letter.");
  if (!WRITING_STYLES.includes(style)) throw new TypeError("Choose Print, Cursive, or Calligraphy.");
  if (!Array.isArray(strokes) || strokes.length === 0) throw new TypeError("Write at least one stroke before saving.");
  const recordedStrokes = strokes.map((stroke, index) => {
    const points = Array.isArray(stroke.points) ? stroke.points.map((point) => ({
      x: Number(point.x.toFixed(5)),
      y: Number(point.y.toFixed(5)),
      t: Math.max(0, Math.round(point.t)),
      pressure: Number((Number.isFinite(point.pressure) ? point.pressure : 0.5).toFixed(3))
    })) : [];
    const endpoints = getStrokeEndpoints(points);
    return {
      index,
      startPoint: endpoints.startPoint,
      endPoint: endpoints.endPoint,
      pointCount: points.length,
      points
    };
  });
  return {
    schemaVersion: 2,
    kind: "learning-everyday-handwriting-sample",
    id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    targetLetter: letter,
    style,
    recognition: { status: "not-automatically-verified", note: "The chosen letter is saved as the intended target; the strokes have not been independently classified." },
    createdAt,
    durationMs: Math.max(0, Math.round(finishedAt - startedAt)),
    strokeCount: recordedStrokes.length,
    pointCount: recordedStrokes.reduce((total, stroke) => total + stroke.pointCount, 0),
    strokes: recordedStrokes
  };
}

export function parseSavedSamples(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((sample) =>
      sample && sample.kind === "learning-everyday-handwriting-sample" &&
      LETTERS.includes(sample.targetLetter) && WRITING_STYLES.includes(sample.style) &&
      Array.isArray(sample.strokes)
    ) : [];
  } catch {
    return [];
  }
}

export function serializeSavedSamples(samples) {
  return JSON.stringify(samples);
}
