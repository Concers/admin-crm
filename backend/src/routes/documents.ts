// =============================================================================
// Phase 4 ERP document routes: orders, quotes, invoices, delivery notes,
// returns, BOMs, production orders, price lists, discounts, attachments.
//
// All writes require the ADMIN role; reads rely on the global requireAuth guard
// mounted in index.ts. Line-bearing documents (Order/Quote/Invoice) recompute
// their header totals from their lines on every create/update.
// =============================================================================

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, parseId } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";
import { validateBody } from "../lib/validate.js";
import { parseDate } from "../lib/calculations.js";

export const documentsRouter = Router();

// --- Shared helpers ----------------------------------------------------------

const lineSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number(),
  unitPrice: z.number(),
  vatRate: z.number().default(0.2),
});

type LineInput = z.infer<typeof lineSchema>;

/** Compute per-line totals and the header totalAmount / vatIncludedAmount. */
function computeTotals(lines: LineInput[]) {
  const computedLines = lines.map((l) => ({
    productId: l.productId,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    vatRate: l.vatRate,
    lineTotal: l.quantity * l.unitPrice,
  }));
  const totalAmount = computedLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const vatIncludedAmount = computedLines.reduce(
    (sum, l) => sum + l.lineTotal * (1 + l.vatRate),
    0,
  );
  return { computedLines, totalAmount, vatIncludedAmount };
}

const docTypeEnum = z.enum(["SALES", "PURCHASE"]);

// Allowed values for list-filter query params, used to reject typos with a 400
// (an unvalidated filter would silently return an empty list instead).
const DOC_TYPES = ["SALES", "PURCHASE"] as const;
const ORDER_STATUSES = ["DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED"] as const;
const QUOTE_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED"] as const;
const INVOICE_STATUSES = ["DRAFT", "ISSUED", "PAID", "CANCELLED"] as const;
const PRODUCTION_STATUSES = ["PLANNED", "IN_PROGRESS", "DONE", "CANCELLED"] as const;

/**
 * Validate an optional enum query param. Returns `undefined` when absent, the
 * value when valid, or `null` when present-but-invalid (caller responds 400).
 */
function enumQuery(raw: unknown, allowed: readonly string[]): string | undefined | null {
  if (raw === undefined || raw === "") return undefined;
  const v = String(raw);
  return allowed.includes(v) ? v : null;
}

// =============================================================================
// 1. Orders — /orders
// =============================================================================

const orderBodySchema = z.object({
  docType: docTypeEnum,
  partnerId: z.number().int().positive(),
  date: z.string().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED"]).optional(),
  notes: z.string().optional(),
  lines: z.array(lineSchema).default([]),
});

documentsRouter.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const docType = enumQuery(req.query.docType, DOC_TYPES);
    const status = enumQuery(req.query.status, ORDER_STATUSES);
    if (docType === null || status === null) return res.status(400).json({ error: "invalid docType/status filter" });
    res.json(
      await prisma.order.findMany({
        where: {
          ...(docType ? { docType: docType as never } : {}),
          ...(status ? { status: status as never } : {}),
        },
        orderBy: { date: "desc" },
        include: { lines: true },
      }),
    );
  }),
);

documentsRouter.get(
  "/orders/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const order = await prisma.order.findUnique({ where: { id }, include: { lines: true } });
    if (!order) return res.status(404).json({ error: "not_found" });
    res.json(order);
  }),
);

documentsRouter.post(
  "/orders",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(orderBodySchema, req.body, res);
    if (!data) return;
    const { computedLines, totalAmount, vatIncludedAmount } = computeTotals(data.lines);
    const order = await prisma.order.create({
      data: {
        docType: data.docType,
        partnerId: data.partnerId,
        date: parseDate(data.date) ?? new Date(),
        status: data.status ?? "DRAFT",
        notes: data.notes ?? null,
        totalAmount,
        vatIncludedAmount,
        lines: { create: computedLines },
      },
      include: { lines: true },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Order", entityId: order.id });
    res.status(201).json(order);
  }),
);

