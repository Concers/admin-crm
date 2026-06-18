import type {
  ReconAllocation,
  ReconCashFlow,
  ReconInvoice,
  ReconSummaryRow,
} from "@/lib/api";
import { formatCurrency, formatCalendarDate } from "@/lib/utils";

const INVOICE_STATUS: Record<string, string> = {
  DRAFT: "Taslak",
  ISSUED: "Kesildi",
  PAID: "Ödendi",
  CANCELLED: "İptal",
};

export function mapFaturaMutabakatRows(invoices: ReconInvoice[]) {
  return invoices.map((i) => ({
    id: i.id,
    faturaNo: i.number?.trim() || `#${i.id}`,
    tarih: formatCalendarDate(i.date),
    tur: i.docType === "SALES" ? "Satış" : "Alım",
    tutar: formatCurrency(i.total),
    tahsis: formatCurrency(i.allocated),
    bakiye: formatCurrency(i.balance),
    durum: INVOICE_STATUS[i.status] ?? i.status,
    _date: i.date,
    _docType: i.docType,
    _status: i.status,
    _total: i.total,
    _allocated: i.allocated,
    _balance: i.balance,
  }));
}

export type FaturaMutabakatRow = ReturnType<typeof mapFaturaMutabakatRows>[number];

export function mapOdemeMutabakatRows(cashFlows: ReconCashFlow[]) {
  return cashFlows.map((c) => ({
    id: c.id,
    tarih: formatCalendarDate(c.date),
    tur: c.type === "COLLECTION" ? "Tahsilat" : "Ödeme",
    tutar: formatCurrency(c.amount),
    dagitilan: formatCurrency(c.allocated),
    kalan: formatCurrency(c.unallocated),
    notlar: c.notes?.trim() || "",
    _date: c.date,
    _type: c.type,
    _amount: c.amount,
    _allocated: c.allocated,
    _unallocated: c.unallocated,
    _notes: c.notes ?? "",
  }));
}

export type OdemeMutabakatRow = ReturnType<typeof mapOdemeMutabakatRows>[number];

export function mapTahsisRows(
  allocations: ReconAllocation[],
  invoices: ReconInvoice[],
  cashFlows: ReconCashFlow[]
) {
  const invMap = new Map(invoices.map((i) => [i.id, i]));
  const flowMap = new Map(cashFlows.map((c) => [c.id, c]));

  return allocations.map((a) => {
    const inv = invMap.get(a.invoiceId);
    const flow = flowMap.get(a.cashFlowId);
    return {
      id: a.id,
      fatura: inv?.number?.trim() || `#${a.invoiceId}`,
      odeme: flow ? formatCalendarDate(flow.date) : `#${a.cashFlowId}`,
      tutar: formatCurrency(a.amount),
      _amount: a.amount,
      _invoiceId: a.invoiceId,
      _cashFlowId: a.cashFlowId,
    };
  });
}

export type TahsisRow = ReturnType<typeof mapTahsisRows>[number];

export function mapCariOzetRows(
  summary: ReconSummaryRow[],
  partners: { id: number; name: string }[]
) {
  const idByName = new Map(partners.map((p) => [p.name, p.id]));

  return summary.map((s) => ({
    id: idByName.get(s.name) ?? 0,
    cari: s.name,
    faturalanan: formatCurrency(s.invoiced),
    tahsis: formatCurrency(s.allocated),
    acikBakiye: formatCurrency(s.open),
    _invoiced: s.invoiced,
    _allocated: s.allocated,
    _open: s.open,
  }));
}

export type CariOzetRow = ReturnType<typeof mapCariOzetRows>[number];
