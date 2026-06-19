// =============================================================================
// Üretim reçetesi maliyet & tüketim analizi (analytics derivation)
//
// Pure, server-safe functions that turn the raw ERP reads (BOMs, products,
// purchases, production orders) into the structured shape the PowerBI-style
// dashboard renders. Costing mirrors the backend's live engine:
//
//   bileşen birim maliyeti  = ürünün satın alma geçmişinin ağırlıklı ortalaması
//                             (backend/src/lib/calculations weightedAveragePurchaseCost)
//   reçete birim maliyeti   = Σ (bileşen miktarı × bileşen birim maliyeti)
//   tüketim (ne kadar kull.) = üretim emirlerinden türetilir
//                             (emir miktarı × reçetedeki bileşen miktarı)
// =============================================================================

import type { BomDoc, Product, Purchase, ProductionOrderDoc } from "@/lib/api";

/** Tek bir reçete satırındaki bileşenin maliyet kalemi. */
export interface ComponentLine {
  componentProductId: number;
  name: string;
  quantity: number; // mamulün 1 birimi için gereken miktar
  unitCost: number; // ağırlıklı ortalama satın alma maliyeti
  lineCost: number; // quantity × unitCost
  sharePct: number; // bu kalemin reçete maliyetindeki payı (%)
}

/** Reçete (BOM) bazında maliyet + üretim özeti. */
export interface RecipeAnalysis {
  id: number;
  name: string;
  mamul: string; // mamul (bitmiş ürün) adı
  isActive: boolean;
  unitCost: number; // 1 birim mamulün bileşen maliyeti
  componentCount: number;
  lines: ComponentLine[];
  producedQty: number; // tamamlanan (DONE) emirlerden üretilen mamul miktarı
  plannedQty: number; // PLANNED + IN_PROGRESS emir miktarı
  producedCost: number; // producedQty × unitCost — fiilen harcanan bileşen maliyeti
  plannedCost: number; // plannedQty × unitCost — planlanan bileşen maliyeti
}

/** Bir bileşenin hangi reçetede nasıl kullanıldığı (ters arama). */
export interface ComponentRecipeRef {
  recipeId: number;
  recipeName: string;
  mamul: string; // bu reçetenin ürettiği mamul
  quantity: number; // mamulün 1 birimi için gereken miktar
  lineCost: number; // quantity × bileşen birim maliyeti
  sharePct: number; // bu bileşenin o reçetedeki maliyet payı (%)
  producedQty: number; // bu reçeteden üretilen mamul miktarı (DONE)
  consumedQty: number; // bu reçetede tüketilen bileşen miktarı (producedQty × quantity)
}

/** Bileşen (hammadde) bazında — tüm reçetelerdeki toplam tüketim. */
export interface ComponentUsage {
  componentProductId: number;
  name: string;
  unitCost: number;
  consumedQty: number; // DONE emirlerce tüketilen toplam miktar
  plannedQty: number; // PLANNED + IN_PROGRESS emirlerce planlanan miktar
  consumedCost: number; // consumedQty × unitCost
  usedInRecipes: number; // bu bileşeni içeren reçete sayısı
  recipes: ComponentRecipeRef[]; // hangi reçetelerde/ürünlerde kullanıldığı
}

export interface ReceteAnaliz {
  recipes: RecipeAnalysis[];
  components: ComponentUsage[];
  totals: {
    recipeCount: number;
    activeCount: number;
    totalUnitCost: number; // tüm reçetelerin birim maliyet toplamı
    avgUnitCost: number;
    totalConsumedCost: number; // üretimce fiilen harcanan bileşen maliyeti
    totalPlannedCost: number; // planlanan bileşen maliyeti
    pricedComponents: number; // satın alma geçmişi olan bileşen sayısı
    unpricedComponents: number; // maliyeti 0 olan (geçmişi olmayan) bileşen sayısı
  };
}

/** Ürünün satın alma geçmişinden ağırlıklı ortalama birim maliyet. */
function weightedAverageCost(purchases: { unitPrice: number; quantity: number }[]): number {
  if (purchases.length === 0) return 0;
  const totalQty = purchases.reduce((s, p) => s + p.quantity, 0);
  if (totalQty <= 0) return 0;
  const totalCost = purchases.reduce((s, p) => s + p.unitPrice * p.quantity, 0);
  return totalCost / totalQty;
}

