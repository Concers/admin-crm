// =============================================================================
// Talep Formu (Request Form) — PRODUCTION (üretim emrinden üreticiye) ve
// PROCUREMENT (tedarik emri: hammadde/malzeme tedarikçisine) talep belgeleri.
// CRUD + üretim emrinden üretme + PDF çıktısı. Yazma işlemleri ADMIN.
// =============================================================================

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, parseId } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";
import { documentToPdf } from "../lib/pdf.js";

export const requestFormsRouter = Router();

const TYPES = new Set(["PRODUCTION", "PROCUREMENT"]);
const STATUSES = new Set(["DRAFT", "SENT", "FULFILLED", "CANCELLED"]);

const TYPE_LABEL: Record<string, string> = {
  PRODUCTION: "Üretim Talep Formu",
  PROCUREMENT: "Tedarik Talep Formu",
};
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Taslak",
  SENT: "Gönderildi",
  FULFILLED: "Karşılandı",
  CANCELLED: "İptal",
};

type LineInput = { productId?: unknown; itemName?: unknown; quantity?: unknown; unit?: unknown; note?: unknown };

/** Normalise a lines[] payload; resolves itemName from the product when omitted. */
async function buildLines(lines: unknown): Promise<
  { productId: number | null; itemName: string; quantity: number; unit: string | null; note: string | null }[]
> {
  if (!Array.isArray(lines)) return [];
  const out = [];
  for (const raw of lines as LineInput[]) {
    const quantity = Number(raw.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    const productId = raw.productId ? parseId(raw.productId) : null;
    let itemName = String(raw.itemName ?? "").trim();
    if (!itemName && productId) {
      const p = await prisma.product.findUnique({ where: { id: productId } });
      itemName = p?.name ?? `#${productId}`;
    }
    if (!itemName) continue;
    out.push({
      productId: productId ?? null,
      itemName,
      quantity,
      unit: String(raw.unit ?? "").trim() || null,
      note: String(raw.note ?? "").trim() || null,
    });
  }
  return out;
}

const withRelations = {
  partner: true,
  productionOrder: true,
  lines: { orderBy: { id: "asc" as const } },
};

// --- List --------------------------------------------------------------------
requestFormsRouter.get(
  "/request-forms",
  asyncHandler(async (req, res) => {
    const type = typeof req.query.type === "string" && TYPES.has(req.query.type) ? req.query.type : undefined;
    const status =
      typeof req.query.status === "string" && STATUSES.has(req.query.status) ? req.query.status : undefined;
    res.json(
      await prisma.requestForm.findMany({
        where: {
          ...(type ? { type: type as "PRODUCTION" | "PROCUREMENT" } : {}),
          ...(status ? { status: status as "DRAFT" | "SENT" | "FULFILLED" | "CANCELLED" } : {}),
        },
        include: { partner: true, lines: true },
        orderBy: { date: "desc" },
      }),
    );
  }),
);

// --- Detail ------------------------------------------------------------------
requestFormsRouter.get(
  "/request-forms/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const form = await prisma.requestForm.findUnique({ where: { id }, include: withRelations });
    if (!form) return res.status(404).json({ error: "not_found" });
    res.json(form);
  }),
);

// --- Create ------------------------------------------------------------------
requestFormsRouter.post(
  "/request-forms",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = req.body ?? {};
    const type = String(body.type ?? "").toUpperCase();
    const partnerId = parseId(body.partnerId);
    if (!TYPES.has(type)) return res.status(400).json({ error: "invalid type" });
    if (!partnerId) return res.status(400).json({ error: "partnerId required" });
    const lines = await buildLines(body.lines);

    const form = await prisma.requestForm.create({
      data: {
        type: type as "PRODUCTION" | "PROCUREMENT",
        partnerId,
        date: body.date ? new Date(String(body.date)) : new Date(),
        notes: String(body.notes ?? "").trim() || null,
        lines: { create: lines },
      },
      include: withRelations,
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "RequestForm", entityId: form.id });
    res.status(201).json(form);
  }),
);

// --- Update (status / notes / partner / date / lines replace) ---------------
requestFormsRouter.put(
  "/request-forms/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.requestForm.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const body = req.body ?? {};
    const status = body.status !== undefined ? String(body.status).toUpperCase() : undefined;
    if (status !== undefined && !STATUSES.has(status)) return res.status(400).json({ error: "invalid status" });
    const partnerId = body.partnerId !== undefined ? parseId(body.partnerId) : undefined;

    const form = await prisma.requestForm.update({
      where: { id },
      data: {
        ...(status ? { status: status as "DRAFT" | "SENT" | "FULFILLED" | "CANCELLED" } : {}),
        ...(body.notes !== undefined ? { notes: String(body.notes ?? "").trim() || null } : {}),
        ...(partnerId ? { partnerId } : {}),
        ...(body.date !== undefined ? { date: new Date(String(body.date)) } : {}),
        ...(body.lines !== undefined
          ? { lines: { deleteMany: {}, create: await buildLines(body.lines) } }
          : {}),
      },
      include: withRelations,
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "RequestForm", entityId: id });
    res.json(form);
  }),
);

// --- Delete ------------------------------------------------------------------
requestFormsRouter.delete(
  "/request-forms/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.requestForm.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "RequestForm", entityId: id });
    res.status(204).end();
  }),
);

// --- Generate a PRODUCTION form from a production order ----------------------
requestFormsRouter.post(
  "/production-orders/:id/request-form",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const orderId = parseId(req.params.id);
    if (!orderId) return res.status(400).json({ error: "invalid id" });
    const order = await prisma.productionOrder.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: "order_not_found" });
    const partnerId = parseId((req.body ?? {}).partnerId);
    if (!partnerId) return res.status(400).json({ error: "partnerId required" });

    const product = await prisma.product.findUnique({ where: { id: order.productId } });
    const form = await prisma.requestForm.create({
      data: {
        type: "PRODUCTION",
        partnerId,
        productionOrderId: orderId,
        notes: String((req.body ?? {}).notes ?? "").trim() || null,
        lines: {
          create: [
            {
              productId: order.productId,
              itemName: product?.name ?? `#${order.productId}`,
              quantity: order.quantity,
              unit: product?.unit ?? null,
              note: "Üretilecek mamul",
            },
          ],
        },
      },
      include: withRelations,
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "RequestForm", entityId: form.id });
    res.status(201).json(form);
  }),
);

// --- PDF ---------------------------------------------------------------------
requestFormsRouter.get(
  "/request-forms/:id/pdf",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const form = await prisma.requestForm.findUnique({ where: { id }, include: withRelations });
    if (!form) return res.status(404).json({ error: "not_found" });

    const pdf = await documentToPdf({
      title: TYPE_LABEL[form.type] ?? "Talep Formu",
      subtitle: `No: TF-${String(form.id).padStart(5, "0")}`,
      info: [
        ["Tarih", new Date(form.date).toLocaleDateString("tr-TR")],
        [form.type === "PRODUCTION" ? "Üretici" : "Tedarikçi", form.partner.name],
        ["Durum", STATUS_LABEL[form.status] ?? form.status],
        ...(form.notes ? ([["Not", form.notes]] as [string, string][]) : []),
      ],
      columns: ["Kalem", "Miktar", "Birim", "Not"],
      rows: form.lines.map((l) => [l.itemName, l.quantity, l.unit ?? "", l.note ?? ""]),
      footer: "Bu belge Kadim Naturel ERP tarafından oluşturulmuştur.",
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="talep-formu-${form.id}.pdf"`);
    res.send(pdf);
  }),
);
