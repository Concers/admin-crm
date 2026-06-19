// =============================================================================
// Inventory & finance master routes: warehouses, cash/bank accounts, stock
// movements (manual adjustments/waste/transfer), and partner contacts.
// =============================================================================

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, parseId } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";
import { validateBody } from "../lib/validate.js";
import { parseDate, toNumber } from "../lib/calculations.js";

export const inventoryRouter = Router();

const warehouseSchema = z.object({ name: z.string().min(1), location: z.string().optional() });
const shelfSchema = z.object({
  code: z.string().min(1),
  location: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});
const accountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["CASH", "BANK"]),
  currency: z.string().default("TRY"),
  openingBalance: z.number().default(0),
});
const contactSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

// --- Warehouses (admin) ------------------------------------------------------
inventoryRouter.get(
  "/warehouses",
  asyncHandler(async (_req, res) => res.json(await prisma.warehouse.findMany({ orderBy: { name: "asc" } }))),
);

inventoryRouter.post(
  "/warehouses",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(warehouseSchema, req.body, res);
    if (!data) return;
    const wh = await prisma.warehouse.create({ data });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Warehouse", entityId: wh.id });
    res.status(201).json(wh);
  }),
);

inventoryRouter.put(
  "/warehouses/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!(await prisma.warehouse.findUnique({ where: { id } }))) return res.status(404).json({ error: "not_found" });
    const data = validateBody(warehouseSchema, req.body, res);
    if (!data) return;
    const wh = await prisma.warehouse.update({ where: { id }, data: { name: data.name, location: data.location ?? null } });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Warehouse", entityId: wh.id });
    res.json(wh);
  }),
);

inventoryRouter.delete(
  "/warehouses/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.warehouse.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Warehouse", entityId: id });
    res.status(204).end();
  }),
);

// --- Shelves (physical rack locations) ---------------------------------------
inventoryRouter.get(
  "/shelves",
  asyncHandler(async (_req, res) => res.json(await prisma.shelf.findMany({ orderBy: { code: "asc" } }))),
);

inventoryRouter.post(
  "/shelves",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(shelfSchema, req.body, res);
    if (!data) return;
    const shelf = await prisma.shelf.create({
      data: {
        code: data.code.trim(),
        location: data.location?.trim() || null,
        notes: data.notes?.trim() || null,
        isActive: data.isActive ?? true,
      },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Shelf", entityId: shelf.id });
    res.status(201).json(shelf);
  }),
);

inventoryRouter.put(
  "/shelves/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!(await prisma.shelf.findUnique({ where: { id } }))) return res.status(404).json({ error: "not_found" });
    const data = validateBody(shelfSchema, req.body, res);
    if (!data) return;
    const shelf = await prisma.shelf.update({
      where: { id },
      data: {
        code: data.code.trim(),
        location: data.location?.trim() || null,
        notes: data.notes?.trim() || null,
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Shelf", entityId: shelf.id });
    res.json(shelf);
  }),
);

inventoryRouter.delete(
  "/shelves/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.shelf.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Shelf", entityId: id });
    res.status(204).end();
  }),
);

// --- Cash/Bank accounts (admin) ----------------------------------------------
inventoryRouter.get(
  "/accounts",
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => res.json(await prisma.account.findMany({ orderBy: { name: "asc" } }))),
);

inventoryRouter.post(
  "/accounts",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(accountSchema, req.body, res);
    if (!data) return;
    const account = await prisma.account.create({ data });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Account", entityId: account.id });
    res.status(201).json(account);
  }),
);

inventoryRouter.put(
  "/accounts/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!(await prisma.account.findUnique({ where: { id } }))) return res.status(404).json({ error: "not_found" });
    const data = validateBody(accountSchema, req.body, res);
    if (!data) return;
    const account = await prisma.account.update({ where: { id }, data });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Account", entityId: account.id });
    res.json(account);
  }),
);

inventoryRouter.delete(
  "/accounts/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.account.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Account", entityId: id });
    res.status(204).end();
  }),
);

/** Account balances = opening balance + collections − payments through it. */
inventoryRouter.get(
  "/accounts/balances",
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const [accounts, flows] = await Promise.all([
      prisma.account.findMany(),
      prisma.cashFlow.findMany({ where: { accountId: { not: null } }, select: { accountId: true, type: true, amount: true } }),
    ]);
    res.json(
      accounts.map((a) => {
        const delta = flows
          .filter((f) => f.accountId === a.id)
          .reduce((sum, f) => sum + (f.type === "COLLECTION" ? f.amount : -f.amount), 0);
        return { id: a.id, name: a.name, type: a.type, balance: a.openingBalance + delta };
      }),
    );
  }),
);

