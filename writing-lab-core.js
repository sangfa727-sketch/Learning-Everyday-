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

export function smoothPoints(points, strength = 1) {
  if (!Array.isArray(points) || points.length < 3) return (points ?? []).map((point) => ({ ...point }));
  const level = Number.isFinite(strength) ? Math.max(0, Math.min(1, strength)) : 1;
  if (level === 0) return points.map((point) => ({ ...point }));

  // Stabilization uses two complementary passes:
  // 1) remove isolated reversals (large pointer spikes) without flattening real turns;
  // 2) apply a strength-controlled low-pass filter for smaller hand/mouse jitter.
  const filtered = points.map((point) => ({ ...point }));
  const spikeTolerance = 0.04 + (1 - level) * 0.03;
  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    const ax = current.x - previous.x;
    const ay = current.y - previous.y;
    const bx = next.x - current.x;
    const by = next.y - current.y;
    const aLength = Math.hypot(ax, ay);
    const bLength = Math.hypot(bx, by);
    if (aLength < 1e-7 || bLength < 1e-7) continue;
    const directionCosine = (ax * bx + ay * by) / (aLength * bLength);
    const midpointX = (previous.x + next.x) / 2;
    const midpointY = (previous.y + next.y) / 2;
    const deviation = Math.hypot(current.x - midpointX, current.y - midpointY);
    // A sharp reversal plus a large offset is characteristic of an isolated
    // pointer jump. A genuine corner normally continues forward, so it survives.
    if (directionCosine < -0.45 && deviation > spikeTolerance) {
      filtered[i].x = midpointX;
      filtered[i].y = midpointY;
    }
  }

  // Blend neighbors more strongly at higher settings. Preserve corners by
  // reducing the blend where the path changes direction sharply.
  const neighborWeight = 0.08 + 0.38 * level;
  return filtered.map((point, index) => {
    if (index === 0 || index === filtered.length - 1) return { ...point };
    const previous = filtered[index - 1];
    const next = filtered[index + 1];
    const incomingX = point.x - previous.x;
    const incomingY = point.y - previous.y;
    const outgoingX = next.x - point.x;
    const outgoingY = next.y - point.y;
    const incomingLength = Math.hypot(incomingX, incomingY);
    const outgoingLength = Math.hypot(outgoingX, outgoingY);
    const cosine = incomingLength && outgoingLength
      ? (incomingX * outgoingX + incomingY * outgoingY) / (incomingLength * outgoingLength)
      : 1;
    const cornerPreservation = cosine < 0.35 ? 0.2 : cosine < 0.7 ? 0.55 : 1;
    const weight = neighborWeight * cornerPreservation;
    return {
      ...point,
      x: previous.x * weight + point.x * (1 - 2 * weight) + next.x * weight,
      y: previous.y * weight + point.y * (1 - 2 * weight) + next.y * weight
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
