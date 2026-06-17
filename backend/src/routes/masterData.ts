// =============================================================================
// Master-data routes: partners, products, expense categories (TANIMLAMA).
// =============================================================================

import { Router } from "express";
import type { PartnerType, ExpenseScope } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, parseId } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";

export const masterDataRouter = Router();

// Reads are open to any authenticated user (forms need dropdown data); any
// mutation of master data (TANIMLAMA) is admin-only and audited.
masterDataRouter.use((req: AuthedRequest, res, next) => {
  if (req.method === "GET") return next();
  return requireRole("ADMIN")(req, res, () => {
    // Audit the mutation after it completes (best-effort, fire-and-forget).
    res.on("finish", () => {
      if (res.statusCode < 400) {
        const action = req.method === "POST" ? "CREATE" : req.method === "DELETE" ? "DELETE" : "UPDATE";
        const entityName = req.path.split("/")[1] ?? "MasterData";
        void recordAudit({ userId: req.auth?.userId, action, entityName, details: req.path });
      }
    });
    next();
  });
});

// --- Partners ----------------------------------------------------------------
masterDataRouter.get(
  "/partners",
  asyncHandler(async (req, res) => {
    const type = typeof req.query.type === "string" ? (req.query.type as PartnerType) : undefined;
    const partners = await prisma.partner.findMany({
      where: type ? { type } : undefined,
      orderBy: { name: "asc" },
    });
    res.json(partners);
  }),
);

masterDataRouter.post(
  "/partners",
  asyncHandler(async (req, res) => {
    const { name, type, contactInfo, phone, email, address } = req.body ?? {};
    if (!name || !type) return res.status(400).json({ error: "name and type are required" });
    // Upsert by unique name so re-adding an existing partner just updates it.
    const partner = await prisma.partner.upsert({
      where: { name: String(name).trim() },
      update: { type, contactInfo, phone, email, address },
      create: { name: String(name).trim(), type, contactInfo, phone, email, address },
    });
    res.status(201).json(partner);
  }),
);

masterDataRouter.put(
  "/partners/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const { name, type, contactInfo, phone, email, address } = req.body ?? {};
    const partner = await prisma.partner.update({
      where: { id },
      data: { name: name?.trim(), type, contactInfo, phone, email, address },
    });
    res.json(partner);
  }),
);

masterDataRouter.delete(
  "/partners/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.partner.delete({ where: { id } });
    res.status(204).end();
  }),
);

// --- Products ----------------------------------------------------------------
masterDataRouter.get(
  "/products",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.product.findMany({ orderBy: { name: "asc" } }));
  }),
);

masterDataRouter.post(
  "/products",
  asyncHandler(async (req, res) => {
    const { name, category, shelfLocation } = req.body ?? {};
    if (!name) return res.status(400).json({ error: "name is required" });
    const product = await prisma.product.upsert({
      where: { name: String(name).trim() },
      update: { category, shelfLocation },
      create: { name: String(name).trim(), category, shelfLocation },
    });
    res.status(201).json(product);
  }),
);

masterDataRouter.put(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const { name, category, shelfLocation } = req.body ?? {};
    const product = await prisma.product.update({
      where: { id },
      data: { name: name?.trim(), category, shelfLocation },
    });
    res.json(product);
  }),
);

masterDataRouter.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
  }),
);

// --- Expense categories ------------------------------------------------------
masterDataRouter.get(
  "/expense-categories",
  asyncHandler(async (req, res) => {
    const scope = typeof req.query.scope === "string" ? (req.query.scope as ExpenseScope) : undefined;
    res.json(
      await prisma.expenseCategory.findMany({
        where: scope ? { scope } : undefined,
        orderBy: { name: "asc" },
      }),
    );
  }),
);

masterDataRouter.post(
  "/expense-categories",
  asyncHandler(async (req, res) => {
    const { name, scope } = req.body ?? {};
    if (!name || !scope) return res.status(400).json({ error: "name and scope are required" });
    const category = await prisma.expenseCategory.upsert({
      where: { name_scope: { name: String(name).trim(), scope } },
      update: {},
      create: { name: String(name).trim(), scope },
    });
    res.status(201).json(category);
  }),
);

masterDataRouter.put(
  "/expense-categories/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const { name } = req.body ?? {};
    const category = await prisma.expenseCategory.update({ where: { id }, data: { name: name?.trim() } });
    res.json(category);
  }),
);

masterDataRouter.delete(
  "/expense-categories/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.expenseCategory.delete({ where: { id } });
    res.status(204).end();
  }),
);

// --- Product developments (Yeni Ürün Takip) ----------------------------------
masterDataRouter.get(
  "/product-developments",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.productDevelopment.findMany({ orderBy: { productName: "asc" } }));
  }),
);
