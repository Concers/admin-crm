// =============================================================================
// List-query helpers: pagination, date-range and free-text search.
//
// Endpoints stay backwards-compatible — they always return a JSON array, but
// honour ?from=&to=&q=&limit=&offset=&order= when present, and set an
// X-Total-Count header so clients can paginate without a breaking envelope.
// =============================================================================

import type { Request, Response } from "express";

export interface ListQuery {
  from?: Date;
  to?: Date;
  q?: string;
  limit?: number;
  offset: number;
  order: "asc" | "desc";
}

export function parseListQuery(req: Request): ListQuery {
  const q = typeof req.query.q === "string" && req.query.q.trim() ? req.query.q.trim() : undefined;
  const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
  const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;
  const limitRaw = Number(req.query.limit);
  const offsetRaw = Number(req.query.offset);
  const order = req.query.order === "asc" ? "asc" : "desc";
  // A bare `to` date (no time) means "up to the end of that day", so records
  // timestamped later in the day aren't wrongly excluded.
  if (to && !Number.isNaN(to.getTime()) && typeof req.query.to === "string" && req.query.to.length <= 10) {
    to.setHours(23, 59, 59, 999);
  }
  return {
    q,
    from: from && !Number.isNaN(from.getTime()) ? from : undefined,
    to: to && !Number.isNaN(to.getTime()) ? to : undefined,
    limit: Number.isInteger(limitRaw) && limitRaw > 0 ? limitRaw : undefined,
    offset: Number.isInteger(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0,
    order,
  };
}

/** Build a Prisma `where.date` range clause from the query (or undefined). */
export function dateRangeWhere(q: ListQuery): { gte?: Date; lte?: Date } | undefined {
  if (!q.from && !q.to) return undefined;
  return { ...(q.from ? { gte: q.from } : {}), ...(q.to ? { lte: q.to } : {}) };
}

/** Apply offset/limit to an in-memory list and set the X-Total-Count header. */
export function paginate<T>(rows: T[], q: ListQuery, res: Response): T[] {
  res.setHeader("X-Total-Count", String(rows.length));
  const start = q.offset;
  const end = q.limit ? start + q.limit : undefined;
  return rows.slice(start, end);
}
