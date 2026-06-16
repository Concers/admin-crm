import * as XLSX from "xlsx";
import * as path from "path";

const wb = XLSX.readFile(path.resolve("Kadim Naturel dosyasının kopyası.xlsx"), {
  cellDates: true,
  raw: false,
});

function cellVal(sheet: XLSX.WorkSheet, r: number, c: number) {
  const cell = sheet[XLSX.utils.encode_cell({ r, c })];
  if (!cell || cell.v == null || cell.v === "") return null;
  return cell.v;
}

function countNonEmpty(sheetName: string, col: number, fromRow: number) {
  const s = wb.Sheets[sheetName];
  const range = XLSX.utils.decode_range(s["!ref"] || "A1");
  let n = 0;
  for (let r = fromRow; r <= range.e.r; r++) {
    if (cellVal(s, r, col) != null) n++;
  }
  return n;
}

console.log("Veri satır sayıları:");
console.log("Gider Girişi (tarih):", countNonEmpty("Gider Girişi", 0, 3));
console.log("Gider Girişi (tutar):", countNonEmpty("Gider Girişi", 8, 3));
console.log("Ürün Alım (tarih):", countNonEmpty("Ürün Alım Giriş", 0, 3));
console.log("Ürün Satış (tarih):", countNonEmpty("Ürün Satış Giriş", 0, 3));
console.log("Tedarikçi Ödeme:", countNonEmpty("Tedarikçi Ödeme", 0, 3));
console.log("Müşteri Tahsilat:", countNonEmpty("Müşteri Tahsilat", 0, 3));

const t = wb.Sheets["TANIMLAMA"];
const suppliers: string[] = [];
const products: string[] = [];
const genelGiderler: string[] = [];
const urunGiderleri: string[] = [];
const range = XLSX.utils.decode_range(t["!ref"] || "A1");
for (let r = 6; r <= range.e.r; r++) {
  const sup = cellVal(t, r, 1);
  const prod = cellVal(t, r, 3);
  const gg = cellVal(t, r, 5);
  const ug = cellVal(t, r, 7);
  if (sup) suppliers.push(String(sup));
  if (prod) products.push(String(prod));
  if (gg) genelGiderler.push(String(gg));
  if (ug) urunGiderleri.push(String(ug));
}
console.log("\nTANIMLAMA:", { suppliers: suppliers.length, products: products.length, genelGiderler: genelGiderler.length, urunGiderleri: urunGiderleri.length });
console.log("Örnek tedarikçi:", suppliers.slice(0, 3));
console.log("Örnek ürün:", products.slice(0, 3));

// Unique customers from sales - column 2 is TEDARİKÇİ in sales but customers might be different
// Müşteri Rapor uses suppliers as "customers" for B2B
const customers = new Set<string>();
const s = wb.Sheets["Ürün Satış Giriş"];
const sr = XLSX.utils.decode_range(s["!ref"] || "A1");
for (let r = 3; r <= sr.e.r; r++) {
  const v = cellVal(s, r, 2);
  if (v) customers.add(String(v));
}
console.log("\nSatıştaki benzersiz tedarikçi/müşteri:", customers.size);
