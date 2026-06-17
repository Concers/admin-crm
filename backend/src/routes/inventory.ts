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

// --- Warehouses (admin) ------------------------------------------------------
inventoryRouter.get(
  "/warehouses",
  asyncHandler(async (_req, res) => res.json(await prisma.warehouse.findMany({ orderBy: { name: "asc" } }))),
);

inventoryRouter.post(
  "/warehouses",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(z.object({ name: z.string().min(1), location: z.string().optional() }), req.body, res);
    if (!data) return;
    const wh = await prisma.warehouse.create({ data });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Warehouse", entityId: wh.id });
    res.status(201).json(wh);
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
    const data = validateBody(
      z.object({
        name: z.string().min(1),
        type: z.enum(["CASH", "BANK"]),
        currency: z.string().default("TRY"),
        openingBalance: z.number().default(0),
      }),
      req.body,
      res,
    );
    if (!data) return;
    const account = await prisma.account.create({ data });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Account", entityId: account.id });
    res.status(201).json(account);
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
    const data = validateBody(
      z.object({
        name: z.string().min(1),
        title: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
      }),
      req.body,
      res,
    );
    if (!data) return;
    const contact = await prisma.contact.create({ data: { ...data, partnerId: id } });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Contact", entityId: contact.id });
    res.status(201).json(contact);
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
