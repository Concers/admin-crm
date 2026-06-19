import type { Column } from "@/components/data-table";

const SKIP_KEYS = new Set([
  "id",
  "sil",
  "notlar",
  "notes",
  "gun",
  "baslangicAy",
  "baslangicYil",
  "bitisAy",
  "bitisYil",
  "baslangicTarihi",
  "bitisTarihi",
  "baslangicDonem",
  "bitisDonem",
  "faturaNo",
]);

/** Öncelik sırası — ilk eşleşenler “önemli filtre” adayıdır. */
const PRIORITY_KEYS = [
  "yil",
  "ay",
  "giderTuru",
  "giderKategori",
  "urunAdi",
  "musteri",
  "musteriAdi",
  "tedarikci",
  "tedarikciAdi",
  "raf",
  "periyotAy",
  "tur",
  "cari",
  "durum",
  "birim",
  "urun",
  "depo",
  "mamul",
  "recete",
  "sinif",
  "segment",
  "paraBirimi",
  "tipLabel",
  "tip",
  "rol",
  "kullanici",
  "islem",
  "kayit",
  "risk",
  "aciliyet",
  "status",
  "scope",
  "kategori",
  "partner",
  "docType",
  "role",
  "ureticiKim",
  "yon",
  "neden",
  "category",
  "customer",
  "product",
];

const MAX_PRIMARY_FILTERS = 5;

function isFilterable<T extends Record<string, unknown>>(col: Column<T>) {
  return Boolean(col.label?.trim()) && col.filterable !== false && !SKIP_KEYS.has(col.key);
}

/** Tabloda gösterilecek önemli sütun filtrelerini belirler (en fazla 5). */
export function resolvePrimaryFilterKeys<T extends Record<string, unknown>>(
  columns: Column<T>[],
  explicit?: string[]
): string[] {
  if (explicit?.length) {
    const allowed = new Set(columns.map((c) => c.key));
    return explicit.filter((k) => allowed.has(k)).slice(0, MAX_PRIMARY_FILTERS);
  }

  const filterable = columns.filter(isFilterable);
  const picked: string[] = [];

  for (const key of PRIORITY_KEYS) {
    if (picked.length >= MAX_PRIMARY_FILTERS) break;
    const col = filterable.find((c) => c.key === key && c.filterType !== "number");
    if (col) picked.push(col.key);
  }

  for (const col of filterable) {
    if (picked.length >= MAX_PRIMARY_FILTERS) break;
    if (col.filterType === "number") continue;
    if (!picked.includes(col.key)) picked.push(col.key);
  }

  return picked;
}
