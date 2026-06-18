const AYLAR = [
  "OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN",
  "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK",
] as const;

export function ayAdi(ay: number) {
  return AYLAR[ay - 1] ?? "";
}

/** Türkçe ay adından sıra numarası (1–12); bulunamazsa 0. */
export function ayIndeksi(ayAd: string) {
  const normalized = ayAd.trim().toLocaleUpperCase("tr-TR");
  const idx = AYLAR.indexOf(normalized as (typeof AYLAR)[number]);
  return idx >= 0 ? idx + 1 : 0;
}

function ayAdiFromNumber(ay: number) {
  return ayAdi(ay);
}

export function parseDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  const d = new Date(String(val));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function calcGiderFields(data: {
  tarih: Date;
  periyotAy?: number | null;
  pesinOdenen: number;
  ayAdi?: string | null;
}) {
  const ay = data.tarih.getMonth() + 1;
  const yil = data.tarih.getFullYear();
  const ayAdi = data.ayAdi?.trim() || ayAdiFromNumber(ay);
  const periyot = data.periyotAy && data.periyotAy > 0 ? data.periyotAy : 1;
  const aylikGiderPayi = data.pesinOdenen / periyot;

  const baslangicAy = ay;
  const baslangicYil = yil;
  let bitisAy = ay + periyot - 1;
  let bitisYil = yil;
  while (bitisAy > 12) {
    bitisAy -= 12;
    bitisYil += 1;
  }

  const baslangicTarihi = new Date(yil, ay - 1, 1);
  const bitisTarihi = new Date(bitisYil, bitisAy, 0);

  return { ayAdi, ay, yil, aylikGiderPayi, baslangicAy, baslangicYil, bitisAy, bitisYil, baslangicTarihi, bitisTarihi };
}

export function calcAlimFields(data: {
  birimAlimFiyati: number;
  alimAdeti: number;
  kdvOrani: number;
}) {
  const toplamTutar = data.birimAlimFiyati * data.alimAdeti;
  const kdvDahilTutar = toplamTutar * (1 + data.kdvOrani);
  return { toplamTutar, kdvDahilTutar };
}

export function calcSatisFields(data: {
  birimSatisFiyati: number;
  satisAdeti: number;
  kdvOrani: number;
  alimBirimMaliyeti?: number;
  uretimBirimMaliyeti?: number;
  genelGiderMaliyeti?: number;
  tarih: Date;
}) {
  const toplamTutar = data.birimSatisFiyati * data.satisAdeti;
  const kdvDahilTutar = toplamTutar * (1 + data.kdvOrani);
  const toplamBirimMaliyeti =
    (data.alimBirimMaliyeti ?? 0) +
    (data.uretimBirimMaliyeti ?? 0) +
    (data.genelGiderMaliyeti ?? 0);
  const karYuzdesi =
    toplamBirimMaliyeti > 0 && data.birimSatisFiyati > 0
      ? ((data.birimSatisFiyati - toplamBirimMaliyeti) / toplamBirimMaliyeti) * 100
      : null;

  return {
    toplamTutar,
    kdvDahilTutar,
    toplamBirimMaliyeti,
    karYuzdesi,
    ay: data.tarih.getMonth() + 1,
    yil: data.tarih.getFullYear(),
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: Date | string) {
  const raw = typeof value === "string" ? value : value.toISOString();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const dd = m[3];
    const mm = m[2];
    const yy = m[1];
    return `${dd}.${mm}.${yy}`;
  }
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export const GIDER_KATEGORILERI = ["Genel_Giderler", "ÜRÜN_GİDERLERİ"] as const;

export function normalizeGiderKategori(val: unknown): string {
  const s = String(val ?? "").trim();
  if (!s || s === "undefined") return "Genel_Giderler";
  const upper = s.toLocaleUpperCase("tr");
  if (upper.includes("ÜRÜN") && upper.includes("GİDER")) return "ÜRÜN_GİDERLERİ";
  return "Genel_Giderler";
}

export function isUrunGideri(kategori: string) {
  return normalizeGiderKategori(kategori) === "ÜRÜN_GİDERLERİ";
}
