// English comments only.

export const parseTimeMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const m = timeStr.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
