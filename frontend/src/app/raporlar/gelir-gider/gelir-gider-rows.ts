import type { GelirGiderReport } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export function mapGelirGiderMatrix(rapor: GelirGiderReport) {
  const maxLen = Math.max(
    rapor.satisKalemleri.length,
    rapor.alimKalemleri.length,
    rapor.urunGiderKalemleri.length,
    rapor.genelGiderKalemleri.length,
    1
  );

  const rows = Array.from({ length: maxLen }, (_, i) => {
    const satis = rapor.satisKalemleri[i];
    const alim = rapor.alimKalemleri[i];
    const urunGider = rapor.urunGiderKalemleri[i];
    const genelGider = rapor.genelGiderKalemleri[i];

    return {
      id: i,
      satisUrun: satis?.name ?? "",
      satisTutar: satis ? formatCurrency(satis.amount) : "",
      alimUrun: alim?.name ?? "",
      alimTutar: alim ? formatCurrency(alim.amount) : "",
      urunGiderUrun: urunGider?.name ?? "",
      urunGiderTutar: urunGider ? formatCurrency(urunGider.amount) : "",
      genelGiderTur: genelGider?.name ?? "",
      genelGiderTutar: genelGider ? formatCurrency(genelGider.amount) : "",
      _satisAmount: satis?.amount ?? 0,
      _alimAmount: alim?.amount ?? 0,
      _urunGiderAmount: urunGider?.amount ?? 0,
      _genelGiderAmount: genelGider?.amount ?? 0,
    };
  });

  return {
    rows,
    toplamSatiri: {
      id: -1,
      satisUrun: "TOPLAM",
      satisTutar: formatCurrency(rapor.satisToplam),
      alimUrun: "TOPLAM",
      alimTutar: formatCurrency(rapor.alimToplam),
      urunGiderUrun: "TOPLAM",
      urunGiderTutar: formatCurrency(rapor.urunGiderleri),
      genelGiderTur: "TOPLAM",
      genelGiderTutar: formatCurrency(rapor.genelGiderler),
      _satisAmount: rapor.satisToplam,
      _alimAmount: rapor.alimToplam,
      _urunGiderAmount: rapor.urunGiderleri,
      _genelGiderAmount: rapor.genelGiderler,
    },
  };
}

export type GelirGiderMatrixRow = ReturnType<typeof mapGelirGiderMatrix>["rows"][number];