documentsRouter.put(
  "/orders/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const data = validateBody(orderBodySchema, req.body, res);
    if (!data) return;
    const { computedLines, totalAmount, vatIncludedAmount } = computeTotals(data.lines);
    const order = await prisma.$transaction(async (tx) => {
      await tx.orderLine.deleteMany({ where: { orderId: id } });
      return tx.order.update({
        where: { id },
        data: {
          docType: data.docType,
          partnerId: data.partnerId,
          date: parseDate(data.date) ?? existing.date,
          status: data.status ?? existing.status,
          notes: data.notes ?? null,
          totalAmount,
          vatIncludedAmount,
          lines: { create: computedLines },
        },
        include: { lines: true },
      });
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Order", entityId: order.id });
    res.json(order);
  }),
);

documentsRouter.delete(
  "/orders/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    await prisma.order.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Order", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// 2. Quotes — /quotes
// =============================================================================

const quoteBodySchema = z.object({
  partnerId: z.number().int().positive(),
  date: z.string().optional(),
  validUntil: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]).optional(),
  notes: z.string().optional(),
  lines: z.array(lineSchema).default([]),
});

documentsRouter.get(
  "/quotes",
  asyncHandler(async (req, res) => {
    const status = enumQuery(req.query.status, QUOTE_STATUSES);
    if (status === null) return res.status(400).json({ error: "invalid status filter" });
    res.json(
      await prisma.quote.findMany({
        where: status ? { status: status as never } : {},
        orderBy: { date: "desc" },
        include: { lines: true },
      }),
    );
  }),
);

documentsRouter.get(
  "/quotes/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const quote = await prisma.quote.findUnique({ where: { id }, include: { lines: true } });
    if (!quote) return res.status(404).json({ error: "not_found" });
    res.json(quote);
  }),
);

documentsRouter.post(
  "/quotes",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(quoteBodySchema, req.body, res);
    if (!data) return;
    const { computedLines, totalAmount, vatIncludedAmount } = computeTotals(data.lines);
    const quote = await prisma.quote.create({
      data: {
        partnerId: data.partnerId,
        date: parseDate(data.date) ?? new Date(),
        validUntil: parseDate(data.validUntil),
        status: data.status ?? "DRAFT",
        notes: data.notes ?? null,
        totalAmount,
        vatIncludedAmount,
        lines: { create: computedLines },
      },
      include: { lines: true },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Quote", entityId: quote.id });
    res.status(201).json(quote);
  }),
);

documentsRouter.put(
  "/quotes/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.quote.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const data = validateBody(quoteBodySchema, req.body, res);
    if (!data) return;
    const { computedLines, totalAmount, vatIncludedAmount } = computeTotals(data.lines);
    const quote = await prisma.$transaction(async (tx) => {
      await tx.quoteLine.deleteMany({ where: { quoteId: id } });
      return tx.quote.update({
        where: { id },
        data: {
          partnerId: data.partnerId,
          date: parseDate(data.date) ?? existing.date,
          validUntil: parseDate(data.validUntil),
          status: data.status ?? existing.status,
          notes: data.notes ?? null,
          totalAmount,
          vatIncludedAmount,
          lines: { create: computedLines },
        },
        include: { lines: true },
      });
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Quote", entityId: quote.id });
    res.json(quote);
  }),
);

documentsRouter.delete(
  "/quotes/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.quote.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    await prisma.quote.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Quote", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// 3. Invoices — /invoices
// =============================================================================

const invoiceBodySchema = z.object({
  docType: docTypeEnum,
  partnerId: z.number().int().positive(),
  orderId: z.number().int().positive().optional(),
  number: z.string().optional(),
  date: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["DRAFT", "ISSUED", "PAID", "CANCELLED"]).optional(),
  notes: z.string().optional(),
  lines: z.array(lineSchema).default([]),
});

documentsRouter.get(
  "/invoices",
  asyncHandler(async (req, res) => {
    const docType = enumQuery(req.query.docType, DOC_TYPES);
    const status = enumQuery(req.query.status, INVOICE_STATUSES);
    if (docType === null || status === null) return res.status(400).json({ error: "invalid docType/status filter" });
    res.json(
      await prisma.invoice.findMany({
        where: {
          ...(docType ? { docType: docType as never } : {}),
          ...(status ? { status: status as never } : {}),
        },
        orderBy: { date: "desc" },
        include: { lines: true },
      }),
    );
  }),
);

documentsRouter.get(
  "/invoices/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const invoice = await prisma.invoice.findUnique({ where: { id }, include: { lines: true } });
    if (!invoice) return res.status(404).json({ error: "not_found" });
    res.json(invoice);
  }),
);