export function buildReceteAnaliz(
  boms: BomDoc[],
  products: Product[],
  purchases: Purchase[],
  orders: ProductionOrderDoc[],
): ReceteAnaliz {
  const productName = new Map(products.map((p) => [p.id, p.name]));

  // Bileşen başına ağırlıklı ortalama birim maliyet.
  const purchasesByProduct = new Map<number, { unitPrice: number; quantity: number }[]>();
  for (const p of purchases) {
    const arr = purchasesByProduct.get(p.product.id) ?? [];
    arr.push({ unitPrice: p.unitPrice, quantity: p.quantity });
    purchasesByProduct.set(p.product.id, arr);
  }
  const unitCostOf = (productId: number) =>
    weightedAverageCost(purchasesByProduct.get(productId) ?? []);

  // Üretim emirlerini reçeteye göre grupla (yalnızca bomId'si olanlar tüketim üretir).
  const doneQtyByBom = new Map<number, number>();
  const plannedQtyByBom = new Map<number, number>();
  for (const o of orders) {
    if (o.bomId == null) continue;
    if (o.status === "DONE") {
      doneQtyByBom.set(o.bomId, (doneQtyByBom.get(o.bomId) ?? 0) + o.quantity);
    } else if (o.status === "PLANNED" || o.status === "IN_PROGRESS") {
      plannedQtyByBom.set(o.bomId, (plannedQtyByBom.get(o.bomId) ?? 0) + o.quantity);
    }
  }

  const recipes: RecipeAnalysis[] = boms.map((b) => {
    const rawLines = b.components.map((c) => {
      const unitCost = unitCostOf(c.componentProductId);
      return {
        componentProductId: c.componentProductId,
        name: productName.get(c.componentProductId) ?? `#${c.componentProductId}`,
        quantity: c.quantity,
        unitCost,
        lineCost: c.quantity * unitCost,
      };
    });
    const unitCost = rawLines.reduce((s, l) => s + l.lineCost, 0);
    const lines: ComponentLine[] = rawLines
      .map((l) => ({ ...l, sharePct: unitCost > 0 ? (l.lineCost / unitCost) * 100 : 0 }))
      .sort((a, b) => b.lineCost - a.lineCost);

    const producedQty = doneQtyByBom.get(b.id) ?? 0;
    const plannedQty = plannedQtyByBom.get(b.id) ?? 0;

    return {
      id: b.id,
      name: b.name,
      mamul: productName.get(b.productId) ?? `#${b.productId}`,
      isActive: b.isActive,
      unitCost,
      componentCount: b.components.length,
      lines,
      producedQty,
      plannedQty,
      producedCost: producedQty * unitCost,
      plannedCost: plannedQty * unitCost,
    };
  });

  // Bileşen tüketim toplayıcısı — bitmiş reçete kalemlerinden (sharePct dahil) türetilir.
  const usage = new Map<number, ComponentUsage>();
  const touchUsage = (pid: number): ComponentUsage => {
    let u = usage.get(pid);
    if (!u) {
      u = {
        componentProductId: pid,
        name: productName.get(pid) ?? `#${pid}`,
        unitCost: unitCostOf(pid),
        consumedQty: 0,
        plannedQty: 0,
        consumedCost: 0,
        usedInRecipes: 0,
        recipes: [],
      };
      usage.set(pid, u);
    }
    return u;
  };

  for (const r of recipes) {
    for (const l of r.lines) {
      const u = touchUsage(l.componentProductId);
      u.usedInRecipes += 1;
      u.consumedQty += r.producedQty * l.quantity;
      u.plannedQty += r.plannedQty * l.quantity;
      u.recipes.push({
        recipeId: r.id,
        recipeName: r.name,
        mamul: r.mamul,
        quantity: l.quantity,
        lineCost: l.lineCost,
        sharePct: l.sharePct,
        producedQty: r.producedQty,
        consumedQty: r.producedQty * l.quantity,
      });
    }
  }

  for (const u of usage.values()) {
    u.consumedCost = u.consumedQty * u.unitCost;
    u.recipes.sort((a, b) => b.lineCost - a.lineCost);
  }

  const components = [...usage.values()].sort((a, b) => {
    // Önce fiili tüketim maliyeti, o yoksa reçetelerdeki yaygınlık.
    if (b.consumedCost !== a.consumedCost) return b.consumedCost - a.consumedCost;
    return b.usedInRecipes - a.usedInRecipes;
  });

  const totalUnitCost = recipes.reduce((s, r) => s + r.unitCost, 0);
  const activeCount = recipes.filter((r) => r.isActive).length;
  const pricedComponents = components.filter((c) => c.unitCost > 0).length;

  return {
    recipes: recipes.sort((a, b) => b.unitCost - a.unitCost),
    components,
    totals: {
      recipeCount: recipes.length,
      activeCount,
      totalUnitCost,
      avgUnitCost: recipes.length > 0 ? totalUnitCost / recipes.length : 0,
      totalConsumedCost: recipes.reduce((s, r) => s + r.producedCost, 0),
      totalPlannedCost: recipes.reduce((s, r) => s + r.plannedCost, 0),
      pricedComponents,
      unpricedComponents: components.length - pricedComponents,
    },
  };
}
