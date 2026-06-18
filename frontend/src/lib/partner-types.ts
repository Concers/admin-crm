import type { PartnerType } from "@/lib/api";

const TO_API: Record<string, PartnerType> = {
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

const TO_LABEL: Record<PartnerType, string> = {
  SUPPLIER: "Tedarikçi",
  SERVICE_PROVIDER: "Hizmet Veren",
  OWNER: "El Patron",
  CUSTOMER: "Müşteri",
  OTHER: "Diğer",
};

/** Form / Excel label → API enum */
export function toPartnerType(value: string): PartnerType {
  const key = value.trim();
  return TO_API[key] ?? TO_API[key.toLocaleUpperCase("tr")] ?? "OTHER";
}

/** API enum → Turkish UI label */
export function partnerTypeLabel(type: PartnerType | string): string {
  return TO_LABEL[type as PartnerType] ?? String(type);
}

export const PARTNER_TYPE_OPTIONS = [
  { value: "SUPPLIER", label: "Tedarikçi" },
  { value: "SERVICE_PROVIDER", label: "Hizmet Veren" },
  { value: "OWNER", label: "El Patron" },
] as const;
