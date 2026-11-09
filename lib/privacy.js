export function maskRegistrationNumber(value) {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/[^a-z0-9]/gi, "").toUpperCase();
  if (!normalized) return "";
  const visibleCharacters = Math.min(4, normalized.length);
  return `${"*".repeat(normalized.length - visibleCharacters)}${normalized.slice(-visibleCharacters)}`;
}