// --- Stock movements (admin + warehouse) -------------------------------------
inventoryRouter.get(
  "/stock-movements",
  requireRole("ADMIN", "WAREHOUSE_MANAGER"),
  asyncHandler(async (req, res) => {
    const productId = req.query.productId ? Number(req.query.productId) : undefined;
    res.json(
      await prisma.stockMovement.findMany({
        where: productId ? { productId } : undefined,
        orderBy: { date: "desc" },
        include: { product: true, warehouse: true },
      }),
    );
  }),
);

inventoryRouter.post(
  "/stock-movements",
  requireRole("ADMIN", "WAREHOUSE_MANAGER"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = req.body ?? {};
    const data = validateBody(
      z.object({
        productName: z.string().min(1),
        type: z.enum(["IN", "OUT", "ADJUSTMENT", "TRANSFER", "WASTE"]),
        quantity: z.number(),
        warehouseId: z.number().int().positive().optional(),
        reason: z.string().optional(),
        notes: z.string().optional(),
        date: z.string().optional(),
      }),
      body,
      res,
    );
    if (!data) return;

    const product = await prisma.product.findFirst({ where: { name: data.productName.trim() } });
    if (!product) return res.status(400).json({ error: "product_not_found" });

    const movement = await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: data.type,
        quantity: toNumber(data.quantity),
        warehouseId: data.warehouseId ?? null,
        reason: data.reason ?? null,
        notes: data.notes ?? null,
        date: parseDate(data.date) ?? new Date(),
      },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "StockMovement", entityId: movement.id });
    res.status(201).json(movement);
  }),
);

// --- Partner contacts (admin) ------------------------------------------------
inventoryRouter.get(
  "/partners/:id/contacts",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    res.json(await prisma.contact.findMany({ where: { partnerId: id }, orderBy: { name: "asc" } }));
  }),
);

inventoryRouter.post(
  "/partners/:id/contacts",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const data = validateBody(contactSchema, req.body, res);
    if (!data) return;
    const contact = await prisma.contact.create({ data: { ...data, partnerId: id } });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Contact", entityId: contact.id });
    res.status(201).json(contact);
  }),
);

inventoryRouter.put(
  "/contacts/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!(await prisma.contact.findUnique({ where: { id } }))) return res.status(404).json({ error: "not_found" });
    const data = validateBody(contactSchema, req.body, res);
    if (!data) return;
    const contact = await prisma.contact.update({
      where: { id },
      data: { name: data.name, title: data.title ?? null, phone: data.phone ?? null, email: data.email ?? null },
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Contact", entityId: contact.id });
    res.json(contact);
  }),
);

inventoryRouter.delete(
  "/contacts/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.contact.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Contact", entityId: id });
    res.status(204).end();
  }),
);

// --- TCMB exchange rates (dövizli işlem otomasyonu) --------------------------
/** Pull a tag's text out of a TCMB <Currency> XML block. */
function xmlTag(block: string, tag: string): number | null {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  const v = m ? parseFloat(m[1]) : NaN;
  return Number.isFinite(v) ? v : null;
}

/**
 * Today's TCMB (Turkish Central Bank) FX rates so dövizli sales/purchases can
 * auto-fill the TRY exchange rate. `?currency=USD` returns one; otherwise all.
 * Proxied server-side (the bank's XML has no CORS headers for the browser).
 */
inventoryRouter.get(
  "/exchange-rates/tcmb",
  asyncHandler(async (req, res) => {
    const wanted = typeof req.query.currency === "string" ? req.query.currency.toUpperCase() : null;
    let xml: string;
    try {
      const r = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", { signal: AbortSignal.timeout(8000) });
      if (!r.ok) return res.status(502).json({ error: "tcmb_unavailable", status: r.status });
      xml = await r.text();
    } catch {
      return res.status(502).json({ error: "tcmb_fetch_failed", message: "TCMB kurları alınamadı." });
    }

    const date = xml.match(/Tarih="([^"]+)"/)?.[1] ?? null;
    const rates = [...xml.matchAll(/<Currency[^>]*Kod="([A-Z]+)"[\s\S]*?<\/Currency>/g)].map((m) => {
      const code = m[1];
      const block = m[0];
      const unit = xmlTag(block, "Unit") ?? 1;
      return {
        code,
        unit,
        forexBuying: xmlTag(block, "ForexBuying"),
        forexSelling: xmlTag(block, "ForexSelling"),
        banknoteBuying: xmlTag(block, "BanknoteBuying"),
        banknoteSelling: xmlTag(block, "BanknoteSelling"),
      };
    });

    if (wanted) {
      const one = rates.find((x) => x.code === wanted);
      if (!one) return res.status(404).json({ error: "currency_not_found", currency: wanted });
      return res.json({ date, ...one });
    }
    res.json({ date, rates });
  }),
);