documentsRouter.post(
  "/invoices",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(invoiceBodySchema, req.body, res);
    if (!data) return;
    // Reject a duplicate invoice number so the same invoice isn't booked twice.
    if (data.number?.trim()) {
      const dup = await prisma.invoice.findFirst({ where: { number: data.number.trim() } });
      if (dup) return res.status(409).json({ error: "duplicate_number", message: `"${data.number.trim()}" numaralı fatura zaten mevcut.` });
    }
    const { computedLines, totalAmount, vatIncludedAmount } = computeTotals(data.lines);
    const invoice = await prisma.invoice.create({
      data: {
        docType: data.docType,
        partnerId: data.partnerId,
        orderId: data.orderId ?? null,
        number: data.number ?? null,
        date: parseDate(data.date) ?? new Date(),
        dueDate: parseDate(data.dueDate),
        status: data.status ?? "DRAFT",
        notes: data.notes ?? null,
        totalAmount,
        vatIncludedAmount,
        lines: { create: computedLines },
      },
      include: { lines: true },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Invoice", entityId: invoice.id });
    res.status(201).json(invoice);
  }),
);

documentsRouter.put(
  "/invoices/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const data = validateBody(invoiceBodySchema, req.body, res);
    if (!data) return;
    // Reject a duplicate number held by a DIFFERENT invoice.
    if (data.number?.trim()) {
      const dup = await prisma.invoice.findFirst({ where: { number: data.number.trim(), id: { not: id } } });
      if (dup) return res.status(409).json({ error: "duplicate_number", message: `"${data.number.trim()}" numaralı fatura zaten mevcut.` });
    }
    const { computedLines, totalAmount, vatIncludedAmount } = computeTotals(data.lines);
    const invoice = await prisma.$transaction(async (tx) => {
      await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
      return tx.invoice.update({
        where: { id },
        data: {
          docType: data.docType,
          partnerId: data.partnerId,
          orderId: data.orderId ?? null,
          number: data.number ?? null,
          date: parseDate(data.date) ?? existing.date,
          dueDate: parseDate(data.dueDate),
          status: data.status ?? existing.status,
          notes: data.notes ?? null,
          totalAmount,
          vatIncludedAmount,
          lines: { create: computedLines },
        },
        include: { lines: true },
      });
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Invoice", entityId: invoice.id });
    res.json(invoice);
  }),
);

documentsRouter.delete(
  "/invoices/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    await prisma.invoice.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Invoice", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// 4. Delivery notes — /delivery-notes  (lines: {productId, quantity}, no money)
// =============================================================================

const deliveryNoteBodySchema = z.object({
  docType: docTypeEnum,
  partnerId: z.number().int().positive(),
  orderId: z.number().int().positive().optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
  lines: z
    .array(z.object({ productId: z.number().int().positive(), quantity: z.number() }))
    .default([]),
});

documentsRouter.get(
  "/delivery-notes",
  asyncHandler(async (_req, res) => {
    res.json(
      await prisma.deliveryNote.findMany({ orderBy: { date: "desc" }, include: { lines: true } }),
    );
  }),
);

documentsRouter.get(
  "/delivery-notes/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const note = await prisma.deliveryNote.findUnique({ where: { id }, include: { lines: true } });
    if (!note) return res.status(404).json({ error: "not_found" });
    res.json(note);
  }),
);

documentsRouter.post(
  "/delivery-notes",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(deliveryNoteBodySchema, req.body, res);
    if (!data) return;
    const note = await prisma.deliveryNote.create({
      data: {
        docType: data.docType,
        partnerId: data.partnerId,
        orderId: data.orderId ?? null,
        date: parseDate(data.date) ?? new Date(),
        notes: data.notes ?? null,
        lines: { create: data.lines },
      },
      include: { lines: true },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "DeliveryNote", entityId: note.id });
    res.status(201).json(note);
  }),
);

documentsRouter.put(
  "/delivery-notes/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.deliveryNote.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const data = validateBody(deliveryNoteBodySchema, req.body, res);
    if (!data) return;
    const note = await prisma.$transaction(async (tx) => {
      await tx.deliveryNoteLine.deleteMany({ where: { deliveryNoteId: id } });
      return tx.deliveryNote.update({
        where: { id },
        data: {
          docType: data.docType,
          partnerId: data.partnerId,
          orderId: data.orderId ?? null,
          date: parseDate(data.date) ?? existing.date,
          notes: data.notes ?? null,
          lines: { create: data.lines },
        },
        include: { lines: true },
      });
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "DeliveryNote", entityId: note.id });
    res.json(note);
  }),
);

