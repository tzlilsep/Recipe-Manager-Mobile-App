// English-only comments required.

/**
 * Frontend expects item.id to be numeric (stringified),
 * but DB stores UUID. This helper produces a stable numeric string from UUID.
 */
export function stableNumericStringFromUuid(uuid: string): string {
  let h = 0;
  for (let i = 0; i < uuid.length; i++) {
    h = ((h << 5) - h) + uuid.charCodeAt(i);
    h |= 0; // 32-bit
  }
  const n = Math.abs(h) + 1;
  return String(n);
}
