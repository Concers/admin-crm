import type { Warehouse } from "@/lib/api";

export function mapDepoRows(
  warehouses: Warehouse[],
  hareketSayisi: Map<number, number>
) {
  return warehouses.map((w) => ({
    id: w.id,
    depo: w.name,
    lokasyon: w.location?.trim() || "—",
    hareket: hareketSayisi.get(w.id) ?? 0,
    _name: w.name,
    _location: w.location ?? "",
  }));
}

export type DepoTableRow = ReturnType<typeof mapDepoRows>[number];
