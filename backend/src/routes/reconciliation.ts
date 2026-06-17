// =============================================================================
// Reconciliation (kısmi ödeme / fatura mutabakatı).
//
// Matches cash flows (collections/payments) to invoices via PaymentAllocation.
// A single payment can be split across invoices and an invoice settled by many
// payments. Invoice balance = vatIncludedAmount − Σ allocations; cash-flow
// unallocated = amount − Σ allocations.
// =============================================================================

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, parseId } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";
import { validateBody } from "../lib/validate.js";

export const reconciliationRouter = Router();

// Sales invoices reconcile against COLLECTIONs; purchase invoices against PAYMENTs.
const FLOW_FOR_DOC = { SALES: "COLLECTION", PURCHASE: "PAYMENT" } as const;

/**
 * Reconciliation worksheet for one partner: their invoices (with allocated /
 * balance) and their cash flows (with allocated / unallocated).
 */
reconciliationRouter.get(
  "/reconciliation",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const partnerId = parseId(req.query.partnerId);
    if (!partnerId) return res.status(400).json({ error: "partnerId required" });

    const [invoices, cashFlows, allocations] = await Promise.all([
      prisma.invoice.findMany({ where: { partnerId }, orderBy: { date: "asc" } }),
      prisma.cashFlow.findMany({ where: { partnerId }, orderBy: { date: "asc" } }),
      prisma.paymentAllocation.findMany({
        where: { OR: [{ invoice: { partnerId } }, { cashFlow: { partnerId } }] },
      }),
    ]);

    const allocByInvoice = new Map<number, number>();
    const allocByFlow = new Map<number, number>();
    for (const a of allocations) {
      allocByInvoice.set(a.invoiceId, (allocByInvoice.get(a.invoiceId) ?? 0) + a.amount);
      allocByFlow.set(a.cashFlowId, (allocByFlow.get(a.cashFlowId) ?? 0) + a.amount);
    }

    res.json({
      invoices: invoices.map((i) => {
        const allocated = allocByInvoice.get(i.id) ?? 0;
        return {
          id: i.id,
          docType: i.docType,
          number: i.number,
          date: i.date,
          dueDate: i.dueDate,
          status: i.status,
          total: i.vatIncludedAmount,
          allocated,
          balance: i.vatIncludedAmount - allocated,
        };
      }),
      cashFlows: cashFlows.map((c) => {
        const allocated = allocByFlow.get(c.id) ?? 0;
        return {
          id: c.id,
          type: c.type,
          date: c.date,
          amount: c.amount,
          allocated,
          unallocated: c.amount - allocated,
          notes: c.notes,
        };
      }),
      allocations,
    });
  }),
);

/** Allocate part of a cash flow to an invoice (with over-allocation guards). */
reconciliationRouter.post(
  "/reconciliation/allocate",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = validateBody(
      z.object({ invoiceId: z.number().int().positive(), cashFlowId: z.number().int().positive(), amount: z.number().positive() }),
      req.body,
      res,
    );
    if (!body) return;

    const [invoice, cashFlow, invAlloc, flowAlloc] = await Promise.all([
      prisma.invoice.findUnique({ where: { id: body.invoiceId } }),
      prisma.cashFlow.findUnique({ where: { id: body.cashFlowId } }),
      prisma.paymentAllocation.aggregate({ where: { invoiceId: body.invoiceId }, _sum: { amount: true } }),
      prisma.paymentAllocation.aggregate({ where: { cashFlowId: body.cashFlowId }, _sum: { amount: true } }),
    ]);
    if (!invoice || !cashFlow) return res.status(404).json({ error: "not_found" });

    // The cash-flow direction must fit the invoice type, and both belong to one partner.
    if (cashFlow.type !== FLOW_FOR_DOC[invoice.docType]) {
      return res.status(400).json({ error: "type_mismatch", message: "Ödeme türü fatura türüyle uyuşmuyor." });
    }
    if (cashFlow.partnerId !== invoice.partnerId) {
      return res.status(400).json({ error: "partner_mismatch", message: "Fatura ve ödeme farklı carilere ait." });
    }

    const invoiceBalance = invoice.vatIncludedAmount - (invAlloc._sum.amount ?? 0);
    const flowUnallocated = cashFlow.amount - (flowAlloc._sum.amount ?? 0);
    const EPS = 0.01;
    if (body.amount > invoiceBalance + EPS) {
      return res.status(409).json({ error: "exceeds_invoice", message: `Fatura bakiyesi yetersiz (kalan ${invoiceBalance.toFixed(2)}).` });
    }
    if (body.amount > flowUnallocated + EPS) {
      return res.status(409).json({ error: "exceeds_payment", message: `Ödemenin dağıtılmamış tutarı yetersiz (kalan ${flowUnallocated.toFixed(2)}).` });
    }

    const allocation = await prisma.paymentAllocation.create({
      data: { invoiceId: body.invoiceId, cashFlowId: body.cashFlowId, amount: body.amount },
    });

    // Mark the invoice PAID when fully settled.
    const newBalance = invoiceBalance - body.amount;
    if (newBalance <= EPS && invoice.status !== "PAID") {
      await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "PAID" } });
    }

    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "PaymentAllocation", entityId: allocation.id });
    res.status(201).json(allocation);
  }),
);

/** Remove an allocation (re-opens the invoice if it was fully paid). */
reconciliationRouter.delete(
  "/reconciliation/allocate/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const allocation = await prisma.paymentAllocation.findUnique({ where: { id } });
    if (!allocation) return res.status(404).json({ error: "not_found" });

    await prisma.paymentAllocation.delete({ where: { id } });
    // Re-open the invoice if it is no longer fully settled.
    const remaining = await prisma.paymentAllocation.aggregate({ where: { invoiceId: allocation.invoiceId }, _sum: { amount: true } });
    const invoice = await prisma.invoice.findUnique({ where: { id: allocation.invoiceId } });
    if (invoice && (remaining._sum.amount ?? 0) < invoice.vatIncludedAmount - 0.01 && invoice.status === "PAID") {
      await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "ISSUED" } });
    }

    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "PaymentAllocation", entityId: id });
    res.status(204).end();
  }),
);

/** Open-balance summary per partner (invoiced vs allocated vs open). */
reconciliationRouter.get(
  "/reconciliation/summary",
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const [partners, invoices, allocations] = await Promise.all([
      prisma.partner.findMany(),
      prisma.invoice.findMany({ select: { id: true, partnerId: true, vatIncludedAmount: true } }),
      prisma.paymentAllocation.findMany({ select: { invoiceId: true, amount: true } }),
    ]);
    const allocByInvoice = new Map<number, number>();
    for (const a of allocations) allocByInvoice.set(a.invoiceId, (allocByInvoice.get(a.invoiceId) ?? 0) + a.amount);

    res.json(
      partners
        .map((p) => {
          const inv = invoices.filter((i) => i.partnerId === p.id);
          const invoiced = inv.reduce((s, i) => s + i.vatIncludedAmount, 0);
          const allocated = inv.reduce((s, i) => s + (allocByInvoice.get(i.id) ?? 0), 0);
          return { name: p.name, invoiced, allocated, open: invoiced - allocated };
        })
        .filter((r) => r.invoiced > 0)
        .sort((a, b) => b.open - a.open),
    );
  }),
);
