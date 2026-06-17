"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, formatDate } from "@/lib/calculations";
import type { Reconciliation, ReconInvoice, ReconCashFlow } from "@/lib/api";
import { allocateAction, removeAllocationAction } from "./actions";

const STATUS: Record<string, string> = { DRAFT: "Taslak", ISSUED: "Kesildi", PAID: "Ödendi", CANCELLED: "İptal" };

export function ReconcilePanel({ data }: { data: Reconciliation }) {
  const { run, pending } = useActionToast();
  const openInvoices = data.invoices.filter((i) => i.balance > 0.01);
  const openFlows = data.cashFlows.filter((c) => c.unallocated > 0.01);

  const [invoiceId, setInvoiceId] = useState<string>("");
  const [cashFlowId, setCashFlowId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const selInvoice = openInvoices.find((i) => String(i.id) === invoiceId);
  const selFlow = openFlows.find((c) => String(c.id) === cashFlowId);
  // Suggest the largest amount that fits both sides.
  const suggested = selInvoice && selFlow ? Math.min(selInvoice.balance, selFlow.unallocated) : 0;

  return (
    <div className="space-y-6">
      {/* Allocation form */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h3 className="mb-4 font-semibold">Ödeme Tahsis Et</h3>
        {openInvoices.length === 0 || openFlows.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Eşleştirme için hem açık fatura hem de dağıtılmamış ödeme gerekir.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(() => allocateAction(fd), { success: "Tahsis edildi." });
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-4"
          >
            <div className="sm:col-span-2">
              <Label htmlFor="invoiceId">Fatura</Label>
              <Select id="invoiceId" name="invoiceId" required value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
                <option value="" disabled>Seçin</option>
                {openInvoices.map((i) => (
                  <option key={i.id} value={i.id}>
                    {(i.number ?? `#${i.id}`)} · {formatDate(new Date(i.date))} · kalan {formatCurrency(i.balance)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="cashFlowId">Ödeme</Label>
              <Select id="cashFlowId" name="cashFlowId" required value={cashFlowId} onChange={(e) => setCashFlowId(e.target.value)}>
                <option value="" disabled>Seçin</option>
                {openFlows.map((c) => (
                  <option key={c.id} value={c.id}>
                    {formatDate(new Date(c.date))} · kalan {formatCurrency(c.unallocated)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Tutar</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                value={amount}
                placeholder={suggested ? suggested.toFixed(2) : ""}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="sm:col-span-4 flex items-center gap-3">
              <Button type="submit" disabled={pending}>{pending ? "İşleniyor…" : "Tahsis Et"}</Button>
              {suggested > 0 && (
                <button type="button" className="text-sm text-[var(--primary)] hover:underline" onClick={() => setAmount(suggested.toFixed(2))}>
                  Önerilen: {formatCurrency(suggested)}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Invoices */}
      <div>
        <h3 className="mb-2 font-semibold">Faturalar</h3>
        <Table
          empty="Fatura yok."
          headers={["Fatura", "Tarih", "Tür", "Tutar", "Tahsis", "Bakiye", "Durum"]}
          rows={data.invoices.map((i: ReconInvoice) => [
            i.number ?? `#${i.id}`,
            formatDate(new Date(i.date)),
            i.docType === "SALES" ? "Satış" : "Alım",
            formatCurrency(i.total),
            formatCurrency(i.allocated),
            formatCurrency(i.balance),
            STATUS[i.status] ?? i.status,
          ])}
        />
      </div>

      {/* Cash flows */}
      <div>
        <h3 className="mb-2 font-semibold">Ödemeler / Tahsilatlar</h3>
        <Table
          empty="Hareket yok."
          headers={["Tarih", "Tür", "Tutar", "Dağıtılan", "Kalan"]}
          rows={data.cashFlows.map((c: ReconCashFlow) => [
            formatDate(new Date(c.date)),
            c.type === "COLLECTION" ? "Tahsilat" : "Ödeme",
            formatCurrency(c.amount),
            formatCurrency(c.allocated),
            formatCurrency(c.unallocated),
          ])}
        />
      </div>

      {/* Existing allocations */}
      {data.allocations.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">Mevcut Tahsisler</h3>
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] text-left text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-2">Fatura</th>
                  <th className="px-4 py-2">Ödeme</th>
                  <th className="px-4 py-2">Tutar</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data.allocations.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-2">#{a.invoiceId}</td>
                    <td className="px-4 py-2">#{a.cashFlowId}</td>
                    <td className="px-4 py-2">{formatCurrency(a.amount)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="inline-flex items-center gap-1 text-red-600 hover:underline"
                        onClick={() => run(() => removeAllocationAction(a.id), { success: "Tahsis kaldırıldı." })}
                      >
                        <Trash2 className="h-4 w-4" /> Kaldır
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Table({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-[var(--muted-foreground)]">{empty}</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--muted)] text-left text-[var(--muted-foreground)]">
          <tr>{headers.map((h) => <th key={h} className="px-4 py-2">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className="px-4 py-2">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
