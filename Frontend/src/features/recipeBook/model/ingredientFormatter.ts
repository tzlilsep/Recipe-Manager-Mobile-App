// English comments only.
// Ingredient formatting utilities - centralized rules for displaying ingredients
// - Input: ASCII only (no unicode fractions), dot-decimals only (no comma)
// - Display: amount BEFORE unit always
// - Display style by unit:
//   * Household units -> fractions (e.g., "1/2", "1 3/4")
//   * Metric units -> decimals (e.g., "0.5", "125")

import { Ingredient } from './types';

/** UI helper text (show under the amount field) */
export const AMOUNT_HELP_TEXT =
  'ניתן להכניס כמות בפורמטים הבאים:\n3, 1.5, 3/4, 1 2/3 \n(רק שברים עם בסיס 2, 3, 4 או 8)';

/** Allowed denominators for USER INPUT fractions */
const INPUT_ALLOWED_DENOMS = new Set([2, 3, 4, 8]);

/** Regex patterns for supported input formats */
const RE_INT = /^\d+$/;                      // "3"
const RE_DECIMAL = /^\d+\.\d+$/;             // "1.5" (dot only)
const RE_FRACTION = /^\d+\s*\/\s*\d+$/;      // "3/4"
const RE_MIXED = /^\d+\s+\d+\s*\/\s*\d+$/;   // "1 2/3"

/** Hebrew plural rules for common units */
const PLURAL_RULES: Record<string, string> = {
  'כוס': 'כוסות',
  'כף': 'כפות',
  'כפית': 'כפיות',
  'יחידה': 'יחידות',
  'שן': 'שיניים',
  'חבילה': 'חבילות',
};

/** Units that do not change between singular/plural */
const INVARIANT_UNITS = new Set<string>(['גרם', 'מ״ל', 'מ"ל', 'ק״ג', 'ק"ג', 'ליטר']);

/**
 * Display style by unit:
 * - FRACTION_UNITS: show as fractions
 * - DECIMAL_UNITS: show as decimals
 */
const FRACTION_UNITS = new Set<string>(['כוס', 'כף', 'כפית', 'יחידה']);
const DECIMAL_UNITS = new Set<string>(['גרם', 'מ״ל', 'מ"ל', 'ק״ג', 'ק"ג', 'ליטר']);

/** Fraction denominators we use for DISPLAY/SCALING to keep results readable */
const DISPLAY_DENOMS = [2, 3, 4, 8];

function nearlyEqual(a: number, b: number, eps = 1e-9) {
  return Math.abs(a - b) < eps;
}

function isIntegerish(x: number, eps = 1e-9) {
  return nearlyEqual(x, Math.round(x), eps);
}

function normalizeSpaces(s: string) {
  // "1  2 / 3" -> "1 2/3"
  return s.trim().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ');
}

/**
 * Parse amount string to numeric value.
 * Supports:
 * - "3/4"
 * - "1 2/3"
 * - "1.5"
 * - "3"
 */
export function parseAmountToNumber(amount: string | undefined): number {
  if (!amount) return 0;
  const trimmed = amount.trim();
  if (!trimmed) return 0;

  // Mixed fraction FIRST: "1 2/3"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const num = Number(mixedMatch[2]);
    const den = Number(mixedMatch[3]);
    if (Number.isFinite(whole) && Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
      return whole + num / den;
    }
  }

  // Simple fraction: "3/4"
  const fracMatch = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fracMatch) {
    const num = Number(fracMatch[1]);
    const den = Number(fracMatch[2]);
    if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
      return num / den;
    }
  }

  // Decimal or integer
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : 0;
}

/** Validation result type */
export type AmountValidation =
  | { ok: true; normalized: string; value: number }
  | { ok: false; error: string };

/**
 * Validate amount input:
 * - Allowed formats: "3", "1.5", "3/4", "1 2/3"
 * - Dot only for decimals
 * - Fractions allowed denominators: 2, 3, 4, 8
 * - Allows extra spaces; we normalize them for storage
 */
