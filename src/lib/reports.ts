import { prisma } from "./prisma";

export async function getDashboardStats() {
  const [gider, alim, satis, tedarikci, urun] = await Promise.all([
    prisma.giderGirisi.aggregate({ _sum: { pesinOdenen: true } }),
    prisma.urunAlim.aggregate({ _sum: { kdvDahilTutar: true } }),
    prisma.urunSatis.aggregate({ _sum: { kdvDahilTutar: true } }),
    prisma.tedarikci.count(),
    prisma.urun.count(),
  ]);
  return {
    toplamGider: gider._sum.pesinOdenen ?? 0,
    toplamAlim: alim._sum.kdvDahilTutar ?? 0,
    toplamSatis: satis._sum.kdvDahilTutar ?? 0,
    tedarikciSayisi: tedarikci,
    urunSayisi: urun,
  };
}

export async function getStokRaporu() {
  const urunler = await prisma.urun.findMany({ orderBy: { ad: "asc" } });
  const alimlar = await prisma.urunAlim.findMany();
  const satislar = await prisma.urunSatis.findMany();
  return urunler.map((u) => {
    const alim = alimlar.filter((a) => a.urunAdi === u.ad);
    const satis = satislar.filter((s) => s.urunAdi === u.ad);
    const toplamAlim = alim.reduce((s, x) => s + x.alimAdeti, 0);
    const toplamSatis = satis.reduce((s, x) => s + x.satisAdeti, 0);
    return { urun: u.ad, toplamAlim, toplamSatis, stok: toplamAlim - toplamSatis };
  });
}

export async function getTedarikciBorcListesi() {
  const tedarikciler = await prisma.tedarikci.findMany();
  const alimlar = await prisma.urunAlim.findMany();
  const odemeler = await prisma.tedarikciOdeme.findMany();
  return tedarikciler.map((t) => {
    const alimToplam = alimlar
      .filter((a) => a.tedarikci === t.ad)
      .reduce((s, x) => s + (x.kdvDahilTutar - (x.pesinOdenen ?? 0)), 0);
    const odenen = odemeler
      .filter((o) => o.tedarikciAdi === t.ad)
      .reduce((s, x) => s + x.odenenTutar, 0);
    const borc = alimToplam - odenen;
    return { ad: t.ad, tip: t.tip, alimBorc: alimToplam, odenen, borc };
  }).filter((x) => Math.abs(x.borc) > 0.01);
}

export async function getMusteriAlacakListesi() {
  const satislar = await prisma.urunSatis.findMany();
  const tahsilatlar = await prisma.musteriTahsilat.findMany();
  const musteriler = [...new Set(satislar.map((s) => s.musteri))];
  return musteriler.map((m) => {
    const satisToplam = satislar
      .filter((s) => s.musteri === m)
      .reduce((s, x) => s + x.kdvDahilTutar, 0);
    const tahsil = tahsilatlar
      .filter((t) => t.musteriAdi === m)
      .reduce((s, x) => s + x.tahsilatTutari, 0);
  return { ad: m, satisToplam, tahsil, alacak: satisToplam - tahsil };
  }).filter((x) => Math.abs(x.alacak) > 0.01);
}

export async function getGiderRaporu(ay?: number, yil?: number) {
  const where =
    ay && yil ? { ay, yil } : ay ? { ay } : yil ? { yil } : {};
  return prisma.giderGirisi.findMany({
    where,
    orderBy: { tarih: "desc" },
  });
}

export async function getGelirGiderRaporu(baslangic: Date, bitis: Date) {
  const [satislar, giderler] = await Promise.all([
    prisma.urunSatis.findMany({
      where: { tarih: { gte: baslangic, lte: bitis } },
    }),
    prisma.giderGirisi.findMany({
      where: { tarih: { gte: baslangic, lte: bitis } },
    }),
  ]);
  const gelir = satislar.reduce((s, x) => s + x.kdvDahilTutar, 0);
  const gider = giderler.reduce((s, x) => s + x.pesinOdenen, 0);
  return { gelir, gider, kar: gelir - gider, satislar, giderler };
}

export async function getMusteriRaporu(musteriAdi: string) {
  const satislar = await prisma.urunSatis.findMany({
    where: { musteri: musteriAdi },
  });
  const tahsilatlar = await prisma.musteriTahsilat.findMany({
    where: { musteriAdi },
  });
  const satisToplam = satislar.reduce((s, x) => s + x.toplamTutar, 0);
  const kdvliToplam = satislar.reduce((s, x) => s + x.kdvDahilTutar, 0);
  const tahsil = tahsilatlar.reduce((s, x) => s + x.tahsilatTutari, 0);
  return { satislar, tahsilatlar, satisToplam, kdvliToplam, tahsil, alacak: kdvliToplam - tahsil };
}

export async function getTedarikciRaporu(tedarikciAdi: string) {
  const alimlar = await prisma.urunAlim.findMany({
    where: { tedarikci: tedarikciAdi },
  });
  const odemeler = await prisma.tedarikciOdeme.findMany({
    where: { tedarikciAdi },
  });
  const alimToplam = alimlar.reduce((s, x) => s + x.kdvDahilTutar, 0);
  const pesin = alimlar.reduce((s, x) => s + (x.pesinOdenen ?? 0), 0);
  const odenen = odemeler.reduce((s, x) => s + x.odenenTutar, 0);
  return { alimlar, odemeler, alimToplam, pesin, odenen, borc: alimToplam - pesin - odenen };
}

export async function getUrunRaporu(urunAdi?: string) {
  const where = urunAdi ? { urunAdi } : {};
  const [satislar, alimlar] = await Promise.all([
    prisma.urunSatis.findMany({ where }),
    prisma.urunAlim.findMany({ where: urunAdi ? { urunAdi } : {} }),
  ]);
  const satisTutari = satislar.reduce((s, x) => s + x.toplamTutar, 0);
  const alimTutari = alimlar.reduce((s, x) => s + x.toplamTutar, 0);
  return { satislar, alimlar, satisTutari, alimTutari, kar: satisTutari - alimTutari };
}
