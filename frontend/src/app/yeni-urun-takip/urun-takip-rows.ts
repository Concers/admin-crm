import type { ProductDevelopment } from "@/lib/api";
import { URUN_TAKIP_TABLE_COLUMNS, displayCellValue } from "@/lib/urun-takip-fields";
import { formatCalendarDate } from "@/lib/utils";

type Attrs = Record<string, string | null | undefined>;

function pick(attrs: Attrs, key: string, fallback?: string | null): string {
  const v = attrs[key];
  if (v != null && v !== "") return String(v);
  return fallback?.trim() || "—";
}

export function mapUrunTakipRows(kayitlar: ProductDevelopment[]) {
  return kayitlar.map((k) => {
    const attrs = (k.attributes ?? {}) as Attrs;
    const row: Record<string, string | number | null | boolean | Attrs> = {
      id: k.id,
      _startDate: k.startDate,
      _productName: k.productName,
      _supplierName: k.supplierName ?? "",
      _orderQuantity: k.orderQuantity,
      _productClass: k.productClass ?? "",
      _isRawMaterial: k.isRawMaterial,
      _orderPlaced: k.orderPlaced,
      _priceReceived: k.priceReceived,
      _sampleReceived: k.sampleReceived,
      _sampleApproved: k.sampleApproved,
      _productionBegun: k.productionBegun,
      _productionDone: k.productionDone,
      _notes: k.notes ?? "",
      _attributes: attrs,
    };

    for (const col of URUN_TAKIP_TABLE_COLUMNS) {
      switch (col.key) {
        case "urunAdi":
          row.urunAdi = k.productName;
          break;
        case "baslangic":
          row.baslangic = k.startDate
            ? formatCalendarDate(k.startDate)
            : pick(attrs, "baslangic");
          break;
        case "tedarikci":
          row.tedarikci = pick(attrs, "tedarikci", k.supplierName);
          break;
        case "siparisAdedi":
          row.siparisAdedi =
            k.orderQuantity != null
              ? String(k.orderQuantity)
              : pick(attrs, "siparisAdedi");
          break;
        case "sinif":
          row.sinif = pick(attrs, "sinif", k.productClass);
          break;
        default:
          row[col.key] = displayCellValue(col.key, attrs[col.key] ?? null);
      }
    }

    return row as UrunTakipTableRow;
  });
}

export type UrunTakipTableRow = {
  id: number;
  urunAdi: string;
  baslangic: string;
  tedarikci: string;
  siparisAdedi: string;
  sinif: string;
  hammaddeMi: string;
  siparisVerildi: string;
  fiyatAlindi: string;
  numuneAlindi: string;
  numuneOnaylandi: string;
  uretimBasladi: string;
  uretimBitti: string;
  notlar: string;
  [key: string]: string | number | null | boolean | Attrs;
  _startDate: string | null;
  _productName: string;
  _supplierName: string;
  _orderQuantity: number | null;
  _productClass: string;
  _isRawMaterial: boolean | null;
  _orderPlaced: boolean | null;
  _priceReceived: boolean | null;
  _sampleReceived: boolean | null;
  _sampleApproved: boolean | null;
  _productionBegun: boolean | null;
  _productionDone: boolean | null;
  _notes: string;
  _attributes: Attrs;
};