export function validateAmount(input?: string): AmountValidation {
  const raw = (input ?? '').trim();
  if (!raw) return { ok: false, error: 'נא להזין כמות' };

  const validFormat =
    RE_INT.test(raw) || RE_DECIMAL.test(raw) || RE_FRACTION.test(raw) || RE_MIXED.test(raw);

  if (!validFormat) return { ok: false, error: AMOUNT_HELP_TEXT };

  // Fraction denominator restrictions (for "a/b" or "x a/b")
  if (raw.includes('/')) {
    const fracPart = raw.includes(' ') ? raw.split(/\s+/).pop()! : raw;
    const [, denStr] = fracPart.split('/');
    const den = Number(denStr);

    if (!Number.isFinite(den) || den === 0) {
      return { ok: false, error: 'מכנה לא יכול להיות 0' };
    }
    if (!INPUT_ALLOWED_DENOMS.has(den)) {
      return { ok: false, error: 'מותר להשתמש רק בשברים עם בסיס 2, 3, 4 או 8' };
    }
  }

  const value = parseAmountToNumber(raw);
  if (!(value > 0)) return { ok: false, error: 'כמות חייבת להיות גדולה מ-0' };

  return { ok: true, normalized: normalizeSpaces(raw), value };
}

/**
 * Optional: convert input to decimal number for storage.
 * (Call validateAmount() in UI first; this does not enforce allowed denominators by itself.)
 */
export function convertAmountToDecimal(input: string | undefined): number | undefined {
  if (!input) return undefined;
  const value = parseAmountToNumber(input);
  return value > 0 ? value : undefined;
}

/**
 * Find the closest nice fraction using DISPLAY_DENOMS.
 * Always returns the best approximation, no error threshold.
 */
function approximateToNiceFraction(
  value: number
): { approx: number; num?: number; den?: number } {
  if (!Number.isFinite(value) || value <= 0) return { approx: value };

  let best: { approx: number; num: number; den: number; err: number } | null = null;

  for (const den of DISPLAY_DENOMS) {
    const num = Math.round(value * den);
    const approx = num / den;
    const err = Math.abs(approx - value);
    if (!best || err < best.err) best = { approx, num, den, err };
  }

  if (best) {
    return { approx: best.approx, num: best.num, den: best.den };
  }

  return { approx: value };
}

/** Format number as ASCII fraction "1 1/2" / "3/4" / "2" (no unicode) */
function formatNumberToAsciiFraction(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';

  const { approx } = approximateToNiceFraction(value);
  const v = approx;

  if (isIntegerish(v)) return String(Math.round(v));

  const whole = Math.floor(v);
  const frac = v - whole;

  const fracSnap = approximateToNiceFraction(frac);
  if (fracSnap.num !== undefined && fracSnap.den !== undefined && fracSnap.num > 0) {
    if (fracSnap.num === fracSnap.den) return String(whole + 1);
    // Add LTR mark to keep numbers left-to-right in RTL context
    const fractionPart = `${fracSnap.num}/${fracSnap.den}`;
    return whole > 0 ? `\u200E${whole} ${fractionPart}` : `\u200E${fractionPart}`;
  }

  return v.toFixed(2).replace(/\.?0+$/, '');
}

/**
 * Format number as decimal string by unit (choose precision per unit family).
 * You can tune precision here without touching any other code.
 */
function formatNumberToDecimalByUnit(value: number, unit?: string): string {
  if (!Number.isFinite(value) || value <= 0) return '';

  const u = (unit ?? '').trim();

  // Example policy:
  // - grams / ml: 1 decimal for values < 10, else integer
  // - kg / liter: 2 decimals for values < 1, else 1 decimal
  if (u === 'גרם' || u === 'מ״ל' || u === 'מ"ל') {
    if (value < 10) return value.toFixed(1).replace(/\.0$/, '');
    return Math.round(value).toString();
  }

  if (u === 'ק״ג' || u === 'ק"ג' || u === 'ליטר') {
    if (value < 1) return value.toFixed(2).replace(/\.?0+$/, '');
    return value.toFixed(1).replace(/\.0$/, '');
  }

  // Default decimal formatting if unit is considered decimal
  return value.toFixed(1).replace(/\.0$/, '');
}

