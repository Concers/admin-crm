import type { NextFunction, Request, Response } from "express";
import { prisma } from "./prisma.js";
import type { PartnerType } from "@prisma/client";

/** Wrap an async Express handler so rejected promises hit the error middleware. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

/** Parse a route/query param into a positive integer id, or null. */
export function parseId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Find a partner by name, creating it with a fallback type when missing. */
export async function resolvePartnerId(name: string, fallbackType: PartnerType): Promise<number | null> {
  const key = name.trim();
  if (!key) return null;
  const existing = await prisma.partner.findFirst({ where: { name: key } });
  if (existing) return existing.id;
  const created = await prisma.partner.create({ data: { name: key, type: fallbackType } });
  return created.id;
}

/** Find a product by name, creating it when missing. */
export async function resolveProductId(name: string): Promise<number | null> {
  const key = name.trim();
  if (!key) return null;
  const existing = await prisma.product.findFirst({ where: { name: key } });
  if (existing) return existing.id;
  const created = await prisma.product.create({ data: { name: key } });
  return created.id;
}
