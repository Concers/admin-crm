/**
 * Excel analiz ve içe aktarma aracı.
 *
 * Kullanım:
 *   npm run import:excel -- <dosya.xlsx>            (sadece analiz: sayfa ve sütunları listeler)
 *   npm run import:excel -- <dosya.xlsx> --apply    (Customer tablosuna en iyi eşleştirmeyle aktarır)
 *
 * NOT: Firmanın gerçek Excel'i geldiğinde, sayfa/sütun yapısı bu araçla analiz edilip
 * prisma/schema.prisma birebir ona göre güncellenecek ve eşleştirme bu dosyada netleştirilecektir.
 */
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Excel başlık adlarını Customer alanlarına eşleştirmek için ipuçları.
const FIELD_HINTS: Record<string, string[]> = {
  name: ["ad", "isim", "ad soyad", "müşteri", "musteri", "yetkili", "name"],
  company: ["firma", "şirket", "sirket", "company", "unvan", "ünvan"],
  email: ["e-posta", "eposta", "email", "mail", "e-mail"],
  phone: ["telefon", "tel", "gsm", "phone", "cep"],
  city: ["şehir", "sehir", "il", "city"],
  status: ["durum", "statü", "statu", "status"],
  notes: ["not", "notlar", "açıklama", "aciklama", "note"],
};

function normalize(s: string) {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

function matchField(header: string): string | null {
  const h = normalize(header);
  for (const [field, hints] of Object.entries(FIELD_HINTS)) {
    if (hints.some((hint) => h.includes(normalize(hint)))) return field;
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const file = args.find((a) => !a.startsWith("--"));

  if (!file) {
    console.error("Bir Excel dosyası belirtin. Örn: npm run import:excel -- veri.xlsx");
    process.exit(1);
  }

  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(`Dosya bulunamadı: ${filePath}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(filePath);
  console.log(`\nDosya: ${filePath}`);
  console.log(`Sayfa sayısı: ${wb.SheetNames.length}\n`);

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
    });
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    console.log(`Sayfa: "${sheetName}" — ${rows.length} satır`);
    console.log("  Sütunlar:");
    for (const h of headers) {
      const mapped = matchField(h);
      console.log(`    - ${h}${mapped ? `  ->  Customer.${mapped}` : ""}`);
    }
    console.log("");

    if (apply) {
      const headerMap: Record<string, string> = {};
      for (const h of headers) {
        const f = matchField(h);
        if (f) headerMap[h] = f;
      }
      if (!Object.values(headerMap).includes("name")) {
        console.log(
          `  (Atlandı: "${sheetName}" sayfasında ad/isim sütunu bulunamadı.)\n`
        );
        continue;
      }

      let imported = 0;
      for (const row of rows) {
        const data: Record<string, string> = {};
        for (const [h, f] of Object.entries(headerMap)) {
          const v = row[h];
          if (v != null && String(v).trim() !== "") data[f] = String(v).trim();
        }
        if (!data.name) continue;
        await prisma.customer.create({
          data: {
            name: data.name,
            company: data.company ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
            city: data.city ?? null,
            status: data.status ?? "Yeni",
            notes: data.notes ?? null,
          },
        });
        imported++;
      }
      console.log(`  ${imported} kayıt Customer tablosuna aktarıldı.\n`);
    }
  }

  if (!apply) {
    console.log(
      "Analiz tamamlandı. İçe aktarmak için sonuna --apply ekleyin.\n"
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
