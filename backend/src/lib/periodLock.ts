// =============================================================================
// Dönem kapatma (period close) guard.
//
// A PeriodLock row (year + optional month) freezes a past accounting period:
// once locked, no transaction whose date falls inside it may be created,
// edited or deleted. `month: null` locks the whole year.
// =============================================================================

import type { Response } from "express";
import { prisma } from "./prisma.js";

/** The lock covering `date` (month-specific or whole-year), or null if open. */
export async function findPeriodLock(date: Date) {
  return prisma.periodLock.findFirst({
    where: { year: date.getFullYear(), OR: [{ month: null }, { month: date.getMonth() + 1 }] },
  });
}

/**
 * Guard for route handlers: ensures every supplied date sits in an OPEN period.
 * If any falls in a locked period it responds 423 and returns `false` (the
 * caller must `return`); otherwise returns `true`.
 */
export async function assertPeriodOpen(res: Response, ...dates: (Date | null | undefined)[]): Promise<boolean> {
  for (const d of dates) {
    if (!d) continue;
    const lock = await findPeriodLock(d);
    if (lock) {
      res.status(423).json({
        error: "period_locked",
        message: `${d.getFullYear()}${lock.month ? "/" + String(lock.month).padStart(2, "0") : " (tüm yıl)"} dönemi kapatılmış; bu tarihe kayıt girilemez, değiştirilemez veya silinemez.`,
        period: { year: d.getFullYear(), month: lock.month ?? null },
      });
      return false;
    }
  }
  return true;
}
