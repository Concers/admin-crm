// =============================================================================
// Product unit-cost revision history — snapshot when costs shift materially.
// =============================================================================

import type { PrismaClient } from "@prisma/client";
import { computeSaleCosts } from "./costing.js";

const EPS = 0.01;

export async function recordProductCostSnapshot(
  prisma: PrismaClient,
  productId: number,
  reason: string,
  meta?: { sourceEntity?: string; sourceId?: number; notes?: string },
) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return;

  const cost = await computeSaleCosts(prisma, {
    productId,
    date: new Date(),
    quantity: 1,
    unitPrice: 1,
  });

  const last = await prisma.productCostHistory.findFirst({
    where: { productId },
    orderBy: { recordedAt: "desc" },
  });

  if (
    last &&
    Math.abs(last.purchaseUnitCost - cost.purchaseUnitCost) < EPS &&
    Math.abs(last.productionUnitCost - cost.productionUnitCost) < EPS &&
    Math.abs(last.overheadUnitCost - cost.overheadUnitCost) < EPS
  ) {
    return;
  }

  await prisma.productCostHistory.create({
    data: {
      productId,
      purchaseUnitCost: cost.purchaseUnitCost,
      productionUnitCost: cost.productionUnitCost,
      overheadUnitCost: cost.overheadUnitCost,
      totalUnitCost: cost.totalUnitCost,
      reason,
      sourceEntity: meta?.sourceEntity ?? null,
      sourceId: meta?.sourceId ?? null,
      notes: meta?.notes ?? null,
    },
  });
}
