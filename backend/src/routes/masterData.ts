// =============================================================================
// Master-data routes: partners, products, expense categories (TANIMLAMA).
// =============================================================================

import { Router } from "express";
import type { PartnerType, ExpenseScope } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, parseId } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";
import { normalizePartnerType } from "../lib/partnerTypes.js";

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
    const { name, type, contactInfo, phone, email, address, priceTier } = req.body ?? {};
    if (!name || !type) return res.status(400).json({ error: "name and type are required" });
    const partnerType = normalizePartnerType(type);
    // Upsert by unique name so re-adding an existing partner just updates it.
    const partner = await prisma.partner.upsert({
      where: { name: String(name).trim() },
      update: { type: partnerType, contactInfo, phone, email, address, priceTier },
      create: { name: String(name).trim(), type: partnerType, contactInfo, phone, email, address, priceTier },
    });
    res.status(201).json(partner);
  }),
);

masterDataRouter.put(
  "/partners/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const { name, type, contactInfo, phone, email, address, priceTier } = req.body ?? {};
    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name: name?.trim(),
        type: type != null ? normalizePartnerType(type) : undefined,
        contactInfo,
        phone,
        email,
        address,
        priceTier,
      },
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

/** Optional string → trimmed value or null (undefined = leave unchanged). */
function optStr(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/** Coerce a request body into Product "Ürün Detay" column values. */
function productDetailData(body: Record<string, unknown>) {
  return {
    category: optStr(body.category),
    shelfLocation: optStr(body.shelfLocation),
    barcode: optStr(body.barcode),
    unit: body.unit !== undefined ? String(body.unit ?? "adet").trim() || "adet" : undefined,
    minStock:
      body.minStock === undefined
        ? undefined
        : body.minStock === null || body.minStock === ""
          ? null
          : Number(body.minStock),
    isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
    isBfm: body.isBfm === undefined ? undefined : Boolean(body.isBfm),
    productCode: optStr(body.productCode),
    sectors: optStr(body.sectors),
    gtipCode: optStr(body.gtipCode),
    hsCode: optStr(body.hsCode),
    unCode: optStr(body.unCode),
    botanicalName: optStr(body.botanicalName),
    englishName: optStr(body.englishName),
    casNo: optStr(body.casNo),
    inciNo: optStr(body.inciNo),
    origin: optStr(body.origin),
    chemotype: optStr(body.chemotype),
    genotype: optStr(body.genotype),
    variety: optStr(body.variety),
    geoPopulation: optStr(body.geoPopulation),
    plantPart: optStr(body.plantPart),
    productionMethod: optStr(body.productionMethod),
    der: optStr(body.der),
    history: optStr(body.history),
    usageAreas: optStr(body.usageAreas),
    description: optStr(body.description),
  };
}

masterDataRouter.get(
  "/products",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.product.findMany({ orderBy: { name: "asc" } }));
  }),
);

/** Full "Ürün Detay" kartı: ürün + içerik linkleri + bağlı cariler. */
masterDataRouter.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        links: { orderBy: { createdAt: "desc" } },
        partnerLinks: { include: { partner: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!product) return res.status(404).json({ error: "not_found" });
    res.json(product);
  }),
);

masterDataRouter.post(
  "/products",
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const name = optStr(body.name);
    if (!name) return res.status(400).json({ error: "name is required" });
    const data = productDetailData(body);
    const product = await prisma.product.upsert({
      where: { name },
      update: data,
      create: { name, ...data },
    });
    res.status(201).json(product);
  }),
);

