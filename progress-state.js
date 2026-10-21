export const PROGRESS_STORAGE_KEY = "le.progress";
const VALID_SKILLS = new Set(["reading", "listening", "writing", "speaking"]);
const VALID_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

export function emptyProgress() {
  return { version: 1, completed: {} };
}

function isValidProgress(value) {
  if (!value || typeof value !== "object" || value.version !== 1 ||
      !value.completed || typeof value.completed !== "object" ||
      Array.isArray(value.completed)) return false;
  return Object.entries(value.completed).every(([key, timestamp]) =>
    /^(reading|listening|writing|speaking):(A1|A2|B1|B2|C1|C2)$/.test(key) &&
    typeof timestamp === "string" && Number.isFinite(Date.parse(timestamp))
  );
}

export function loadProgress(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY);
    if (raw === null) return emptyProgress();
    const parsed = JSON.parse(raw);
    return isValidProgress(parsed) ? { version: 1, completed: { ...parsed.completed } } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress, storage = globalThis.localStorage) {
  if (!isValidProgress(progress)) return false;
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function markPracticeComplete(progress, skill, level, completedAt = new Date().toISOString()) {
  if (!VALID_SKILLS.has(skill) || !VALID_LEVELS.has(level) ||
      typeof completedAt !== "string" || !Number.isFinite(Date.parse(completedAt))) {
    throw new TypeError("Invalid practice completion details");
  }
  return {
    version: 1,
    completed: { ...progress.completed, [`${skill}:${level}`]: completedAt }
  };
}

export function clearProgress(storage = globalThis.localStorage) {
  try {
    storage.removeItem(PROGRESS_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function exportProgress(progress) {
  if (!isValidProgress(progress)) throw new TypeError("Invalid progress data");
  return JSON.stringify(progress, null, 2);
}
