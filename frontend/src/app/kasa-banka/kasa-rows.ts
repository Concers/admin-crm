import type { Account, AccountBalance, CashFlow } from "@/lib/api";
import { formatCurrency, formatCalendarDate } from "@/lib/utils";

export type HesapRow = {
  id: number;
  hesap: string;
  tur: string;
  paraBirimi: string;
  acilis: string;
  bakiye: string;
  _name: string;
  _type: string;
  _currency: string;
  _openingBalance: number;
  _balance: number;
};

export type KasaHareketRow = {
  id: number;
  tarih: string;
  tur: string;
  cari: string;
  hesap: string;
  tutar: string;
  notlar: string;
  _date: string;
  _type: string;
  _amount: number;
  _accountId: number | null;
  _accountName: string;
};

const TUR_LABEL: Record<string, string> = {
  CASH: "Kasa",
  BANK: "Banka",
  COLLECTION: "Tahsilat",
  PAYMENT: "Ödeme",
};

export function mapHesapRows(accounts: Account[], balances: AccountBalance[]): HesapRow[] {
  const balMap = new Map(balances.map((b) => [b.id, b.balance]));
  return accounts.map((a) => ({
    id: a.id,
    hesap: a.name,
    tur: TUR_LABEL[a.type] ?? a.type,
    paraBirimi: a.currency,
    acilis: formatCurrency(a.openingBalance),
    bakiye: formatCurrency(balMap.get(a.id) ?? a.openingBalance),
    _name: a.name,
    _type: a.type,
    _currency: a.currency,
    _openingBalance: a.openingBalance,
    _balance: balMap.get(a.id) ?? a.openingBalance,
  }));
}

export function mapKasaHareketRows(flows: CashFlow[]): KasaHareketRow[] {
  return flows.map((f) => ({
    id: f.id,
    tarih: formatCalendarDate(f.date),
    tur: TUR_LABEL[f.type] ?? f.type,
    cari: f.partner.name,
    hesap: f.account?.name ?? "—",
    tutar: formatCurrency(f.amount),
    notlar: f.notes?.trim() ?? "",
    _date: f.date,
    _type: f.type,
    _amount: f.amount,
    _accountId: f.accountId ?? f.account?.id ?? null,
    _accountName: f.account?.name ?? "",
  }));
}
