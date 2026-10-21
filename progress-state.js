export const PROGRESS_STORAGE_KEY = "le.progress";
const VALID_SKILLS = new Set(["reading", "listening", "writing", "speaking"]);
const VALID_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const VALID_EXERCISES = new Set([0, 1]);

export function emptyProgress() {
  return { version: 2, completed: {} };
}

function isValidProgress(value) {
  if (!value || typeof value !== "object" || value.version !== 2 ||
      !value.completed || typeof value.completed !== "object" ||
      Array.isArray(value.completed)) return false;
  return Object.entries(value.completed).every(([key, timestamp]) =>
    /^(reading|listening|writing|speaking):(A1|A2|B1|B2|C1|C2):(0|1)$/.test(key) &&
    typeof timestamp === "string" && Number.isFinite(Date.parse(timestamp))
  );
}

export function loadProgress(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const raw = target.getItem(PROGRESS_STORAGE_KEY);
    if (raw === null) return emptyProgress();
    const parsed = JSON.parse(raw);
    if (isValidProgress(parsed)) return { version: 2, completed: { ...parsed.completed } };
    if (parsed?.version === 1 && parsed.completed && typeof parsed.completed === "object" && !Array.isArray(parsed.completed)) {
      const migrated = {};
      for (const [key, timestamp] of Object.entries(parsed.completed)) {
        if (/^(reading|listening|writing|speaking):(A1|A2|B1|B2|C1|C2)$/.test(key) &&
            typeof timestamp === "string" && Number.isFinite(Date.parse(timestamp))) {
          migrated[`${key}:0`] = timestamp;
        }
      }
      return { version: 2, completed: migrated };
    }
    return emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress, storage) {
  if (!isValidProgress(progress)) return false;
  try {
    const target = storage ?? globalThis.localStorage;
    target.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function markPracticeComplete(progress, skill, level, exerciseIndex = 0, completedAt = new Date().toISOString()) {
  if (!VALID_SKILLS.has(skill) || !VALID_LEVELS.has(level) ||
      !VALID_EXERCISES.has(exerciseIndex) || typeof completedAt !== "string" || !Number.isFinite(Date.parse(completedAt))) {
    throw new TypeError("Invalid practice completion details");
  }
  return {
    version: 2,
    completed: { ...progress.completed, [`${skill}:${level}:${exerciseIndex}`]: completedAt }
  };
}

export function clearProgress(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    target.removeItem(PROGRESS_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function exportProgress(progress) {
  if (!isValidProgress(progress)) throw new TypeError("Invalid progress data");
  return JSON.stringify(progress, null, 2);
}
