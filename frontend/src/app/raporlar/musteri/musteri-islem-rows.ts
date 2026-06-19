import type { CashFlow, Sale } from "@/lib/api";
import { mapTahsilatRows } from "@/app/musteri-tahsilat/tahsilat-rows";
import { mapSatisRows } from "@/app/urun-satis/satis-rows";

export function buildMusteriSatisRows(sales: Sale[]) {
  return mapSatisRows(sales);
}

export function buildMusteriTahsilatRows(collections: CashFlow[]) {
  return mapTahsilatRows(collections);
}
