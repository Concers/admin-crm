// =============================================================================
// List export endpoints — download core lists in multiple formats.
//   /export/:type?format=csv|xlsx|xml|doc   (type = sales | purchases | expenses)
// CSV is Excel-openable; XLSX is a real workbook; XML is a flat row dump;
// DOC is a Word-openable HTML table. The legacy /export/:type.csv routes are
// kept for backward compatibility (the frontend proxy now uses the generic one).
// =============================================================================

import { createRequire } from "node:module";
import { Router, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/http.js";
import { type AuthedRequest } from "../lib/auth.js";
import { rowsToPdf } from "../lib/pdf.js";
import type * as XLSXType from "xlsx";

// The xlsx ESM build omits some helpers; load the CommonJS build for the full
// utils/write API (same approach as the import scripts).
const require = createRequire(import.meta.url);
const XLSX = require("xlsx") as typeof XLSXType;

export const exportRouter = Router();

type Row = Record<string, unknown>;
export type ExportFormat = "csv" | "xlsx" | "xml" | "doc" | "pdf";

const cell = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** Serialise rows to a CSV string with a UTF-8 BOM (';' delimiter for Excel-TR). */
function toCsv(rows: Row[]): string {
  if (rows.length === 0) return "﻿";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = cell(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))];
  return "﻿" + lines.join("\n");
}

function toXlsxBuffer(rows: Row[], sheetName: string): Buffer {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

const xmlEscape = (v: unknown) =>
  cell(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function toXml(rows: Row[], rootTag: string): string {
  const body = rows
    .map((r) => {
      const fields = Object.entries(r)
        .map(([k, v]) => `    <${k}>${xmlEscape(v)}</${k}>`)
        .join("\n");
      return `  <kayit>\n${fields}\n  </kayit>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${body}\n</${rootTag}>\n`;
}

/** Word-openable HTML table (opened as .doc via the application/msword MIME). */
function toDoc(rows: Row[], title: string): string {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const thead = headers.map((h) => `<th>${xmlEscape(h)}</th>`).join("");
  const tbody = rows
    .map((r) => `<tr>${headers.map((h) => `<td>${xmlEscape(r[h])}</td>`).join("")}</tr>`)
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${xmlEscape(title)}</title></head>
<body><h2>${xmlEscape(title)}</h2>
<table border="1" cellspacing="0" cellpadding="4"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>
</body></html>`;
}

const FORMATS: Record<ExportFormat, { mime: string; ext: string }> = {
  csv: { mime: "text/csv; charset=utf-8", ext: "csv" },
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: "xlsx" },
  xml: { mime: "application/xml; charset=utf-8", ext: "xml" },
  doc: { mime: "application/msword; charset=utf-8", ext: "doc" },
  pdf: { mime: "application/pdf", ext: "pdf" },
};

function parseFormat(v: unknown): ExportFormat {
  const f = String(v ?? "csv").toLowerCase();
  return (["csv", "xlsx", "xml", "doc", "pdf"] as const).includes(f as ExportFormat)
    ? (f as ExportFormat)
    : "csv";
}

/** Serialise `rows` in `format` and stream as a download named `<base>.<ext>`. */
async function sendExport(res: Response, base: string, title: string, rows: Row[], format: ExportFormat) {
  const { mime, ext } = FORMATS[format];
  res.setHeader("Content-Type", mime);
  res.setHeader("Content-Disposition", `attachment; filename="${base}.${ext}"`);
  if (format === "xlsx") return res.send(toXlsxBuffer(rows, title));
  if (format === "xml") return res.send(toXml(rows, base));
  if (format === "doc") return res.send(toDoc(rows, title));
  if (format === "pdf") return res.send(await rowsToPdf(rows, title));
  return res.send(toCsv(rows));
}

// --- Row builders (one per list) --------------------------------------------
async function salesRows(req: AuthedRequest): Promise<Row[]> {
  const sales = await prisma.sale.findMany({
    orderBy: { date: "desc" },
    include: { product: true, customer: true },
  });
  const isSalesRep = req.auth?.role === "SALES_REP";
  return sales.map((s) => ({
    tarih: new Date(s.date).toISOString().slice(0, 10),
    urun: s.product.name,
    musteri: s.customer.name,
    adet: s.quantity,
    birimFiyat: s.unitPrice,
    toplam: s.totalAmount,
    kdvDahil: s.vatIncludedAmount,
    ...(isSalesRep ? {} : { birimMaliyet: s.totalUnitCost ?? "", karYuzdesi: s.profitMargin ?? "" }),
  }));
}

async function purchasesRows(): Promise<Row[]> {
  const purchases = await prisma.purchase.findMany({
    orderBy: { date: "desc" },
    include: { product: true, supplier: true },
  });
  return purchases.map((p) => ({
    tarih: new Date(p.date).toISOString().slice(0, 10),
    urun: p.product.name,
    tedarikci: p.supplier.name,
    adet: p.quantity,
    birimFiyat: p.unitPrice,
    toplam: p.totalAmount,
    kdvDahil: p.vatIncludedAmount,
    odenen: p.paidAmount,
  }));
}

async function expensesRows(): Promise<Row[]> {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    include: { product: true, partner: true },
  });
  return expenses.map((e) => ({
    tarih: new Date(e.date).toISOString().slice(0, 10),
    kapsam: e.scope,
    kategori: e.category,
    urun: e.product?.name ?? "",
    cari: e.partner?.name ?? "",
    toplam: e.totalAmount,
    odenen: e.paidAmount,
    aylikPay: e.monthlyShare ?? "",
  }));
}

const LISTS: Record<
  string,
  { base: string; title: string; adminOnly: boolean; build: (req: AuthedRequest) => Promise<Row[]> }
> = {
  sales: { base: "satislar", title: "Satışlar", adminOnly: false, build: salesRows },
  purchases: { base: "alimlar", title: "Alımlar", adminOnly: false, build: purchasesRows },
  expenses: { base: "giderler", title: "Giderler", adminOnly: true, build: expensesRows },
};

// --- Generic multi-format endpoint ------------------------------------------
exportRouter.get(
  "/export/:type",
  asyncHandler(async (req: AuthedRequest, res) => {
    // Tolerate a legacy ".csv" suffix in the type (older links / bookmarks).
    const typeParam = String(req.params.type ?? "");
    const rawType = typeParam.replace(/\.(csv|xlsx|xml|doc)$/i, "");
    const def = LISTS[rawType];
    if (!def) return res.status(404).json({ error: "unknown_export" });
    if (def.adminOnly && req.auth?.role !== "ADMIN")
      return res.status(403).json({ error: "forbidden" });
    // Format from ?format=, or inferred from a legacy extension suffix.
    const suffix = typeParam.match(/\.(csv|xlsx|xml|doc)$/i)?.[1];
    const format = parseFormat(req.query.format ?? suffix);
    const rows = await def.build(req);
    return sendExport(res, def.base, def.title, rows, format);
  }),
);
