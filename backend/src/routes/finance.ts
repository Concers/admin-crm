// =============================================================================
// Finance routes — budget targets, payment instruments (çek/senet).
// =============================================================================

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, parseId, resolvePartnerId } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";
import { parseDate } from "../lib/calculations.js";
import { validateBody } from "../lib/validate.js";

export const financeRouter = Router();

financeRouter.use(requireRole("ADMIN"));

const budgetSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  metric: z.enum(["SALES_REVENUE", "EXPENSE_TOTAL", "EXPENSE_CATEGORY"]),
  category: z.string().nullable().optional(),
  amount: z.number().nonnegative(),
  notes: z.string().nullable().optional(),
});

financeRouter.get(
  "/budget-targets",
  asyncHandler(async (req, res) => {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const rows = await prisma.budgetTarget.findMany({
      where: { year },
      orderBy: [{ month: "asc" }, { metric: "asc" }],
    });
    res.json(rows);
  }),
);

financeRouter.post(
  "/budget-targets",
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(budgetSchema, req.body, res);
    if (!data) return;
    if (data.metric === "EXPENSE_CATEGORY" && !data.category?.trim()) {
      return res.status(400).json({ error: "category required for EXPENSE_CATEGORY" });
    }
    const category = data.metric === "EXPENSE_CATEGORY" ? String(data.category).trim() : "";
    const existing = await prisma.budgetTarget.findFirst({
      where: {
        year: data.year,
        month: data.month,
        metric: data.metric,
        category: data.metric === "EXPENSE_CATEGORY" ? category : null,
      },
    });
    const row = existing
      ? await prisma.budgetTarget.update({
          where: { id: existing.id },
          data: { amount: data.amount, notes: data.notes ?? null },
        })
      : await prisma.budgetTarget.create({
          data: {
            year: data.year,
            month: data.month,
            metric: data.metric,
            category: data.metric === "EXPENSE_CATEGORY" ? category : null,
            amount: data.amount,
            notes: data.notes ?? null,
          },
        });
    await recordAudit({
      userId: req.auth?.userId,
      action: existing ? "UPDATE" : "CREATE",
      entityName: "BudgetTarget",
      entityId: row.id,
    });
    res.status(201).json(row);
  }),
);

financeRouter.delete(
  "/budget-targets/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.budgetTarget.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "BudgetTarget", entityId: id });
    res.status(204).end();
  }),
);

const instrumentSchema = z.object({
  type: z.enum(["CHEQUE", "PROMISSORY_NOTE"]),
  direction: z.enum(["RECEIVABLE", "PAYABLE"]),
  partnerName: z.string().min(1),
  accountId: z.number().int().positive().nullable().optional(),
  number: z.string().nullable().optional(),
  amount: z.number().positive(),
  currency: z.string().optional(),
  issueDate: z.string(),
  dueDate: z.string(),
  status: z.enum(["PORTFOLIO", "DEPOSITED", "COLLECTED", "PAID", "BOUNCED", "CANCELLED"]).optional(),
  notes: z.string().nullable().optional(),
});

async function buildInstrument(body: Record<string, unknown>) {
  const parsed = instrumentSchema.safeParse(body);
  if (!parsed.success) return null;
  const d = parsed.data;
  const issueDate = parseDate(d.issueDate);
  const dueDate = parseDate(d.dueDate);
  if (!issueDate || !dueDate) return null;
  const partnerType = d.direction === "RECEIVABLE" ? "CUSTOMER" : "SUPPLIER";
  const partnerId = await resolvePartnerId(d.partnerName.trim(), partnerType);
  if (partnerId === null) return null;
  return {
    type: d.type,
    direction: d.direction,
    partnerId,
    accountId: d.accountId ?? null,
    number: d.number?.trim() || null,
    amount: d.amount,
    currency: (d.currency ?? "TRY").trim().toUpperCase() || "TRY",
    issueDate,
    dueDate,
    status: d.status ?? "PORTFOLIO",
    notes: d.notes ?? null,
  };
}

financeRouter.get(
  "/payment-instruments",
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const rows = await prisma.paymentInstrument.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { dueDate: "asc" },
      include: { partner: { select: { name: true, type: true } }, account: { select: { name: true } } },
    });
    res.json(rows);
  }),
);

financeRouter.post(
  "/payment-instruments",
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = await buildInstrument(req.body ?? {});
    if (!data) return res.status(400).json({ error: "invalid payload" });
    const row = await prisma.paymentInstrument.create({ data });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "PaymentInstrument", entityId: row.id });
    const full = await prisma.paymentInstrument.findUnique({
      where: { id: row.id },
      include: { partner: { select: { name: true, type: true } }, account: { select: { name: true } } },
    });
    res.status(201).json(full);
  }),
);

financeRouter.put(
  "/payment-instruments/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.paymentInstrument.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const data = await buildInstrument(req.body ?? {});
    if (!data) return res.status(400).json({ error: "invalid payload" });
    const row = await prisma.paymentInstrument.update({ where: { id }, data });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "PaymentInstrument", entityId: id });
    const full = await prisma.paymentInstrument.findUnique({
      where: { id: row.id },
      include: { partner: { select: { name: true, type: true } }, account: { select: { name: true } } },
    });
    res.json(full);
  }),
);

financeRouter.delete(
  "/payment-instruments/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.paymentInstrument.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "PaymentInstrument", entityId: id });
    res.status(204).end();
  }),
);
