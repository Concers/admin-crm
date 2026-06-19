import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(__dirname, "..", "..", "..", "Kadim Naturel dosyasının kopyası.xlsx");
const wb = XLSX.readFile(file, { cellDates: true });
const data = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets["Ürün Raporu"], {
  header: 1,
  defval: "",
});

const markers: { row: number; text: string; preview: string }[] = [];
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  const a = String(row[0] ?? "").trim();
  const b = String(row[1] ?? "").trim();
  const e = String(row[4] ?? "").trim();
  const text = a || b;
  if (
    text.includes("SATIŞ") ||
    text.includes("ALIM") ||
    text.includes("GİDER") ||
    text.includes("GIDER") ||
    text.includes("MALİYET") ||
    text.includes("KAR") ||
    text.includes("BİLGİ") ||
    text.includes("TARİH") ||
    text.includes("MÜŞTERİ") ||
    text.includes("LÜTFEN") ||
    (i < 5 && e)
  ) {
    markers.push({
      row: i + 1,
      text: text.slice(0, 60),
      preview: row
        .slice(0, 16)
        .map((v) => String(v).slice(0, 24))
        .join(" | "),
    });
  }
}

console.log("Total rows:", data.length);
console.log("\nMarkers (" + markers.length + "):");
for (const m of markers.slice(0, 80)) {
  console.log(`R${m.row} [${m.text}]`, m.preview);
}

// Sample sales header columns from first block
const header = data[9];
console.log("\nSales header (R10):", header?.slice(0, 20));

// Count non-empty data rows in first sales block (after header until blank section)
let salesRows = 0;
for (let i = 10; i < Math.min(data.length, 500); i++) {
  const row = data[i];
  const date = row[0] ?? row[1];
  if (!date && !row[2] && !row[3]) {
    if (salesRows > 0) break;
    continue;
  }
  if (String(row[1] ?? row[0] ?? "").includes("TARİH")) continue;
  if (date) salesRows++;
}
console.log("Sales rows in first block:", salesRows);

// Find all TARİH header rows = table starts
const tableStarts: number[] = [];
for (let i = 0; i < data.length; i++) {
  const h = String(data[i][1] ?? data[i][0] ?? "").trim();
  if (h === "TARİH") tableStarts.push(i + 1);
}
console.log("\nTARİH header rows:", tableStarts.length, tableStarts.slice(0, 10));
