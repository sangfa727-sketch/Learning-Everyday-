export function readLocalValue(key, fallback, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const value = target.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

export function writeLocalValue(key, value, storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    target.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}