documentsRouter.delete(
  "/delivery-notes/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.deliveryNote.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    await prisma.deliveryNote.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "DeliveryNote", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// 5. Returns — /returns  (single-row, no lines)
// =============================================================================

const returnBodySchema = z.object({
  type: z.enum(["SALES_RETURN", "PURCHASE_RETURN"]),
  partnerId: z.number().int().positive(),
  productId: z.number().int().positive(),
  date: z.string().optional(),
  quantity: z.number(),
  amount: z.number().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

documentsRouter.get(
  "/returns",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.return.findMany({ orderBy: { date: "desc" } }));
  }),
);

documentsRouter.get(
  "/returns/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const ret = await prisma.return.findUnique({ where: { id } });
    if (!ret) return res.status(404).json({ error: "not_found" });
    res.json(ret);
  }),
);

documentsRouter.post(
  "/returns",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(returnBodySchema, req.body, res);
    if (!data) return;
    const ret = await prisma.return.create({
      data: {
        type: data.type,
        partnerId: data.partnerId,
        productId: data.productId,
        date: parseDate(data.date) ?? new Date(),
        quantity: data.quantity,
        amount: data.amount ?? 0,
        reason: data.reason ?? null,
        notes: data.notes ?? null,
      },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Return", entityId: ret.id });
    res.status(201).json(ret);
  }),
);

documentsRouter.put(
  "/returns/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.return.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const data = validateBody(returnBodySchema, req.body, res);
    if (!data) return;
    const ret = await prisma.return.update({
      where: { id },
      data: {
        type: data.type,
        partnerId: data.partnerId,
        productId: data.productId,
        date: parseDate(data.date) ?? existing.date,
        quantity: data.quantity,
        amount: data.amount ?? 0,
        reason: data.reason ?? null,
        notes: data.notes ?? null,
      },
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Return", entityId: ret.id });
    res.json(ret);
  }),
);

documentsRouter.delete(
  "/returns/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.return.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    await prisma.return.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Return", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// 6. BOMs — /boms
// =============================================================================

const bomBodySchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1),
  isActive: z.boolean().optional(),
  components: z
    .array(z.object({ componentProductId: z.number().int().positive(), quantity: z.number() }))
    .default([]),
});

documentsRouter.get(
  "/boms",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.bom.findMany({ orderBy: { id: "desc" }, include: { components: true } }));
  }),
);

documentsRouter.get(
  "/boms/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const bom = await prisma.bom.findUnique({ where: { id }, include: { components: true } });
    if (!bom) return res.status(404).json({ error: "not_found" });
    res.json(bom);
  }),
);

documentsRouter.post(
  "/boms",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(bomBodySchema, req.body, res);
    if (!data) return;
    const bom = await prisma.bom.create({
      data: {
        productId: data.productId,
        name: data.name,
        isActive: data.isActive ?? true,
        components: { create: data.components },
      },
      include: { components: true },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Bom", entityId: bom.id });
    res.status(201).json(bom);
  }),
);

documentsRouter.put(
  "/boms/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.bom.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const data = validateBody(bomBodySchema, req.body, res);
    if (!data) return;
    const bom = await prisma.$transaction(async (tx) => {
      await tx.bomComponent.deleteMany({ where: { bomId: id } });
      return tx.bom.update({
        where: { id },
        data: {
          productId: data.productId,
          name: data.name,
          isActive: data.isActive ?? existing.isActive,
          components: { create: data.components },
        },
        include: { components: true },
      });
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Bom", entityId: bom.id });
    res.json(bom);
  }),
);

