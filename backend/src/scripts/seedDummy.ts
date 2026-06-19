// =============================================================================
// Seed DUMMY data for the newer ERP modules so the full UI can be tested.
//
//   npm run db:seed-dummy
//
// Touches ONLY the modules that are empty/sparse after the Excel import:
//   accounts, warehouses, contacts, stock movements, cashflows, orders,
//   quotes, invoices, payment allocations, delivery notes, returns, BOM,
//   production orders, price lists, discounts, attachments.
//
// It does NOT touch core data (partners, products, purchases, sales, expenses).
// Idempotent: clears the dummy-seedable tables first, then re-creates a fixed
// set of demo rows built on top of the REAL partners/products in the DB.
// =============================================================================

import { PrismaClient, type DocumentType } from "@prisma/client";

const prisma = new PrismaClient();

// Deterministic pseudo-random so reruns produce identical data.
let _seed = 12345;
const rnd = () => {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
  return _seed / 0x7fffffff;
};
const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const round2 = (n: number) => Math.round(n * 100) / 100;
/** Days-ago date relative to a fixed "today" (kept stable for reproducibility). */
const TODAY = new Date("2026-06-18T12:00:00.000Z");
const daysAgo = (d: number) => new Date(TODAY.getTime() - d * 86400000);

/** Compute header totals from line items (matches routes/documents.ts logic). */
function totals(lines: { quantity: number; unitPrice: number; vatRate: number }[]) {
  let totalAmount = 0;
  let vatIncludedAmount = 0;
  for (const l of lines) {
    const lineTotal = round2(l.quantity * l.unitPrice);
    totalAmount += lineTotal;
    vatIncludedAmount += lineTotal * (1 + l.vatRate);
  }
  return { totalAmount: round2(totalAmount), vatIncludedAmount: round2(vatIncludedAmount) };
}

