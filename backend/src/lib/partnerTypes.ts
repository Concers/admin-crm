import type { PartnerType } from "@prisma/client";

const MAP: Record<string, PartnerType> = {
  TEDARİKÇİ: "SUPPLIER",
  Tedarikçi: "SUPPLIER",
  SUPPLIER: "SUPPLIER",
  "HİZMET VEREN": "SERVICE_PROVIDER",
  "Hizmet Veren": "SERVICE_PROVIDER",
  SERVICE_PROVIDER: "SERVICE_PROVIDER",
  "EL PATRON": "OWNER",
  "El Patron": "OWNER",
  OWNER: "OWNER",
  MÜŞTERİ: "CUSTOMER",
  Müşteri: "CUSTOMER",
  CUSTOMER: "CUSTOMER",
};

export function normalizePartnerType(value: unknown): PartnerType {
  const key = String(value ?? "").trim();
  if (!key) return "OTHER";
  return MAP[key] ?? MAP[key.toLocaleUpperCase("tr")] ?? (key as PartnerType);
}