documentsRouter.delete(
  "/boms/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.bom.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    await prisma.bom.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Bom", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// 7. Production orders — /production-orders
// =============================================================================

const productionOrderBodySchema = z.object({
  bomId: z.number().int().positive().optional(),
  productId: z.number().int().positive(),
  quantity: z.number(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

documentsRouter.get(
  "/production-orders",
  asyncHandler(async (req, res) => {
    const status = enumQuery(req.query.status, PRODUCTION_STATUSES);
    if (status === null) return res.status(400).json({ error: "invalid status filter" });
    res.json(
      await prisma.productionOrder.findMany({
        where: status ? { status: status as never } : {},
        orderBy: { id: "desc" },
      }),
    );
  }),
);

documentsRouter.get(
  "/production-orders/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const po = await prisma.productionOrder.findUnique({ where: { id } });
    if (!po) return res.status(404).json({ error: "not_found" });
    res.json(po);
  }),
);

documentsRouter.post(
  "/production-orders",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(productionOrderBodySchema, req.body, res);
    if (!data) return;
    const po = await prisma.productionOrder.create({
      data: {
        bomId: data.bomId ?? null,
        productId: data.productId,
        quantity: data.quantity,
        status: data.status ?? "PLANNED",
        startDate: parseDate(data.startDate),
        endDate: parseDate(data.endDate),
        notes: data.notes ?? null,
      },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "ProductionOrder", entityId: po.id });
    res.status(201).json(po);
  }),
);

documentsRouter.put(
  "/production-orders/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.productionOrder.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const data = validateBody(productionOrderBodySchema, req.body, res);
    if (!data) return;
    const po = await prisma.productionOrder.update({
      where: { id },
      data: {
        bomId: data.bomId ?? null,
        productId: data.productId,
        quantity: data.quantity,
        status: data.status ?? existing.status,
        startDate: parseDate(data.startDate),
        endDate: parseDate(data.endDate),
        notes: data.notes ?? null,
      },
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "ProductionOrder", entityId: po.id });
    res.json(po);
  }),
);

documentsRouter.delete(
  "/production-orders/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.productionOrder.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    await prisma.productionOrder.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "ProductionOrder", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// 8. Price lists — /price-lists
// =============================================================================

const priceListBodySchema = z.object({
  name: z.string().min(1),
  currency: z.string().optional(),
  tier: z.string().optional(), // müşteri segmenti (Partner.priceTier ile eşleşir)
  isActive: z.boolean().optional(),
  items: z
    .array(z.object({ productId: z.number().int().positive(), price: z.number() }))
    .default([]),
});

documentsRouter.get(
  "/price-lists",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.priceList.findMany({ orderBy: { name: "asc" }, include: { items: true } }));
  }),
);

documentsRouter.get(
  "/price-lists/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const pl = await prisma.priceList.findUnique({ where: { id }, include: { items: true } });
    if (!pl) return res.status(404).json({ error: "not_found" });
    res.json(pl);
  }),
);

documentsRouter.post(
  "/price-lists",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(priceListBodySchema, req.body, res);
    if (!data) return;
    const pl = await prisma.priceList.create({
      data: {
        name: data.name,
        currency: data.currency ?? "TRY",
        tier: data.tier?.trim() || null,
        isActive: data.isActive ?? true,
        items: { create: data.items },
      },
      include: { items: true },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "PriceList", entityId: pl.id });
    res.status(201).json(pl);
  }),
);

documentsRouter.put(
  "/price-lists/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.priceList.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const data = validateBody(priceListBodySchema, req.body, res);
    if (!data) return;
    const pl = await prisma.$transaction(async (tx) => {
      await tx.priceListItem.deleteMany({ where: { priceListId: id } });
      return tx.priceList.update({
        where: { id },
        data: {
          name: data.name,
          currency: data.currency ?? existing.currency,
          tier: data.tier?.trim() || null,
          isActive: data.isActive ?? existing.isActive,
          items: { create: data.items },
        },
        include: { items: true },
      });
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "PriceList", entityId: pl.id });
    res.json(pl);
  }),
);

documentsRouter.delete(
  "/price-lists/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.priceList.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    await prisma.priceList.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "PriceList", entityId: id });
    res.status(204).end();
  }),
);

/**
 * Resolve the unit price for a product given a partner, using the partner's
 * price tier (Partner.priceTier → PriceList.tier). Lets the sales form auto-fill
 * the wholesale/retail price. Returns `{ price: null }` when no tiered price
 * exists so the UI falls back to manual entry.
 */
