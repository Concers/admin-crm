"use server";

import { getPartners, getProducts, getTcmbRate, resolvePrice } from "@/lib/api";

export async function lookupUnitPrice(partnerName: string, productName: string): Promise<number | null> {
  const name = partnerName.trim();
  const product = productName.trim();
  if (!name || !product) return null;

  const [partners, products] = await Promise.all([getPartners(), getProducts()]);
  const partner = partners.find((p) => p.name === name);
  const prod = products.find((p) => p.name === product);
  if (!partner || !prod) return null;

  try {
    const result = await resolvePrice(partner.id, prod.id);
    return result.price;
  } catch {
    return null;
  }
}

export async function lookupTcmbRate(currency: string): Promise<number | null> {
  const code = currency.trim().toUpperCase();
  if (!code || code === "TRY") return 1;
  try {
    const r = await getTcmbRate(code);
    return r.forexSelling ?? r.forexBuying ?? null;
  } catch {
    return null;
  }
}
