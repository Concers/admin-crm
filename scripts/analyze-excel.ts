import * as XLSX from "xlsx";
import * as path from "path";

const file = path.resolve("Kadim Naturel dosyasının kopyası.xlsx");
const wb = XLSX.readFile(file, { cellFormula: true, cellDates: true });

const sheetsToAnalyze = [
  "TANIMLAMA",
  "Gider Girişi",
  "Ürün Alım Giriş",
  "Ürün Satış Giriş",
  "Tedarikçi Ödeme",
  "Müşteri Tahsilat",
  "GİDER DATA",
  "Yeni Ürün takip",
];

for (const name of sheetsToAnalyze) {
  const sheet = wb.Sheets[name];
  if (!sheet) {
    console.log(`\n=== ${name} — BULUNAMADI ===`);
    continue;
  }
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  console.log(`\n=== ${name} (${range.e.r + 1} satır, ${range.e.c + 1} sütun) ===`);
  // İlk 8 satırı ham olarak göster
  for (let r = range.s.r; r <= Math.min(range.s.r + 7, range.e.r); r++) {
    const cells: string[] = [];
    for (let c = range.s.c; c <= Math.min(range.s.c + 12, range.e.c); c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];
      if (!cell) {
        cells.push("");
        continue;
      }
      let val = cell.v;
      if (cell.f) val = `=${cell.f}`;
      cells.push(String(val ?? "").slice(0, 40));
    }
    console.log(`R${r + 1}: ${cells.map((v) => `[${v}]`).join(" | ")}`);
  }
}

// Formül içeren hücre sayısı
console.log("\n=== FORMÜL İSTATİSTİKLERİ ===");
for (const name of wb.SheetNames) {
  const sheet = wb.Sheets[name];
  let formulas = 0;
  let dataRows = 0;
  for (const key of Object.keys(sheet)) {
    if (key.startsWith("!")) continue;
    const cell = sheet[key];
    if (cell.f) formulas++;
    if (cell.v != null && cell.v !== "") dataRows++;
  }
  if (formulas > 0 || name.includes("Giriş") || name.includes("GİDER")) {
    console.log(`${name}: ${formulas} formül, ~${dataRows} dolu hücre`);
  }
}
