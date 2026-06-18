import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatCalendarDate as formatCal } from "./dates";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCalendarDate(value: Date | string) {
  return formatCal(value);
}

export function formatDate(value: Date | string) {
  return formatCal(value);
}

export { toDateInputValue, parseCalendarParts, calendarMonth, calendarYear, calendarDay, parseDateInput, dateInputToApi } from "./dates";

/** Aynı isimli seçenekleri tekilleştirir (React key uyarılarını önler). */
export function uniqueStrings(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "tr"));
}
