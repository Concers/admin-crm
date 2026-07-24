// =============================================================================
// Bulk import — upload XLSX / CSV / XML to create purchases, sales or expenses.
//   POST /import/:type            → dry-run preview (no writes, no master-data side effects)
//   POST /import/:type?commit=true → create the valid rows
// Accepts either the Turkish export headers (tarih, urun, tedarikci…) or the
// English field names (date, productName…). ADMIN only (bulk write).
// PDF/WORD are intentionally unsupported: reliable table extraction from free-
// form documents needs OCR/heuristics — use the XLSX template instead.
// =============================================================================

import { createRequire } from "node:module";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";
import { parseDate, toNumber } from "../lib/calculations.js";
import { buildExpenseData, buildPurchaseData, buildSaleData } from "./transactions.js";
import type * as XLSXType from "xlsx";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx") as typeof XLSXType;

export const importRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

type Row = Record<string, string>;

// --- File parsers ------------------------------------------------------------
function parseCsv(text: string): Row[] {
  const clean = text.replace(/^﻿/, "").trim();
  if (!clean) return [];
  const lines = clean.split(/\r?\n/);
  const delim = lines[0].includes(";") ? ";" : ",";
  const split = (line: string) => {
    // Minimal CSV split honouring double-quoted fields.
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') inQ = false;
        else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === delim) {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const headers = split(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = split(line);
    const row: Row = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

function parseXlsx(buffer: Buffer): Row[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: false });
  return json.map((r) => {
    const row: Row = {};
    for (const [k, v] of Object.entries(r)) row[k.trim()] = String(v ?? "").trim();
    return row;
  });
}

function parseXml(text: string): Row[] {
  const rows: Row[] = [];
  const records = text.match(/<kayit>[\s\S]*?<\/kayit>/g) ?? [];
  const unescape = (s: string) =>
    s
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&");
  for (const rec of records) {
    const row: Row = {};
    const fields = rec.match(/<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/g) ?? [];
    for (const f of fields) {
      const m = f.match(/<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/);
      if (m) row[m[1]] = unescape(m[2]).trim();
    }
    rows.push(row);
  }
  return rows;
}

function parseFile(buffer: Buffer, filename: string): Row[] {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (ext === "xlsx" || ext === "xls") return parseXlsx(buffer);
  if (ext === "xml") return parseXml(buffer.toString("utf8"));
  if (ext === "csv") return parseCsv(buffer.toString("utf8"));
  // Fallback: sniff content.
  const head = buffer.subarray(0, 4).toString("utf8");
  if (head.startsWith("PK")) return parseXlsx(buffer);
  const text = buffer.toString("utf8");
  return text.trimStart().startsWith("<") ? parseXml(text) : parseCsv(text);
}

// --- Row → builder body mapping ---------------------------------------------
/** Lowercased-key lookup with Turkish/English aliases. */
function pick(row: Row, ...keys: string[]): string {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) lower[k.toLowerCase()] = v;
  for (const k of keys) {
    const v = lower[k.toLowerCase()];
    if (v !== undefined && v !== "") return v;
  }
  return "";
}

function rowToBody(type: string, row: Row): Record<string, unknown> {
  if (type === "purchases") {
    return {
      date: pick(row, "tarih", "date"),
      productName: pick(row, "urun", "ürün", "productName"),
      supplierName: pick(row, "tedarikci", "tedarikçi", "supplierName"),
      quantity: pick(row, "adet", "quantity"),
      unitPrice: pick(row, "birimFiyat", "birim fiyat", "unitPrice"),
      vatRate: pick(row, "kdv", "vatRate"),
      paidAmount: pick(row, "odenen", "ödenen", "paidAmount"),
    };
  }
  if (type === "sales") {
    return {
      date: pick(row, "tarih", "date"),
      productName: pick(row, "urun", "ürün", "productName"),
      customerName: pick(row, "musteri", "müşteri", "customerName"),
      quantity: pick(row, "adet", "quantity"),
      unitPrice: pick(row, "birimFiyat", "birim fiyat", "unitPrice"),
      vatRate: pick(row, "kdv", "vatRate"),
      paidAmount: pick(row, "odenen", "ödenen", "paidAmount"),
    };
  }
  // expenses
  return {
    date: pick(row, "tarih", "date"),
    scope: pick(row, "kapsam", "scope"),
    category: pick(row, "kategori", "category"),
    productName: pick(row, "urun", "ürün", "productName"),
    partnerName: pick(row, "cari", "partnerName"),
    totalAmount: pick(row, "toplam", "totalAmount"),
    paidAmount: pick(row, "odenen", "ödenen", "paidAmount"),
  };
}

