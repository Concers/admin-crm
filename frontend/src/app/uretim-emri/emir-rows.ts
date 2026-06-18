import type { BomDoc, ProductionOrderDoc } from "@/lib/api";
import { formatCalendarDate } from "@/lib/utils";

const STATUS: Record<string, string> = {
  PLANNED: "Planlandı",
  IN_PROGRESS: "Üretimde",
  DONE: "Tamamlandı",
  CANCELLED: "İptal",
};

export function mapEmirRows(
  orders: ProductionOrderDoc[],
  productName: Map<number, string>,
  bomName: Map<number, string>
) {
  return orders.map((o) => ({
    id: o.id,
    mamul: productName.get(o.productId) ?? String(o.productId),
    recete: o.bomId ? bomName.get(o.bomId) ?? `#${o.bomId}` : "—",
    miktar: String(o.quantity),
    durum: STATUS[o.status] ?? o.status,
    baslangic: o.startDate ? formatCalendarDate(o.startDate) : "—",
    bitis: o.endDate ? formatCalendarDate(o.endDate) : "—",
    notlar: o.notes?.trim() || "",
    _productId: o.productId,
    _bomId: o.bomId,
    _quantity: o.quantity,
    _status: o.status,
    _startDate: o.startDate,
    _endDate: o.endDate,
    _notes: o.notes ?? "",
  }));
}

export type EmirTableRow = ReturnType<typeof mapEmirRows>[number];

export type ReceteOption = { id: number; name: string; productId: number };

export function mapReceteOptions(boms: BomDoc[]): ReceteOption[] {
  return boms.filter((b) => b.isActive).map((b) => ({ id: b.id, name: b.name, productId: b.productId }));
}
