import type * as XLSXType from "xlsx";
import { parseDate } from "./calculations.js";
import { URUN_TAKIP_EXCEL_ROWS, URUN_TAKIP_FIRST_COL } from "./productDevelopmentExcel.js";

function str(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function toBool(value: unknown): boolean | null {
  const s = str(value).toLowerCase();
  if (!s) return null;
  if (["evet", "yes", "true", "1", "x", "✓", "tamam", "ok"].includes(s)) return true;
  if (["hayır", "hayir", "no", "false", "0"].includes(s)) return false;
  return null;
}

function fmtDate(value: unknown): string | null {
  const d = parseDate(value);
  if (!d) return null;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${d.getUTCFullYear()}`;
}

/** Normalize a spreadsheet cell for JSON storage / UI display. */
export function serializeDevCell(value: unknown, rowIndex: number): string | null {
  if (value == null || value === "") return null;
  const dateRows = new Set(
    URUN_TAKIP_EXCEL_ROWS.filter((r) => r.label.toLowerCase().includes("tarih")).map((r) => r.row),
  );
  if (dateRows.has(rowIndex) || rowIndex === 1) {
    return fmtDate(value) ?? (str(value) || null);
  }
  if (typeof value === "number" && rowIndex === 3) {
    return String(value);
  }
  return str(value) || null;
}

export function readDevAttributes(
  sheet: XLSXType.WorkSheet,
  col: number,
  cell: (sheet: XLSXType.WorkSheet, row: number, col: number) => unknown,
): Record<string, string | null> {
  const attributes: Record<string, string | null> = {};
  for (const def of URUN_TAKIP_EXCEL_ROWS) {
    if (def.key === "urunAdi") continue;
    attributes[def.key] = serializeDevCell(cell(sheet, def.row, col), def.row);
  }
  return attributes;
}

export function legacyFieldsFromAttributes(
  attributes: Record<string, string | null>,
  productName: string,
  raw: {
    startDate: unknown;
    supplier: unknown;
    quantity: unknown;
  },
) {
  const hammadde = attributes.hammaddeMi?.toLowerCase() ?? "";
  return {
    productName,
    startDate: parseDate(raw.startDate),
    supplierName: str(raw.supplier) || null,
    orderQuantity:
      raw.quantity != null && raw.quantity !== "" && Number.isFinite(Number(raw.quantity))
        ? Number(raw.quantity)
        : null,
    productClass: attributes.sinif,
    isRawMaterial: hammadde.includes("hammadde") ? true : hammadde ? false : null,
    orderPlaced: toBool(attributes.siparisVerildi),
    priceReceived: toBool(attributes.fiyatAlindi),
    sampleReceived: toBool(attributes.spektHazirlandi),
    sampleApproved: toBool(attributes.ambalajTasarimYapildi),
    productionBegun: toBool(attributes.uretimeGecildi),
    productionDone: toBool(attributes.depoyaGiris) ?? toBool(attributes.webYuklendi),
    notes: attributes.webYuklemeTarihi,
  };
}

export { URUN_TAKIP_EXCEL_ROWS, URUN_TAKIP_FIRST_COL } from "./productDevelopmentExcel.js";