masterDataRouter.put(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const body = req.body ?? {};
    const name = optStr(body.name);
    const product = await prisma.product.update({
      where: { id },
      data: { ...(name ? { name } : {}), ...productDetailData(body) },
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

// --- Ürün içerik linkleri (makale / blog / instagram) ------------------------
const LINK_KINDS = new Set(["ARTICLE", "BLOG", "INSTAGRAM"]);

masterDataRouter.post(
  "/product-links",
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const productId = parseId(body.productId);
    const kind = String(body.kind ?? "").toUpperCase();
    const title = optStr(body.title);
    if (!productId || !LINK_KINDS.has(kind) || !title)
      return res.status(400).json({ error: "productId, kind, title required" });
    const link = await prisma.productLink.create({
      data: {
        productId,
        kind: kind as "ARTICLE" | "BLOG" | "INSTAGRAM",
        title,
        url: optStr(body.url) ?? null,
        note: optStr(body.note) ?? null,
      },
    });
    res.status(201).json(link);
  }),
);

masterDataRouter.put(
  "/product-links/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const body = req.body ?? {};
    const kind = body.kind !== undefined ? String(body.kind).toUpperCase() : undefined;
    if (kind !== undefined && !LINK_KINDS.has(kind))
      return res.status(400).json({ error: "invalid kind" });
    const link = await prisma.productLink.update({
      where: { id },
      data: {
        ...(kind ? { kind: kind as "ARTICLE" | "BLOG" | "INSTAGRAM" } : {}),
        ...(body.title !== undefined ? { title: optStr(body.title) ?? "" } : {}),
        ...(body.url !== undefined ? { url: optStr(body.url) } : {}),
        ...(body.note !== undefined ? { note: optStr(body.note) } : {}),
      },
    });
    res.json(link);
  }),
);

masterDataRouter.delete(
  "/product-links/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.productLink.delete({ where: { id } });
    res.status(204).end();
  }),
);

// --- Ürün ↔ cari bağları (tedarikçi / potansiyel tedarikçi / müşteri) --------
const PARTNER_ROLES = new Set(["SUPPLIER", "POTENTIAL_SUPPLIER", "CUSTOMER"]);

masterDataRouter.post(
  "/product-partner-links",
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const productId = parseId(body.productId);
    const partnerId = parseId(body.partnerId);
    const role = String(body.role ?? "").toUpperCase();
    if (!productId || !partnerId || !PARTNER_ROLES.has(role))
      return res.status(400).json({ error: "productId, partnerId, role required" });
    try {
      const link = await prisma.productPartnerLink.create({
        data: {
          productId,
          partnerId,
          role: role as "SUPPLIER" | "POTENTIAL_SUPPLIER" | "CUSTOMER",
          note: optStr(body.note) ?? null,
        },
        include: { partner: true },
      });
      res.status(201).json(link);
    } catch {
      return res.status(409).json({ error: "already_linked" });
    }
  }),
);

masterDataRouter.delete(
  "/product-partner-links/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.productPartnerLink.delete({ where: { id } });
    res.status(204).end();
  }),
);

// --- Materyal Detay (ambalaj / etiket / sticker / diğer) ---------------------
const MATERIAL_CATEGORIES = new Set(["AMBALAJ", "ETIKET", "STICKER", "DIGER"]);
const MATERIAL_SCOPES = new Set(["OWN", "B2B", "BOTH"]);
const MATERIAL_ROLES = new Set(["SUPPLIER", "CUSTOMER"]);

/** Coerce a request body into Material column values. */
function materialData(body: Record<string, unknown>) {
  return {
    subType: optStr(body.subType),
    scope:
      body.scope !== undefined && MATERIAL_SCOPES.has(String(body.scope))
        ? String(body.scope)
        : undefined,
    model: optStr(body.model),
    color: optStr(body.color),
    size: optStr(body.size),
    material: optStr(body.material),
    unitPrice:
      body.unitPrice === undefined
        ? undefined
        : body.unitPrice === null || body.unitPrice === ""
          ? null
          : Number(body.unitPrice),
    currency: body.currency !== undefined ? String(body.currency ?? "TRY").trim() || "TRY" : undefined,
    usageAreas: optStr(body.usageAreas),
    notes: optStr(body.notes),
    isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
  };
}

masterDataRouter.get(
  "/materials",
  asyncHandler(async (req, res) => {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const subType = typeof req.query.subType === "string" ? req.query.subType : undefined;
    res.json(
      await prisma.material.findMany({
        where: {
          ...(category ? { category } : {}),
          ...(subType ? { subType } : {}),
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
    );
  }),
);

masterDataRouter.get(
  "/materials/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        partnerLinks: { include: { partner: true }, orderBy: { createdAt: "desc" } },
        priceBreaks: { orderBy: { minQty: "asc" } },
      },
    });
    if (!material) return res.status(404).json({ error: "not_found" });
    res.json(material);
  }),
);

masterDataRouter.post(
  "/materials",
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const name = optStr(body.name);
    const category = String(body.category ?? "").toUpperCase();
    if (!name) return res.status(400).json({ error: "name is required" });
    if (!MATERIAL_CATEGORIES.has(category))
      return res.status(400).json({ error: "invalid category" });
    const material = await prisma.material.create({
      data: {
        name,
        category,
        ...materialData(body),
      },
    });
    res.status(201).json(material);
  }),
);

