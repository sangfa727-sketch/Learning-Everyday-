import test from "node:test";
import assert from "node:assert/strict";
import {
  PROGRESS_STORAGE_KEY, emptyProgress, loadProgress, saveProgress,
  markPracticeComplete, clearProgress, exportProgress
} from "./progress-state.js";

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    data
  };
}

test("loads an empty progress state when no record exists", () => {
  assert.deepEqual(loadProgress(memoryStorage()), emptyProgress());
});

test("marks and persists individual exercise completions without duplicating keys", () => {
  const storage = memoryStorage();
  const initial = emptyProgress();
  const first = markPracticeComplete(initial, "reading", "A1", 0, "2026-10-21T12:00:00.000Z");
  assert.equal(Object.keys(initial.completed).length, 0);
  assert.equal(saveProgress(first, storage), true);
  const second = markPracticeComplete(loadProgress(storage), "reading", "A1", 0, "2026-10-21T13:00:00.000Z");
  assert.equal(Object.keys(second.completed).length, 1);
  assert.equal(second.completed["reading:A1:0"], "2026-10-21T13:00:00.000Z");
  assert.equal(saveProgress(second, storage), true);
  assert.deepEqual(loadProgress(storage), second);
});

test("ignores malformed, unsupported, and invalidly shaped saved data", () => {
  const storage = memoryStorage({ [PROGRESS_STORAGE_KEY]: "{broken" });
  assert.deepEqual(loadProgress(storage), emptyProgress());
  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ version: 3, completed: {} }));
  assert.deepEqual(loadProgress(storage), emptyProgress());
  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ version: 1, completed: { "admin:A1": "2026-10-21" } }));
  assert.deepEqual(loadProgress(storage), emptyProgress());
});

test("rejects invalid completion keys and dates", () => {
  assert.throws(() => markPracticeComplete(emptyProgress(), "unknown", "A1"), /Invalid practice/);
  assert.throws(() => markPracticeComplete(emptyProgress(), "reading", "A9"), /Invalid practice/);
  assert.throws(() => markPracticeComplete(emptyProgress(), "reading", "A1", 2), /Invalid practice/);
  assert.throws(() => markPracticeComplete(emptyProgress(), "reading", "A1", 0, "not-a-date"), /Invalid practice/);
});

test("storage failures are handled and clearing affects only the progress key", () => {
  const storage = memoryStorage({ keep: "yes", [PROGRESS_STORAGE_KEY]: "{}" });
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.deepEqual(loadProgress(blocked), emptyProgress());
  assert.equal(saveProgress(emptyProgress(), blocked), false);
  assert.equal(clearProgress(blocked), false);
  assert.equal(clearProgress(storage), true);
  assert.equal(storage.getItem("keep"), "yes");
  assert.equal(storage.getItem(PROGRESS_STORAGE_KEY), null);
});

test("exports a versioned JSON document without changing saved state", () => {
  const progress = markPracticeComplete(emptyProgress(), "writing", "B1", 1, "2026-10-21T12:00:00.000Z");
  assert.deepEqual(JSON.parse(exportProgress(progress)), progress);
});

test("migrates existing skill-level progress without losing completion history", () => {
  const storage = memoryStorage({
    [PROGRESS_STORAGE_KEY]: JSON.stringify({
      version: 1,
      completed: {
        "reading:A1": "2026-10-21T12:00:00.000Z",
        "writing:B2": "2026-10-21T13:00:00.000Z",
        "admin:A1": "2026-10-21T13:00:00.000Z"
      }
    })
  });
  const migrated = loadProgress(storage);
  assert.deepEqual(migrated, {
    version: 2,
    completed: {
      "reading:A1:0": "2026-10-21T12:00:00.000Z",
      "writing:B2:0": "2026-10-21T13:00:00.000Z"
    }
  });
  assert.equal(saveProgress(migrated, storage), true);
  assert.deepEqual(loadProgress(storage), migrated);
});

test("tracks the two exercises at one skill and level separately", () => {
  const first = markPracticeComplete(emptyProgress(), "reading", "A1", 0, "2026-10-21T12:00:00.000Z");
  const second = markPracticeComplete(first, "reading", "A1", 1, "2026-10-21T13:00:00.000Z");
  assert.equal(Object.keys(second.completed).length, 2);
  assert.ok(second.completed["reading:A1:0"]);
  assert.ok(second.completed["reading:A1:1"]);
});
