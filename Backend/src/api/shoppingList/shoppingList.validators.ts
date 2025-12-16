
export function asNonEmptyString(v: unknown, errCode: string): string {
  const s = String(v ?? '').trim();
  if (!s) throw new Error(errCode);
  return s;
}

export function asInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.floor(n);
}
