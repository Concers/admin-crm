// Client-safe role types & labels (no server-only imports).

export type UserRole = "ADMIN" | "SALES_REP" | "WAREHOUSE_MANAGER";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Yönetici",
  SALES_REP: "Satış Temsilcisi",
  WAREHOUSE_MANAGER: "Depo Sorumlusu",
};
