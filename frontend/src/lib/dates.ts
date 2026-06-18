/**
 * Calendar-date helpers (no time-of-day semantics).
 * API stores business dates at UTC noon; legacy rows use Istanbul fallback.
 */

const DATE_INPUT = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Validate `<input type="date">` value; returns YYYY-MM-DD for the API. */
export function parseDateInput(value: string): string | null {
  const trimmed = value.trim();
  const m = trimmed.match(DATE_INPUT);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() + 1 !== month ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return trimmed;
}

/** API payload: UTC noon on the chosen calendar day (matches backend storage). */
export function dateInputToApi(value: string): string | null {
  const day = parseDateInput(value);
  if (!day) return null;
  return `${day}T12:00:00.000Z`;
}

export type CalendarParts = { year: number; month: number; day: number };

function partsFromIsoPrefix(raw: string): CalendarParts | null {
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

function partsFromIstanbul(value: Date | string): CalendarParts {
  const inst = typeof value === "string" ? new Date(value) : value;
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(inst);
  const [year, month, day] = formatted.split("-").map(Number);
  return { year, month, day };
}

/** Extract calendar Y-M-D for display and date inputs. */
export function parseCalendarParts(value: Date | string): CalendarParts {
  const raw = typeof value === "string" ? value : value.toISOString();

  // Our storage convention: UTC noon on the business day.
  if (/T12:00:00(\.000)?Z/.test(raw)) {
    const p = partsFromIsoPrefix(raw);
    if (p) return p;
  }

  // Legacy rows saved at UTC midnight (date-only ISO / eski toISOString kayıtları).
  if (/T00:00:00(\.000)?Z/.test(raw)) {
    const p = partsFromIsoPrefix(raw);
    if (p) return p;
  }

  // HTML date input / plain ISO date
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const p = partsFromIsoPrefix(raw);
    if (p) return p;
  }

  return partsFromIstanbul(value);
}

export function formatCalendarDate(value: Date | string): string {
  const { year, month, day } = parseCalendarParts(value);
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${dd}.${mm}.${year}`;
}

/** Value for `<input type="date" />`. */
export function toDateInputValue(value: Date | string): string {
  const { year, month, day } = parseCalendarParts(value);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function calendarMonth(value: Date | string): number {
  return parseCalendarParts(value).month;
}

export function calendarYear(value: Date | string): number {
  return parseCalendarParts(value).year;
}

export function calendarDay(value: Date | string): number {
  return parseCalendarParts(value).day;
}
