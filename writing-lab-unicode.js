/** Convert one Unicode mathematical/script letter to its plain Latin A-Z/a-z equivalent. */
export function normalizePastedLetter(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if ([...trimmed].length !== 1) return null;
  const normalized = trimmed.normalize("NFKD").replace(/\p{M}/gu, "");
  return /^[A-Za-z]$/.test(normalized) ? normalized : null;
}
