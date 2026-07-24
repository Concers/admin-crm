// PDF helpers — build tabular PDFs with pdfmake using the bundled Roboto font
// (Turkish glyphs: ç ş ğ ı İ ö ü). Fonts live in backend/assets/fonts and are
// resolved relative to this module so dev (src) and build (dist) both work.

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
// pdfmake 0.2.x default export is the PdfPrinter constructor.
const PdfPrinter = require("pdfmake") as new (fonts: unknown) => {
  createPdfKitDocument: (def: unknown) => NodeJS.ReadableStream & { end: () => void };
};

const fontsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "assets", "fonts");
const printer = new PdfPrinter({
  Roboto: {
    normal: path.join(fontsDir, "Roboto-Regular.ttf"),
    bold: path.join(fontsDir, "Roboto-Medium.ttf"),
    italics: path.join(fontsDir, "Roboto-Italic.ttf"),
    bolditalics: path.join(fontsDir, "Roboto-MediumItalic.ttf"),
  },
});

type Row = Record<string, unknown>;

/** Render flat rows as a landscape table PDF and resolve to a Buffer. */
export function rowsToPdf(rows: Row[], title: string): Promise<Buffer> {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const body = [
    headers.map((h) => ({ text: h, bold: true, fillColor: "#f1f5f9" })),
    ...rows.map((r) =>
      headers.map((h) => {
        const v = r[h];
        return { text: v === null || v === undefined ? "" : String(v) };
      }),
    ),
  ];

  const docDefinition = {
    pageOrientation: "landscape" as const,
    pageMargins: [24, 32, 24, 32] as [number, number, number, number],
    content: [
      { text: title, bold: true, fontSize: 14, margin: [0, 0, 0, 8] as [number, number, number, number] },
      { text: `${rows.length} kayıt · ${new Date().toLocaleDateString("tr-TR")}`, fontSize: 8, color: "#64748b", margin: [0, 0, 0, 10] as [number, number, number, number] },
      headers.length
        ? { table: { headerRows: 1, body }, layout: "lightHorizontalLines" }
        : { text: "Kayıt yok.", italics: true },
    ],
    defaultStyle: { font: "Roboto", fontSize: 8 },
  };

  return new Promise((resolve, reject) => {
    try {
      const doc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