documentsRouter.get(
  "/price-resolve",
  asyncHandler(async (req, res) => {
    const partnerId = req.query.partnerId ? Number(req.query.partnerId) : NaN;
    const productId = req.query.productId ? Number(req.query.productId) : NaN;
    if (!Number.isInteger(partnerId) || !Number.isInteger(productId)) {
      return res.status(400).json({ error: "partnerId and productId are required" });
    }
    const partner = await prisma.partner.findUnique({ where: { id: partnerId }, select: { priceTier: true } });
    const tier = partner?.priceTier?.trim() || null;
    if (!tier) return res.json({ price: null, reason: "partner_has_no_tier" });

    const priceList = await prisma.priceList.findFirst({
      where: { tier, isActive: true },
      orderBy: { id: "desc" },
      include: { items: { where: { productId } } },
    });
    const item = priceList?.items[0];
    if (!item) return res.json({ price: null, reason: "no_price_for_tier", tier });
    res.json({ price: item.price, currency: priceList!.currency, tier, priceListId: priceList!.id, priceListName: priceList!.name });
  }),
);

// =============================================================================
// 9. Discounts — /discounts
// =============================================================================

const discountBodySchema = z.object({
  name: z.string().min(1),
  percent: z.number().optional(),
  amount: z.number().optional(),
  productId: z.number().int().positive().optional(),
  partnerId: z.number().int().positive().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  isActive: z.boolean().optional(),
});

documentsRouter.get(
  "/discounts",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.discount.findMany({ orderBy: { id: "desc" } }));
  }),
);

documentsRouter.get(
  "/discounts/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const discount = await prisma.discount.findUnique({ where: { id } });
    if (!discount) return res.status(404).json({ error: "not_found" });
    res.json(discount);
  }),
);

documentsRouter.post(
  "/discounts",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(discountBodySchema, req.body, res);
    if (!data) return;
    const discount = await prisma.discount.create({
      data: {
        name: data.name,
        percent: data.percent ?? null,
        amount: data.amount ?? null,
        productId: data.productId ?? null,
        partnerId: data.partnerId ?? null,
        validFrom: parseDate(data.validFrom),
        validTo: parseDate(data.validTo),
        isActive: data.isActive ?? true,
      },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Discount", entityId: discount.id });
    res.status(201).json(discount);
  }),
);

documentsRouter.put(
  "/discounts/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.discount.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const data = validateBody(discountBodySchema, req.body, res);
    if (!data) return;
    const discount = await prisma.discount.update({
      where: { id },
      data: {
        name: data.name,
        percent: data.percent ?? null,
        amount: data.amount ?? null,
        productId: data.productId ?? null,
        partnerId: data.partnerId ?? null,
        validFrom: parseDate(data.validFrom),
        validTo: parseDate(data.validTo),
        isActive: data.isActive ?? existing.isActive,
      },
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Discount", entityId: discount.id });
    res.json(discount);
  }),
);

documentsRouter.delete(
  "/discounts/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.discount.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    await prisma.discount.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Discount", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// 10. Attachments — /attachments  (metadata/url only, no real upload)
// =============================================================================

const attachmentBodySchema = z.object({
  entityName: z.string().min(1),
  entityId: z.number().int().positive(),
  category: z.string().optional(), // ürün kartı: ANALIZ / SERTIFIKA / GORSEL / ETIKET
  fileName: z.string().min(1),
  url: z.string().min(1),
  mimeType: z.string().optional(),
  size: z.number().int().optional(),
});

documentsRouter.get(
  "/attachments",
  asyncHandler(async (req, res) => {
    const entityName = req.query.entityName ? String(req.query.entityName) : undefined;
    const entityId = req.query.entityId ? parseId(req.query.entityId) : undefined;
    res.json(
      await prisma.attachment.findMany({
        where: {
          ...(entityName ? { entityName } : {}),
          ...(entityId ? { entityId } : {}),
        },
        orderBy: { uploadedAt: "desc" },
      }),
    );
  }),
);

documentsRouter.post(
  "/attachments",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(attachmentBodySchema, req.body, res);
    if (!data) return;
    const attachment = await prisma.attachment.create({
      data: {
        entityName: data.entityName,
        entityId: data.entityId,
        category: data.category ?? null,
        fileName: data.fileName,
        url: data.url,
        mimeType: data.mimeType ?? null,
        size: data.size ?? null,
      },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Attachment", entityId: attachment.id });
    res.status(201).json(attachment);
  }),
);

documentsRouter.delete(
  "/attachments/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.attachment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    await prisma.attachment.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Attachment", entityId: id });
    res.status(204).end();
  }),
);