/** Side-effect-free validation for the preview (does NOT resolve/create rows). */
function validateBody(type: string, body: Record<string, unknown>): string | null {
  if (!parseDate(body.date)) return "Geçersiz/eksik tarih";
  if (type === "expenses") {
    if (toNumber(body.totalAmount) <= 0 && toNumber(body.paidAmount) <= 0)
      return "Tutar (toplam/ödenen) gerekli";
    if (!String(body.category ?? "").trim()) return "Kategori gerekli";
    return null;
  }
  if (!String(body.productName ?? "").trim()) return "Ürün adı gerekli";
  if (toNumber(body.quantity) <= 0) return "Adet > 0 olmalı";
  if (type === "sales" && !String(body.customerName ?? "").trim()) return "Müşteri gerekli";
  return null;
}

const TYPES = new Set(["purchases", "sales", "expenses"]);

importRouter.post(
  "/import/:type",
  requireRole("ADMIN"),
  upload.single("file"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const type = String(req.params.type ?? "");
    if (!TYPES.has(type)) return res.status(404).json({ error: "unknown_import" });
    const file = (req as unknown as { file?: { buffer: Buffer; originalname: string } }).file;
    if (!file) return res.status(400).json({ error: "no_file" });

    let rows: Row[];
    try {
      rows = parseFile(file.buffer, file.originalname);
    } catch {
      return res.status(400).json({ error: "parse_failed" });
    }

    const bodies = rows.map((r) => rowToBody(type, r));
    const errors: { row: number; error: string }[] = [];
    const validIdx: number[] = [];
    bodies.forEach((b, i) => {
      const err = validateBody(type, b);
      if (err) errors.push({ row: i + 2, error: err }); // +2: header + 1-based
      else validIdx.push(i);
    });

    const commit = String(req.query.commit ?? "") === "true";
    const summary = {
      type,
      total: rows.length,
      valid: validIdx.length,
      invalid: errors.length,
      errors: errors.slice(0, 30),
      sample: bodies.slice(0, 5),
    };

    if (!commit) return res.json({ ...summary, committed: false });

    // Commit: build (resolving/creating products & partners) and create.
    let created = 0;
    const commitErrors: { row: number; error: string }[] = [];
    for (const i of validIdx) {
      try {
        const body = bodies[i];
        if (type === "purchases") {
          const data = await buildPurchaseData(body);
          if (!data) throw new Error("Satır çözümlenemedi");
          await prisma.purchase.create({ data });
        } else if (type === "sales") {
          const data = await buildSaleData(body);
          if (!data) throw new Error("Satır çözümlenemedi");
          await prisma.sale.create({ data: { ...data, salesRepId: req.auth?.userId ?? null } });
        } else {
          const data = await buildExpenseData(body);
          if (!data) throw new Error("Satır çözümlenemedi");
          await prisma.expense.create({ data });
        }
        created++;
      } catch (e) {
        commitErrors.push({ row: i + 2, error: e instanceof Error ? e.message : "Kayıt hatası" });
      }
    }

    return res.json({
      ...summary,
      committed: true,
      created,
      errors: [...summary.errors, ...commitErrors].slice(0, 30),
    });
  }),
);
