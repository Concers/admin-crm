import * as path from "path";
import { createRequire } from "node:module";
import type * as XLSXType from "xlsx";

const require = createRequire(import.meta.url);
const XLSX: typeof XLSXType = require("xlsx");

const targetSheets = process.argv.slice(2);
const file = path.resolve(process.cwd(), "..", "Kadim Naturel dosyasının kopyası.xlsx");

const wb = XLSX.readFile(file, { cellDates: true, sheets: targetSheets, cellFormula: true });
for (const name of targetSheets) {
  const s = wb.Sheets[name];
  if (!s) {
    console.log(`Missing sheet: ${name}`);
    continue;
  }
  const data = XLSX.utils.sheet_to_json<(string | number | Date)[]>(s, {
    header: 1,
    defval: "",
  });
  console.log(`\n=== ${name} (${data.length} rows) ===`);
  data.slice(0, 45).forEach((row, i) => {
    if (row.some((v) => v !== "" && v != null)) {
      console.log(
        `R${i + 1}`,
        row
          .slice(0, 14)
          .map((v) => String(v).slice(0, 40))
          .join(" | ")
      );
    }
  });
}
