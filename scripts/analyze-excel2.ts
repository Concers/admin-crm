import * as XLSX from "xlsx";
import * as path from "path";

const file = path.resolve("Kadim Naturel dosyasının kopyası.xlsx");
const wb = XLSX.readFile(file, { cellDates: true });

function getHeaders(sheetName: string, headerRow: number) {
  const sheet = wb.Sheets[sheetName];
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  const headers: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: headerRow, c });
    const cell = sheet[addr];
    headers.push(cell ? String(cell.v) : `COL_${c}`);
  }
  return headers;
}

function countDataRows(sheetName: string, startRow: number, keyCol: number) {
  const sheet = wb.Sheets[sheetName];
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  let count = 0;
  for (let r = startRow; r <= range.e.r; r++) {
    const addr = XLSX.utils.encode_cell({ r, c: keyCol });
    const cell = sheet[addr];
    if (cell && cell.v != null && cell.v !== "") count++;
  }
  return count;
}

const entrySheets = [
  { name: "Gider Girişi", headerRow: 2, keyCol: 0, startRow: 3 },
  { name: "Ürün Alım Giriş", headerRow: 2, keyCol: 0, startRow: 3 },
  { name: "Ürün Satış Giriş", headerRow: 2, keyCol: 0, startRow: 3 },
  { name: "Tedarikçi Ödeme", headerRow: 2, keyCol: 0, startRow: 3 },
  { name: "Müşteri Tahsilat", headerRow: 2, keyCol: 0, startRow: 3 },
];

console.log("=== GİRİŞ SAYFALARI SÜTUNLARI ===");
for (const s of entrySheets) {
  const headers = getHeaders(s.name, s.headerRow);
  const rows = countDataRows(s.name, s.startRow, s.keyCol);
  console.log(`\n${s.name} (${rows} veri satırı):`);
  headers.forEach((h, i) => console.log(`  ${i}: ${h}`));
}

// TANIMLAMA yapısı
console.log("\n=== TANIMLAMA ===");
const tanim = wb.Sheets["TANIMLAMA"];
const range = XLSX.utils.decode_range(tanim["!ref"] || "A1");
// Col A-B: suppliers, Col D: products, Col F: general expenses, Col H: product expenses
const suppliers = new Set<string>();
const products = new Set<string>();
const genelGider = new Set<string>();
const urunGider = new Set<string>();
for (let r = 5; r <= range.e.r; r++) {
  const a = tanim[XLSX.utils.encode_cell({ r, c: 0 })]?.v;
  const b = tanim[XLSX.utils.encode_cell({ r, c: 1 })]?.v;
  const d = tanim[XLSX.utils.encode_cell({ r, c: 3 })]?.v;
  const f = tanim[XLSX.utils.encode_cell({ r, c: 5 })]?.v;
  const h = tanim[XLSX.utils.encode_cell({ r, c: 7 })]?.v;
  if (b) suppliers.add(String(b));
  if (d) products.add(String(d));
  if (f) genelGider.add(String(f));
  if (h) urunGider.add(String(h));
}
console.log(`Tedarikçiler: ${suppliers.size}`);
console.log(`Ürünler: ${products.size}`);
console.log(`Genel Giderler: ${genelGider.size}`);
console.log(`Ürün Giderleri: ${urunGider.size}`);

// Report sheets first rows
const reports = ["GİDER RAPOR", "Ürün Raporu", "Gelir_Gider Rapor", "STOK RAPORU", "Tedarikçi Rapor", "Müşteri Rapor"];
console.log("\n=== RAPOR SAYFALARI (ilk 5 satır) ===");
for (const name of reports) {
  const sheet = wb.Sheets[name];
  if (!sheet) continue;
  const r = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  console.log(`\n--- ${name} ---`);
  for (let row = 0; row <= Math.min(4, r.e.r); row++) {
    const cells: string[] = [];
    for (let c = 0; c <= Math.min(8, r.e.c); c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c })];
      cells.push(cell ? String(cell.v).slice(0, 30) : "");
    }
    console.log(`R${row + 1}: ${cells.join(" | ")}`);
  }
}
