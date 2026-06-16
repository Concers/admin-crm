import * as XLSX from "xlsx";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import {
  calcAlimFields,
  calcGiderFields,
  calcSatisFields,
  isUrunGideri,
  normalizeGiderKategori,
  parseDate,
} from "../src/lib/calculations";

const prisma = new PrismaClient();
const FILE = path.resolve("Kadim Naturel dosyasının kopyası.xlsx");

function cell(sheet: XLSX.WorkSheet, r: number, c: number) {
  const cell = sheet[XLSX.utils.encode_cell({ r, c })];
  if (!cell || cell.v == null || cell.v === "") return null;
  return cell.v;
}

function num(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

async function main() {
  const wb = XLSX.readFile(FILE, { cellDates: true });
  console.log("Veritabanı temizleniyor...");
  await prisma.musteriTahsilat.deleteMany();
  await prisma.tedarikciOdeme.deleteMany();
  await prisma.urunSatis.deleteMany();
  await prisma.urunAlim.deleteMany();
  await prisma.giderGirisi.deleteMany();
  await prisma.yeniUrunTakip.deleteMany();
  await prisma.tedarikci.deleteMany();
  await prisma.urun.deleteMany();
  await prisma.genelGiderTuru.deleteMany();
  await prisma.urunGiderTuru.deleteMany();

  // TANIMLAMA
  const t = wb.Sheets["TANIMLAMA"];
  const tr = XLSX.utils.decode_range(t["!ref"] || "A1");
  for (let r = 6; r <= tr.e.r; r++) {
    const tip = cell(t, r, 1);
    const ad = cell(t, r, 2);
    const urun = cell(t, r, 4);
    const gg = cell(t, r, 6);
    const ug = cell(t, r, 8);
    if (tip && ad) {
      await prisma.tedarikci.upsert({
        where: { ad: String(ad) },
        create: { tip: String(tip), ad: String(ad) },
        update: { tip: String(tip) },
      });
    }
    if (urun) {
      await prisma.urun.upsert({
        where: { ad: String(urun) },
        create: { ad: String(urun) },
        update: {},
      });
    }
    if (gg) {
      await prisma.genelGiderTuru.upsert({
        where: { ad: String(gg) },
        create: { ad: String(gg) },
        update: {},
      });
    }
    if (ug && String(ug) !== "ÜRÜN_GİDERLERİ") {
      await prisma.urunGiderTuru.upsert({
        where: { ad: String(ug) },
        create: { ad: String(ug) },
        update: {},
      });
    }
  }
  console.log("TANIMLAMA aktarıldı.");

  // Gider Girişi — Excel'de A sütunu boş, veriler B'den başlar
  const g = wb.Sheets["Gider Girişi"];
  const gr = XLSX.utils.decode_range(g["!ref"] || "A1");
  const GC = {
    gun: 1,
    ayAdi: 2,
    yil: 3,
    kategori: 4,
    tur: 5,
    periyot: 6,
    urun: 7,
    tedarikci: 8,
    toplam: 9,
    pesin: 10,
    notlar: 11,
    aylikPay: 12,
    baslangicAy: 13,
    baslangicYil: 14,
    bitisAy: 15,
    bitisYil: 16,
    baslangicTarihi: 17,
    bitisTarihi: 18,
  };
  let giderCount = 0;
  const genelTurler = new Set<string>();
  const urunTurler = new Set<string>();
  for (let r = 3; r <= gr.e.r; r++) {
    const tarih =
      parseDate(cell(g, r, GC.gun)) ??
      parseDate(cell(g, r, GC.baslangicTarihi));
    const toplam = num(cell(g, r, GC.toplam));
    const pesin = num(cell(g, r, GC.pesin));
    const giderTuru = cell(g, r, GC.tur);
    if (!tarih && toplam === 0 && pesin === 0 && !giderTuru) continue;

    const kategori = normalizeGiderKategori(cell(g, r, GC.kategori));
    const turStr = giderTuru ? String(giderTuru) : "";
    if (turStr) {
      if (isUrunGideri(kategori)) urunTurler.add(turStr);
      else genelTurler.add(turStr);
    }

    const periyotAy = num(cell(g, r, GC.periyot)) || null;
    const ayAdiRaw = cell(g, r, GC.ayAdi);
    const yilRaw = cell(g, r, GC.yil);
    const ayAdiStr = ayAdiRaw ? String(ayAdiRaw).trim() : null;
    const yilNum = yilRaw ? num(yilRaw) : null;

    const calc = tarih
      ? calcGiderFields({
          tarih,
          periyotAy,
          pesinOdenen: pesin,
          ayAdi: ayAdiStr,
        })
      : null;

    const aylikFromExcel = cell(g, r, GC.aylikPay);
    const baslangicTarihi = parseDate(cell(g, r, GC.baslangicTarihi));
    const bitisTarihi = parseDate(cell(g, r, GC.bitisTarihi));

    await prisma.giderGirisi.create({
      data: {
        tarih: tarih ?? baslangicTarihi ?? new Date(),
        giderKategori: kategori,
        giderTuru: turStr,
        periyotAy,
        urunAdi: cell(g, r, GC.urun) ? String(cell(g, r, GC.urun)) : null,
        tedarikciAdi: cell(g, r, GC.tedarikci)
          ? String(cell(g, r, GC.tedarikci))
          : null,
        toplamTutar: toplam,
        pesinOdenen: pesin,
        notlar: cell(g, r, GC.notlar) ? String(cell(g, r, GC.notlar)) : null,
        ayAdi: ayAdiStr ?? calc?.ayAdi ?? null,
        ay: cell(g, r, GC.baslangicAy)
          ? num(cell(g, r, GC.baslangicAy))
          : calc?.ay ?? null,
        yil: yilNum ?? calc?.yil ?? null,
        aylikGiderPayi: aylikFromExcel
          ? num(aylikFromExcel)
          : calc?.aylikGiderPayi ?? null,
        baslangicAy: cell(g, r, GC.baslangicAy)
          ? num(cell(g, r, GC.baslangicAy))
          : calc?.baslangicAy ?? null,
        baslangicYil: cell(g, r, GC.baslangicYil)
          ? num(cell(g, r, GC.baslangicYil))
          : calc?.baslangicYil ?? null,
        bitisAy: cell(g, r, GC.bitisAy)
          ? num(cell(g, r, GC.bitisAy))
          : calc?.bitisAy ?? null,
        bitisYil: cell(g, r, GC.bitisYil)
          ? num(cell(g, r, GC.bitisYil))
          : calc?.bitisYil ?? null,
        baslangicTarihi: baslangicTarihi ?? calc?.baslangicTarihi ?? null,
        bitisTarihi: bitisTarihi ?? calc?.bitisTarihi ?? null,
      },
    });
    giderCount++;
  }
  for (const ad of genelTurler) {
    await prisma.genelGiderTuru.upsert({
      where: { ad },
      create: { ad },
      update: {},
    });
  }
  for (const ad of urunTurler) {
    await prisma.urunGiderTuru.upsert({
      where: { ad },
      create: { ad },
      update: {},
    });
  }
  console.log(`Gider Girişi: ${giderCount} kayıt (${urunTurler.size} ürün gider türü)`);

  // Ürün Alım
  const a = wb.Sheets["Ürün Alım Giriş"];
  const ar = XLSX.utils.decode_range(a["!ref"] || "A1");
  let alimCount = 0;
  for (let r = 3; r <= ar.e.r; r++) {
    const urunAdi = cell(a, r, 1);
    const adet = num(cell(a, r, 4));
    if (!urunAdi || adet === 0) continue;
    const birim = num(cell(a, r, 3));
    const kdv = num(cell(a, r, 6), 0.2);
    const calc = calcAlimFields({ birimAlimFiyati: birim, alimAdeti: adet, kdvOrani: kdv });
    await prisma.urunAlim.create({
      data: {
        tarih: parseDate(cell(a, r, 0)) ?? new Date(),
        urunAdi: String(urunAdi),
        tedarikci: String(cell(a, r, 2) ?? ""),
        birimAlimFiyati: birim,
        alimAdeti: adet,
        kdvOrani: kdv,
        pesinOdenen: cell(a, r, 8) != null ? num(cell(a, r, 8)) : null,
        konulanRaf: cell(a, r, 9) ? String(cell(a, r, 9)) : null,
        notlar: cell(a, r, 10) ? String(cell(a, r, 10)) : null,
        ...calc,
      },
    });
    alimCount++;
  }
  console.log(`Ürün Alım: ${alimCount} kayıt`);

  // Ürün Satış
  const s = wb.Sheets["Ürün Satış Giriş"];
  const sr = XLSX.utils.decode_range(s["!ref"] || "A1");
  const alimlar = await prisma.urunAlim.findMany();
  const giderler = await prisma.giderGirisi.findMany();
  let satisCount = 0;
  for (let r = 3; r <= sr.e.r; r++) {
    const urunAdi = cell(s, r, 1);
    const adet = num(cell(s, r, 4));
    if (!urunAdi || adet === 0) continue;
    const tarih = parseDate(cell(s, r, 0)) ?? new Date();
    const birimSatis = num(cell(s, r, 3));
    const kdv = num(cell(s, r, 6), 0.2);
    const ayFromExcel = cell(s, r, 17);
    const yilFromExcel = cell(s, r, 18);
    const urunAlimlari = alimlar.filter((x) => x.urunAdi === String(urunAdi));
    const alimBirimMaliyeti =
      urunAlimlari.length > 0
        ? urunAlimlari.reduce((sum, x) => sum + x.birimAlimFiyati, 0) / urunAlimlari.length
        : 0;
    const urunGiderleri = giderler.filter(
      (x) => x.urunAdi === String(urunAdi) && isUrunGideri(x.giderKategori)
    );
    const uretimBirimMaliyeti =
      urunGiderleri.length > 0
        ? urunGiderleri.reduce((sum, x) => sum + x.pesinOdenen, 0) /
          urunGiderleri.reduce((sum, x) => sum + (x.periyotAy ?? 1), 0)
        : 0;
    const genelGiderMaliyeti = 0;
    const calc = calcSatisFields({
      birimSatisFiyati: birimSatis,
      satisAdeti: adet,
      kdvOrani: kdv,
      alimBirimMaliyeti,
      uretimBirimMaliyeti,
      genelGiderMaliyeti,
      tarih,
    });
    await prisma.urunSatis.create({
      data: {
        tarih,
        urunAdi: String(urunAdi),
        musteri: String(cell(s, r, 2) ?? ""),
        birimSatisFiyati: birimSatis,
        satisAdeti: adet,
        kdvOrani: kdv,
        pesinOdenen: cell(s, r, 8) != null ? num(cell(s, r, 8)) : null,
        hangiRaf: cell(s, r, 9) ? String(cell(s, r, 9)) : null,
        notlar: cell(s, r, 10) ? String(cell(s, r, 10)) : null,
        alimBirimMaliyeti,
        uretimBirimMaliyeti,
        genelGiderMaliyeti,
        ...calc,
        ay: ayFromExcel ? num(ayFromExcel) : calc.ay,
        yil: yilFromExcel ? num(yilFromExcel) : calc.yil,
      },
    });
    satisCount++;
  }
  console.log(`Ürün Satış: ${satisCount} kayıt`);

  // Tedarikçi Ödeme
  const to = wb.Sheets["Tedarikçi Ödeme"];
  const tor = XLSX.utils.decode_range(to["!ref"] || "A1");
  for (let r = 3; r <= tor.e.r; r++) {
    const tutar = num(cell(to, r, 2));
    const ad = cell(to, r, 1);
    if (!ad || tutar === 0) continue;
    await prisma.tedarikciOdeme.create({
      data: {
        tarih: parseDate(cell(to, r, 0)) ?? new Date(),
        tedarikciAdi: String(ad),
        odenenTutar: tutar,
        notlar: cell(to, r, 3) ? String(cell(to, r, 3)) : null,
      },
    });
  }

  // Müşteri Tahsilat
  const mt = wb.Sheets["Müşteri Tahsilat"];
  const mtr = XLSX.utils.decode_range(mt["!ref"] || "A1");
  for (let r = 3; r <= mtr.e.r; r++) {
    const tutar = num(cell(mt, r, 2));
    const ad = cell(mt, r, 1);
    if (!ad || tutar === 0) continue;
    await prisma.musteriTahsilat.create({
      data: {
        tarih: parseDate(cell(mt, r, 0)) ?? new Date(),
        musteriAdi: String(ad),
        tahsilatTutari: tutar,
        notlar: cell(mt, r, 3) ? String(cell(mt, r, 3)) : null,
      },
    });
  }

  // Yeni Ürün takip — ürünler sütun olarak (M sütunundan itibaren)
  const y = wb.Sheets["Yeni Ürün takip"];
  if (y) {
    const yr = XLSX.utils.decode_range(y["!ref"] || "A1");
    const labels = [
      "islemBaslangicTarihi", "tedarikci", "siparisAdedi", "sinif", "hammaddeMi",
      "siparisVerildi", "fiyatAlindi", "numuneAlindi", "numuneOnaylandi",
      "uretimBasladi", "uretimBitti", "notlar",
    ];
    for (let c = 12; c <= yr.e.c; c++) {
      const urunAdi = cell(y, 0, c);
      if (!urunAdi) continue;
      const data: Record<string, unknown> = { urunAdi: String(urunAdi) };
      for (let i = 0; i < labels.length && i + 1 <= 12; i++) {
        const v = cell(y, i + 1, c);
        if (v == null) continue;
        const key = labels[i];
        if (key === "islemBaslangicTarihi") data[key] = parseDate(v);
        else if (key === "siparisAdedi") data[key] = num(v);
        else data[key] = String(v);
      }
      await prisma.yeniUrunTakip.create({ data: data as never });
    }
  }

  console.log("\nİçe aktarma tamamlandı!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
