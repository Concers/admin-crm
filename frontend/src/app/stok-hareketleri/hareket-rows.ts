import type { StockMovement } from "@/lib/api";
import { formatCalendarDate } from "@/lib/utils";

export const TUR_LABEL: Record<string, string> = {
  IN: "Giriş",
  OUT: "Çıkış",
  ADJUSTMENT: "Düzeltme",
  TRANSFER: "Transfer",
  WASTE: "Fire",
};

const CIKIS_TURLERI = new Set(["OUT", "WASTE"]);

export function mapHareketRows(movements: StockMovement[]) {
  return movements.map((m) => {
    const tur = TUR_LABEL[m.type] ?? m.type;
    const cikis = CIKIS_TURLERI.has(m.type);
    return {
      id: m.id,
      tarih: formatCalendarDate(m.date),
      urun: m.product?.name ?? "—",
      tur,
      depo: m.warehouse?.name ?? "—",
      miktar: cikis ? `−${m.quantity}` : `+${m.quantity}`,
      aciklama: m.reason?.trim() || "",
      notlar: m.notes?.trim() || "",
      _date: m.date,
      _type: m.type,
      _quantity: m.quantity,
      _signedQuantity: cikis ? -m.quantity : m.quantity,
      _productName: m.product?.name ?? "",
      _warehouseId: m.warehouseId,
      _warehouseName: m.warehouse?.name ?? "",
      _reason: m.reason ?? "",
      _notes: m.notes ?? "",
    };
  });
}

export type HareketTableRow = ReturnType<typeof mapHareketRows>[number];
