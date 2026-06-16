import { ayAdi } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/utils";

type GiderRecord = {
  id: number;
  tarih: Date;
  giderKategori: string;
  giderTuru: string;
  periyotAy: number | null;
  urunAdi: string | null;
  tedarikciAdi: string | null;
  toplamTutar: number;
  pesinOdenen: number;
  notlar: string | null;
  ayAdi: string | null;
  ay: number | null;
  yil: number | null;
  aylikGiderPayi: number | null;
  baslangicAy: number | null;
  baslangicYil: number | null;
  bitisAy: number | null;
  bitisYil: number | null;
  baslangicTarihi: Date | null;
  bitisTarihi: Date | null;
};

function formatAyYil(ay: number | null, yil: number | null) {
  if (!ay && !yil) return "-";
  const ayStr = ay ? ayAdi(ay) : "-";
  return yil ? `${ayStr} ${yil}` : ayStr;
}

function formatKategori(kategori: string) {
  if (kategori === "ÜRÜN_GİDERLERİ") return "Ürün Gideri";
  return "Genel Gider";
}

export function mapGiderRows(giderler: GiderRecord[]) {
  return giderler.map((g) => ({
    id: g.id,
    gun: formatDate(g.tarih),
    ay: g.ayAdi?.trim() ?? (g.ay ? ayAdi(g.ay) : "-"),
    yil: g.yil ? String(g.yil) : "-",
    giderKategori: formatKategori(g.giderKategori),
    giderTuru: g.giderTuru || "-",
    periyotAy: g.periyotAy ? String(g.periyotAy) : "-",
    urunAdi: g.urunAdi ?? "-",
    tedarikciAdi: g.tedarikciAdi ?? "-",
    toplamTutar: formatCurrency(g.toplamTutar),
    pesinOdenen: formatCurrency(g.pesinOdenen),
    notlar: g.notlar ?? "",
    aylikGiderPayi: g.aylikGiderPayi != null ? formatCurrency(g.aylikGiderPayi) : "-",
    baslangicDonem: formatAyYil(g.baslangicAy, g.baslangicYil),
    bitisDonem: formatAyYil(g.bitisAy, g.bitisYil),
    baslangicTarihi: g.baslangicTarihi ? formatDate(g.baslangicTarihi) : "-",
    bitisTarihi: g.bitisTarihi ? formatDate(g.bitisTarihi) : "-",
  }));
}

export type GiderTableRow = ReturnType<typeof mapGiderRows>[number];
