// =============================================================================
// CSV export endpoints — download core lists as Excel-openable CSV.
// =============================================================================

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";

export const exportRouter = Router();

/** Serialise rows (array of flat objects) to a CSV string with a UTF-8 BOM. */
function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "﻿";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))];
  return "﻿" + lines.join("\n");
}

function sendCsv(res: import("express").Response, filename: string, rows: Record<string, unknown>[]) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(toCsv(rows));
}

exportRouter.get(
  "/export/sales.csv",
  asyncHandler(async (req: AuthedRequest, res) => {
    const sales = await prisma.sale.findMany({ orderBy: { date: "desc" }, include: { product: true, customer: true } });
    const isSalesRep = req.auth?.role === "SALES_REP";
    sendCsv(
      res,
      "satislar.csv",
      sales.map((s) => ({
        tarih: new Date(s.date).toISOString().slice(0, 10),
        urun: s.product.name,
        musteri: s.customer.name,
        adet: s.quantity,
        birimFiyat: s.unitPrice,
        toplam: s.totalAmount,
        kdvDahil: s.vatIncludedAmount,
        ...(isSalesRep ? {} : { birimMaliyet: s.totalUnitCost ?? "", karYuzdesi: s.profitMargin ?? "" }),
      })),
    );
  }),
);

exportRouter.get(
  "/export/purchases.csv",
  asyncHandler(async (_req, res) => {
    const purchases = await prisma.purchase.findMany({ orderBy: { date: "desc" }, include: { product: true, supplier: true } });
    sendCsv(
      res,
      "alimlar.csv",
      purchases.map((p) => ({
        tarih: new Date(p.date).toISOString().slice(0, 10),
        urun: p.product.name,
        tedarikci: p.supplier.name,
        adet: p.quantity,
        birimFiyat: p.unitPrice,
        toplam: p.totalAmount,
        kdvDahil: p.vatIncludedAmount,
        odenen: p.paidAmount,
      })),
    );
  }),
);

exportRouter.get(
  "/export/expenses.csv",
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const expenses = await prisma.expense.findMany({ orderBy: { date: "desc" }, include: { product: true, partner: true } });
    sendCsv(
      res,
      "giderler.csv",
      expenses.map((e) => ({
        tarih: new Date(e.date).toISOString().slice(0, 10),
        kapsam: e.scope,
        kategori: e.category,
        urun: e.product?.name ?? "",
        cari: e.partner?.name ?? "",
        toplam: e.totalAmount,
        odenen: e.paidAmount,
        aylikPay: e.monthlyShare ?? "",
      })),
    );
  }),
);