masterDataRouter.put(
  "/materials/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const body = req.body ?? {};
    const name = optStr(body.name);
    const category = body.category !== undefined ? String(body.category).toUpperCase() : undefined;
    if (category !== undefined && !MATERIAL_CATEGORIES.has(category))
      return res.status(400).json({ error: "invalid category" });
    const material = await prisma.material.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(category ? { category } : {}),
        ...materialData(body),
      },
    });
    res.json(material);
  }),
);

masterDataRouter.delete(
  "/materials/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.material.delete({ where: { id } });
    res.status(204).end();
  }),
);

// Materyal ↔ cari bağları (tedarikçi / müşteri)
masterDataRouter.post(
  "/material-partner-links",
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const materialId = parseId(body.materialId);
    const partnerId = parseId(body.partnerId);
    const role = String(body.role ?? "").toUpperCase();
    if (!materialId || !partnerId || !MATERIAL_ROLES.has(role))
      return res.status(400).json({ error: "materialId, partnerId, role required" });
    try {
      const link = await prisma.materialPartnerLink.create({
        data: {
          materialId,
          partnerId,
          role: role as "SUPPLIER" | "CUSTOMER",
          note: optStr(body.note) ?? null,
        },
        include: { partner: true },
      });
      res.status(201).json(link);
    } catch {
      return res.status(409).json({ error: "already_linked" });
    }
  }),
);

masterDataRouter.delete(
  "/material-partner-links/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.materialPartnerLink.delete({ where: { id } });
    res.status(204).end();
  }),
);

// Kademeli fiyat (X adet fiyatı)
masterDataRouter.post(
  "/material-price-breaks",
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const materialId = parseId(body.materialId);
    const minQty = Number(body.minQty);
    const price = Number(body.price);
    if (!materialId || !Number.isFinite(minQty) || !Number.isFinite(price))
      return res.status(400).json({ error: "materialId, minQty, price required" });
    const brk = await prisma.materialPriceBreak.create({ data: { materialId, minQty, price } });
    res.status(201).json(brk);
  }),
);

masterDataRouter.delete(
  "/material-price-breaks/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.materialPriceBreak.delete({ where: { id } });
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
/** Coerce a request body into ProductDevelopment column values. */
function buildDevData(body: Record<string, unknown>) {
  const num = (v: unknown) => (v === undefined || v === null || v === "" ? null : Number(v));
  const bool = (v: unknown) => (v === undefined || v === null ? null : Boolean(v));
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  return {
    productName: String(body.productName ?? "").trim(),
    productId: body.productId != null && body.productId !== "" ? Number(body.productId) : null,
    startDate: body.startDate ? new Date(String(body.startDate)) : null,
    supplierName: str(body.supplierName),
    orderQuantity: num(body.orderQuantity),
    productClass: str(body.productClass),
    isRawMaterial: bool(body.isRawMaterial),
    orderPlaced: bool(body.orderPlaced),
    priceReceived: bool(body.priceReceived),
    sampleReceived: bool(body.sampleReceived),
    sampleApproved: bool(body.sampleApproved),
    productionBegun: bool(body.productionBegun),
    productionDone: bool(body.productionDone),
    notes: str(body.notes),
    attributes: body.attributes ?? undefined,
  };
}

masterDataRouter.get(
  "/product-developments",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.productDevelopment.findMany({ orderBy: { productName: "asc" } }));
  }),
);

masterDataRouter.post(
  "/product-developments",
  asyncHandler(async (req, res) => {
    const data = buildDevData(req.body ?? {});
    if (!data.productName) return res.status(400).json({ error: "productName is required" });
    const dev = await prisma.productDevelopment.create({ data });
    res.status(201).json(dev);
  }),
);

masterDataRouter.put(
  "/product-developments/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!(await prisma.productDevelopment.findUnique({ where: { id } }))) return res.status(404).json({ error: "not_found" });
    const data = buildDevData(req.body ?? {});
    if (!data.productName) return res.status(400).json({ error: "productName is required" });
    const dev = await prisma.productDevelopment.update({ where: { id }, data });
    res.json(dev);
  }),
);

masterDataRouter.delete(
  "/product-developments/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.productDevelopment.delete({ where: { id } });
    res.status(204).end();
  }),
);
