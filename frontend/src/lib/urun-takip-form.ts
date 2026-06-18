import { dateInputToApi, parseCalendarParts } from "@/lib/dates";
import { URUN_TAKIP_FIELDS } from "@/lib/urun-takip-fields";
import { toDateInputValue } from "@/lib/utils";

/** dd.mm.yyyy veya ISO → `<input type="date">` değeri. */
export function attrToDateInput(value: string | null | undefined): string {
  if (!value || value === "—") return "";
  const dmY = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dmY) return `${dmY[3]}-${dmY[2]}-${dmY[1]}`;
  try {
    return toDateInputValue(value);
  } catch {
    return "";
  }
}

/** Evet/Hayır metni → tri-select değeri. */
export function attrToTriBool(value: string | null | undefined): string {
  if (!value || value === "—") return "";
  const v = value.trim().toLowerCase();
  if (["evet", "yes", "true", "1", "x", "✓", "tamam", "ok"].includes(v)) return "true";
  if (["hayır", "hayir", "no", "false", "0"].includes(v)) return "false";
  return "";
}

export function dateInputToAttr(value: string): string | null {
  const api = dateInputToApi(value);
  if (!api) return null;
  const { year, month, day } = parseCalendarParts(api);
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

export function triBoolToAttr(value: FormDataEntryValue | null): string | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  if (s === "true" || s === "1") return "Evet";
  if (s === "false" || s === "0") return "Hayır";
  return null;
}

export function attributesFromForm(formData: FormData): Record<string, string | null> {
  const attrs: Record<string, string | null> = {};
  for (const field of URUN_TAKIP_FIELDS) {
    if (field.key === "urunAdi") continue;
    const raw = formData.get(field.key);
    if (field.input === "date") {
      attrs[field.key] = dateInputToAttr(String(raw ?? "").trim());
    } else if (field.input === "bool") {
      attrs[field.key] = triBoolToAttr(raw);
    } else {
      const v = String(raw ?? "").trim();
      attrs[field.key] = v || null;
    }
  }
  return attrs;
}

function triBoolFromStr(value: string | null | undefined): boolean | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (["evet", "yes", "true", "1"].includes(v)) return true;
  if (["hayır", "hayir", "no", "false", "0"].includes(v)) return false;
  return null;
}

export function legacyPayloadFromForm(
  formData: FormData,
  attributes: Record<string, string | null>,
) {
  const productName = String(formData.get("urunAdi") ?? "").trim();
  const startRaw = String(formData.get("baslangic") ?? "").trim();
  const startDate = startRaw ? dateInputToApi(startRaw) : null;
  const hammadde = attributes.hammaddeMi?.toLowerCase() ?? "";

  const orderQty = attributes.siparisAdedi ? Number(attributes.siparisAdedi) : null;

  return {
    productName,
    startDate,
    supplierName: attributes.tedarikci,
    orderQuantity: orderQty != null && Number.isFinite(orderQty) ? orderQty : null,
    productClass: attributes.sinif,
    isRawMaterial: hammadde.includes("hammadde")
      ? true
      : hammadde
        ? false
        : triBoolFromStr(attributes.hammaddeMi),
    orderPlaced: triBoolFromStr(attributes.siparisVerildi),
    priceReceived: triBoolFromStr(attributes.fiyatAlindi),
    sampleReceived: triBoolFromStr(attributes.spektHazirlandi),
    sampleApproved: triBoolFromStr(attributes.ambalajTasarimYapildi),
    productionBegun: triBoolFromStr(attributes.uretimeGecildi),
    productionDone:
      triBoolFromStr(attributes.depoyaGiris) ?? triBoolFromStr(attributes.webYuklendi),
    notes: attributes.webYuklemeTarihi,
    attributes,
  };
}

export function defaultFieldValue(
  field: (typeof URUN_TAKIP_FIELDS)[number],
  row?: {
    _productName: string;
    _startDate: string | null;
    _supplierName: string;
    _orderQuantity: number | null;
    _productClass: string;
    _attributes: Record<string, string | null | undefined>;
  },
): string {
  if (!row) return "";
  const attrs = row._attributes ?? {};

  if (field.key === "urunAdi") return row._productName;
  if (field.key === "baslangic") {
    if (row._startDate) return toDateInputValue(row._startDate);
    return attrToDateInput(attrs.baslangic);
  }

  const attrVal = attrs[field.key];
  if (attrVal != null && attrVal !== "" && attrVal !== "—") {
    if (field.input === "date") return attrToDateInput(attrVal);
    if (field.input === "bool") return attrToTriBool(attrVal);
    return attrVal;
  }

  switch (field.key) {
    case "tedarikci":
      return row._supplierName;
    case "siparisAdedi":
      return row._orderQuantity != null ? String(row._orderQuantity) : "";
    case "sinif":
      return row._productClass;
    default:
      return "";
  }
}