/**
 * Format amount for display, choosing style by unit:
 * - Household units => fraction display
 * - Metric units => decimal display
 * - Unknown units => fraction display (safe default for cooking)
 */
export function formatAmountByUnit(amount: string | undefined, unit: string | undefined): string {
  if (!amount) return '';
  const raw = amount.trim();
  if (!raw) return '';

  const value = parseAmountToNumber(raw);
  if (!(value > 0)) return raw;

  const u = (unit ?? '').trim();

  if (u && DECIMAL_UNITS.has(u)) return formatNumberToDecimalByUnit(value, u);
  if (u && FRACTION_UNITS.has(u)) return formatNumberToAsciiFraction(value);

  // Default
  return formatNumberToAsciiFraction(value);
}

/**
 * Pluralize unit based on amount.
 * - Amount <= 1 => singular (e.g., "1 כוס", "1/2 כוס", "3/4 כוס")
 * - Amount > 1 => plural (e.g., "2 כוסות", "1 1/2 כוסות", "2 2/3 כוסות")
 * - Invariant units never change
 */
export function pluralizeUnit(unit: string | undefined, amount: string | undefined): string {
  if (!unit) return '';
  const u = unit.trim();
  if (!u) return '';

  if (INVARIANT_UNITS.has(u)) return u;
  if (!amount) return u;

  const x = parseAmountToNumber(amount);
  if (x <= 0) return u;

  // If amount is 1 or less (including fractions like 1/2, 3/4), use singular
  if (x <= 1) return u;

  // Otherwise (including mixed fractions like 1 1/2, 2 2/3), use plural
  return PLURAL_RULES[u] || u;
}

/**
 * Format full ingredient display text.
 * IMPORTANT: Always display "amount unit" (amount before unit), never "unit amount".
 */
export function formatIngredientDisplay(ingredient: Ingredient): string {
  const { name, amount, unit } = ingredient;

  if (!name) return '';

  let displayText = name;

  if (!amount && !unit) return displayText;

  const formattedAmount = formatAmountByUnit(amount, unit);
  const numericAmount = parseAmountToNumber(amount);
  
  // Pluralize based on the formatted amount, not the original
  const pluralizedUnit = pluralizeUnit(unit, formattedAmount);

  if (formattedAmount && pluralizedUnit) {
    // If exactly 1 (or very close), show: "unit 1"
    if (Math.abs(numericAmount - 1) < 1e-9) {
      displayText += ` - ${pluralizedUnit} ${formattedAmount}`;
    } else {
      displayText += ` - ${formattedAmount} ${pluralizedUnit}`;
    }
  } else if (formattedAmount) {
    displayText += ` - ${formattedAmount}`;
  } else if (pluralizedUnit) {
    displayText += ` - ${pluralizedUnit}`;
  }

  return displayText;
}


/**
 * Scale ingredient amount by a ratio.
 * Returns a STRING that remains parseable ("1 1/2", "3/4", "2", "1.5").
 * Note: The display style depends on unit (fractions for household, decimals for metric).
 */
export function scaleIngredientAmount(amount: string | undefined, ratio: number, unit?: string): string {
  if (!amount) return '';
  if (!Number.isFinite(ratio) || ratio <= 0 || nearlyEqual(ratio, 1)) return amount;

  const numericAmount = parseAmountToNumber(amount);
  if (numericAmount <= 0) return amount;

  const scaled = numericAmount * ratio;

  const u = (unit ?? '').trim();
  if (u && DECIMAL_UNITS.has(u)) return formatNumberToDecimalByUnit(scaled, u);

  // Default: fractions
  return formatNumberToAsciiFraction(scaled);
}

/**
 * Convenience helper:
 * Use this onBlur/onSubmit. It validates and returns normalized amount for storage.
 * Throws only if you want exception-based flow; otherwise use validateAmount().
 */
export function normalizeAmountOrThrow(input?: string): string {
  const v = validateAmount(input);
  if (!v.ok) throw new Error(v.error);
  return v.normalized;
}
