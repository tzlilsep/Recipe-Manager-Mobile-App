// English comments only.

export const parseTimeMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  
  // Handle HH:MM format
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  }
  
  // Handle legacy "135 דקות" format
  const m = timeStr.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