async function main() {
  // -- Load real master data to build dummy documents on top of -------------
  const partners = await prisma.partner.findMany();
  const products = await prisma.product.findMany();
  if (partners.length === 0 || products.length === 0) {
    throw new Error("No partners/products found — run `npm run db:import` first.");
  }
  const customers = partners.filter((p) => p.type === "CUSTOMER");
  const suppliers = partners.filter((p) => p.type === "SUPPLIER");
  const anyCust = customers.length ? customers : partners;
  const anySupp = suppliers.length ? suppliers : partners;

  console.log(
    `Master data: ${partners.length} partners (${customers.length} cust / ${suppliers.length} supp), ${products.length} products`,
  );

  // -- Shelves (raf grid) — A–E koridorları × 01–12 -------------------------
  // Ürünlerin shelfLocation kodlarıyla uyumlu; Tanımlama ve Raf Takibi
  // ekranlarında boş raflar bu tanımlı raflardan türetilir. Idempotent: var
  // olan rafa dokunmaz, yalnızca eksikleri ekler.
  const shelfCodes = ["A", "B", "C", "D", "E"].flatMap((row) =>
    Array.from({ length: 12 }, (_, i) => ({ code: `${row}-${String(i + 1).padStart(2, "0")}`, location: `${row} Koridoru` })),
  );
  for (const s of shelfCodes) {
    await prisma.shelf.upsert({
      where: { code: s.code },
      update: {},
      create: { code: s.code, location: s.location, isActive: true },
    });
  }
  console.log(`Shelves: ${shelfCodes.length} raf (upsert)`);

  // -- Clear dummy-seedable tables (children first) -------------------------
  console.log("Clearing dummy-seedable tables…");
  await prisma.paymentAllocation.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.quoteLine.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.deliveryNoteLine.deleteMany();
  await prisma.bomComponent.deleteMany();
  await prisma.priceListItem.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.deliveryNote.deleteMany();
  await prisma.return.deleteMany();
  await prisma.bom.deleteMany();
  await prisma.priceList.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.cashFlow.deleteMany();
  await prisma.account.deleteMany();
  await prisma.warehouse.deleteMany();

  // -- Accounts (kasa / banka) ----------------------------------------------
  const accounts = await Promise.all(
    [
      { name: "Merkez Kasa (TL)", type: "CASH" as const, openingBalance: 50000 },
      { name: "Ziraat Bankası - Vadesiz", type: "BANK" as const, openingBalance: 250000 },
      { name: "İş Bankası - Ticari", type: "BANK" as const, openingBalance: 180000 },
      { name: "Döviz Kasa (USD)", type: "CASH" as const, currency: "USD", openingBalance: 5000 },
    ].map((a) => prisma.account.create({ data: a })),
  );
  console.log(`Accounts: ${accounts.length}`);

  // -- Warehouses -----------------------------------------------------------
  const warehouses = await Promise.all(
    [
      { name: "Merkez Depo", location: "İstanbul - Hadımköy" },
      { name: "Üretim Deposu", location: "İstanbul - Hadımköy (Üretim)" },
      { name: "Anadolu Depo", location: "Ankara - OSTİM" },
    ].map((w) => prisma.warehouse.create({ data: w })),
  );
  console.log(`Warehouses: ${warehouses.length}`);

  // -- Contacts (a couple per first ~8 partners) ----------------------------
  const titles = ["Satınalma Müdürü", "Muhasebe", "Genel Müdür", "Depo Sorumlusu", "Satış"];
  const firstNames = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Mustafa", "Zeynep", "Emre", "Elif"];
  let contactCount = 0;
  for (const p of partners.slice(0, 8)) {
    const n = 1 + Math.floor(rnd() * 2);
    for (let i = 0; i < n; i++) {
      await prisma.contact.create({
        data: {
          partnerId: p.id,
          name: `${pick(firstNames)} ${pick(["Yılmaz", "Demir", "Kaya", "Şahin", "Çelik"])}`,
          title: pick(titles),
          phone: `05${Math.floor(10 + rnd() * 89)} ${Math.floor(100 + rnd() * 899)} ${Math.floor(10 + rnd() * 89)} ${Math.floor(10 + rnd() * 89)}`,
          email: `iletisim${++contactCount}@${p.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) || "firma"}.com`,
        },
      });
    }
  }
  console.log(`Contacts: ${contactCount}`);

  // -- Stock movements (adjustment / transfer / waste) ----------------------
  const moveTypes = ["ADJUSTMENT", "TRANSFER", "WASTE", "IN"] as const;
  let moveCount = 0;
  for (let i = 0; i < 30; i++) {
    const prod = pick(products);
    const type = pick(moveTypes as unknown as string[]) as (typeof moveTypes)[number];
    const qty = round2((rnd() * 50 + 1) * (type === "WASTE" ? -1 : 1));
    await prisma.stockMovement.create({
      data: {
        date: daysAgo(Math.floor(rnd() * 180)),
        productId: prod.id,
        warehouseId: pick(warehouses).id,
        type,
        quantity: qty,
        reason:
          type === "ADJUSTMENT" ? "Sayım düzeltmesi" : type === "TRANSFER" ? "Depolar arası transfer" : type === "WASTE" ? "Fire/zayiat" : "Manuel giriş",
      },
    });
    moveCount++;
  }
  console.log(`Stock movements: ${moveCount}`);

  // -- Cash flows (payments / collections) ----------------------------------
  let cashCount = 0;
  for (let i = 0; i < 40; i++) {
    const isCollection = rnd() > 0.5;
    const partner = isCollection ? pick(anyCust) : pick(anySupp);
    await prisma.cashFlow.create({
      data: {
        date: daysAgo(Math.floor(rnd() * 200)),
        partnerId: partner.id,
        accountId: pick(accounts).id,
        type: isCollection ? "COLLECTION" : "PAYMENT",
        amount: round2(rnd() * 45000 + 1000),
        notes: isCollection ? "Müşteri tahsilatı" : "Tedarikçi ödemesi",
      },
    });
    cashCount++;
  }
  console.log(`Cash flows: ${cashCount}`);

  // -- Orders (sales & purchase) with lines ---------------------------------
  const orderStatuses = ["DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED"] as const;
  let orderCount = 0;
  for (let i = 0; i < 15; i++) {
    const docType: DocumentType = rnd() > 0.4 ? "SALES" : "PURCHASE";
    const partner = docType === "SALES" ? pick(anyCust) : pick(anySupp);
    const nLines = 1 + Math.floor(rnd() * 3);
    const lines = Array.from({ length: nLines }, () => {
      const prod = pick(products);
      return { productId: prod.id, quantity: round2(rnd() * 40 + 1), unitPrice: round2(rnd() * 300 + 20), vatRate: 0.2 };
    });
    const t = totals(lines);
    await prisma.order.create({
      data: {
        docType,
        partnerId: partner.id,
        date: daysAgo(Math.floor(rnd() * 120)),
        status: pick(orderStatuses as unknown as string[]) as (typeof orderStatuses)[number],
        totalAmount: t.totalAmount,
        vatIncludedAmount: t.vatIncludedAmount,
        notes: docType === "SALES" ? "Satış siparişi" : "Alım siparişi",
        lines: { create: lines.map((l) => ({ ...l, lineTotal: round2(l.quantity * l.unitPrice) })) },
      },
    });
    orderCount++;
  }
  console.log(`Orders: ${orderCount}`);

  // -- Quotes with lines ----------------------------------------------------
  const quoteStatuses = ["DRAFT", "SENT", "ACCEPTED", "REJECTED"] as const;
  let quoteCount = 0;
  for (let i = 0; i < 10; i++) {
    const partner = pick(anyCust);
    const nLines = 1 + Math.floor(rnd() * 3);
    const date = daysAgo(Math.floor(rnd() * 90));
    const lines = Array.from({ length: nLines }, () => {
      const prod = pick(products);
      return { productId: prod.id, quantity: round2(rnd() * 30 + 1), unitPrice: round2(rnd() * 250 + 30), vatRate: 0.2 };
    });
    const t = totals(lines);
    await prisma.quote.create({
      data: {
        partnerId: partner.id,
        date,
        validUntil: new Date(date.getTime() + 30 * 86400000),
        status: pick(quoteStatuses as unknown as string[]) as (typeof quoteStatuses)[number],
        totalAmount: t.totalAmount,
        vatIncludedAmount: t.vatIncludedAmount,
        notes: "Müşteri teklifi",
        lines: { create: lines.map((l) => ({ ...l, lineTotal: round2(l.quantity * l.unitPrice) })) },
      },
    });
    quoteCount++;
  }
  console.log(`Quotes: ${quoteCount}`);

  // -- Invoices with lines + payment allocations ----------------------------
  const invoiceStatuses = ["DRAFT", "ISSUED", "PAID", "CANCELLED"] as const;
  let invoiceCount = 0;
  let allocCount = 0;
  for (let i = 0; i < 18; i++) {
    const docType: DocumentType = rnd() > 0.35 ? "SALES" : "PURCHASE";
    const partner = docType === "SALES" ? pick(anyCust) : pick(anySupp);
    const nLines = 1 + Math.floor(rnd() * 3);
    const date = daysAgo(Math.floor(rnd() * 150));
    const status = pick(invoiceStatuses as unknown as string[]) as (typeof invoiceStatuses)[number];
    const lines = Array.from({ length: nLines }, () => {
      const prod = pick(products);
      return { productId: prod.id, quantity: round2(rnd() * 35 + 1), unitPrice: round2(rnd() * 280 + 25), vatRate: 0.2 };
    });
    const t = totals(lines);
    const invoice = await prisma.invoice.create({
      data: {
        docType,
        partnerId: partner.id,
        number: `${docType === "SALES" ? "SF" : "AF"}2026-${String(1000 + invoiceCount).padStart(4, "0")}`,
        date,
        dueDate: new Date(date.getTime() + 30 * 86400000),
        status,
        totalAmount: t.totalAmount,
        vatIncludedAmount: t.vatIncludedAmount,
        notes: docType === "SALES" ? "Satış faturası" : "Alım faturası",
        lines: { create: lines.map((l) => ({ ...l, lineTotal: round2(l.quantity * l.unitPrice) })) },
      },
    });
    invoiceCount++;

    // For some PAID/ISSUED invoices, create a matching cashflow + allocation.
    if (status === "PAID" || (status === "ISSUED" && rnd() > 0.5)) {
      const payFull = status === "PAID";
      const amount = round2(t.vatIncludedAmount * (payFull ? 1 : 0.4));
      const cf = await prisma.cashFlow.create({
        data: {
          date: new Date(date.getTime() + Math.floor(rnd() * 20) * 86400000),
          partnerId: partner.id,
          accountId: pick(accounts).id,
          type: docType === "SALES" ? "COLLECTION" : "PAYMENT",
          amount,
          notes: `${invoice.number} faturası ${payFull ? "tam" : "kısmi"} ödemesi`,
        },
      });
      await prisma.paymentAllocation.create({ data: { invoiceId: invoice.id, cashFlowId: cf.id, amount } });
      allocCount++;
    }
  }
  console.log(`Invoices: ${invoiceCount} (with ${allocCount} payment allocations)`);

  // -- Delivery notes with lines --------------------------------------------
  let dnCount = 0;
  for (let i = 0; i < 8; i++) {
    const docType: DocumentType = rnd() > 0.4 ? "SALES" : "PURCHASE";
    const partner = docType === "SALES" ? pick(anyCust) : pick(anySupp);
    const nLines = 1 + Math.floor(rnd() * 3);
    const lines = Array.from({ length: nLines }, () => ({ productId: pick(products).id, quantity: round2(rnd() * 25 + 1) }));
    await prisma.deliveryNote.create({
      data: {
        docType,
        partnerId: partner.id,
        date: daysAgo(Math.floor(rnd() * 100)),
        notes: docType === "SALES" ? "Sevk irsaliyesi" : "Mal kabul irsaliyesi",
        lines: { create: lines },
      },
    });
    dnCount++;
  }
  console.log(`Delivery notes: ${dnCount}`);

  // -- Returns --------------------------------------------------------------
  let returnCount = 0;
  for (let i = 0; i < 6; i++) {
    const isSales = rnd() > 0.4;
    const partner = isSales ? pick(anyCust) : pick(anySupp);
    const prod = pick(products);
    const qty = round2(rnd() * 10 + 1);
    await prisma.return.create({
      data: {
        type: isSales ? "SALES_RETURN" : "PURCHASE_RETURN",
        partnerId: partner.id,
        productId: prod.id,
        date: daysAgo(Math.floor(rnd() * 90)),
        quantity: qty,
        amount: round2(qty * (rnd() * 200 + 30)),
        reason: pick(["Hasarlı ürün", "Yanlış ürün", "Müşteri vazgeçti", "Son kullanma tarihi yakın", "Kalite sorunu"]),
      },
    });
    returnCount++;
  }
  console.log(`Returns: ${returnCount}`);

  // -- BOM (reçete) + components + production orders ------------------------
  // Treat first few products as finished goods, the rest as raw materials.
  const finished = products.slice(0, Math.min(5, products.length));
  const raws = products.slice(Math.min(5, products.length));
  let bomCount = 0;
  let prodOrderCount = 0;
  for (const fg of finished) {
    if (raws.length < 2) break;
    const nComp = 2 + Math.floor(rnd() * 3);
    const comps = Array.from({ length: nComp }, () => ({ componentProductId: pick(raws).id, quantity: round2(rnd() * 5 + 0.5) }));
    const bom = await prisma.bom.create({
      data: {
        productId: fg.id,
        name: `${fg.name} Reçetesi`,
        components: { create: comps },
      },
    });
    bomCount++;

    // 1-2 production orders per BOM
    const nOrders = 1 + Math.floor(rnd() * 2);
    for (let i = 0; i < nOrders; i++) {
      const start = daysAgo(Math.floor(rnd() * 60));
      const status = pick(["PLANNED", "IN_PROGRESS", "DONE"] as unknown as string[]) as "PLANNED" | "IN_PROGRESS" | "DONE";
      await prisma.productionOrder.create({
        data: {
          bomId: bom.id,
          productId: fg.id,
          quantity: round2(rnd() * 100 + 10),
          status,
          startDate: start,
          endDate: status === "DONE" ? new Date(start.getTime() + 5 * 86400000) : null,
          notes: "Üretim emri",
        },
      });
      prodOrderCount++;
    }
  }
  console.log(`BOMs: ${bomCount}, Production orders: ${prodOrderCount}`);

  // -- Price lists + items --------------------------------------------------
  const priceListDefs = [
    { name: "Bayi Fiyat Listesi 2026", factor: 0.85 },
    { name: "Perakende Fiyat Listesi 2026", factor: 1.0 },
    { name: "İhracat Fiyat Listesi (USD)", currency: "USD", factor: 0.03 },
  ];
  for (const def of priceListDefs) {
    await prisma.priceList.create({
      data: {
        name: def.name,
        currency: def.currency ?? "TRY",
        items: {
          create: products.slice(0, 20).map((p) => ({ productId: p.id, price: round2((rnd() * 300 + 50) * def.factor) })),
        },
      },
    });
  }
  console.log(`Price lists: ${priceListDefs.length} (20 items each)`);

  // -- Discounts ------------------------------------------------------------
  const discountDefs = [
    { name: "Yıl Sonu Kampanyası", percent: 15 },
    { name: "Toptan Alım İskontosu", percent: 10, partnerId: pick(anyCust).id },
    { name: "Ürün Bazlı İndirim", amount: 25, productId: pick(products).id },
    { name: "Yeni Müşteri İndirimi", percent: 5 },
  ];
  for (const d of discountDefs) {
    await prisma.discount.create({
      data: {
        name: d.name,
        percent: d.percent ?? null,
        amount: d.amount ?? null,
        partnerId: d.partnerId ?? null,
        productId: d.productId ?? null,
        validFrom: daysAgo(30),
        validTo: daysAgo(-60),
      },
    });
  }
  console.log(`Discounts: ${discountDefs.length}`);

  // -- Attachments (metadata only — dummy URLs) -----------------------------
  const attachDefs = [
    { entityName: "Invoice", entityId: 1, fileName: "fatura-SF2026-1000.pdf", mimeType: "application/pdf" },
    { entityName: "Order", entityId: 1, fileName: "siparis-formu.pdf", mimeType: "application/pdf" },
    { entityName: "Partner", entityId: partners[0].id, fileName: "vergi-levhasi.jpg", mimeType: "image/jpeg" },
    { entityName: "Product", entityId: products[0].id, fileName: "urun-spesifikasyon.xlsx", mimeType: "application/vnd.ms-excel" },
  ];
  for (const a of attachDefs) {
    await prisma.attachment.create({
      data: { ...a, url: `https://files.kadim.local/${a.fileName}`, size: Math.floor(rnd() * 500000 + 10000) },
    });
  }
  console.log(`Attachments: ${attachDefs.length}`);

  console.log("\n✅ Dummy data seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
