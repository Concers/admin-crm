"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Hash,
  Link2,
  Trash2,
  Wallet,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import {
  MUTABAKAT_FATURA_PRIMARY_FILTER_KEYS,
  MUTABAKAT_ODEME_PRIMARY_FILTER_KEYS,
  MUTABAKAT_TAHSIS_PRIMARY_FILTER_KEYS,
} from "@/lib/table-primary-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, cn } from "@/lib/utils";
import type { Reconciliation } from "@/lib/api";
import { allocateTahsis, removeTahsis } from "./actions";
import {
  mapFaturaMutabakatRows,
  mapOdemeMutabakatRows,
  mapTahsisRows,
  type FaturaMutabakatRow,
  type OdemeMutabakatRow,
  type TahsisRow,
} from "./mutabakat-rows";

const INVOICE_STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-50 text-slate-700 ring-slate-200",
  ISSUED: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-100",
};

function DurumBadge({ durum, status }: { durum: string; status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
        INVOICE_STATUS_STYLES[status] ?? "bg-[var(--muted)] ring-[var(--border)]"
      )}
    >
      {durum}
    </span>
  );
}

function TurBadge({ tur, docType }: { tur: string; docType: string }) {
  const sales = docType === "SALES";
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
        sales
          ? "bg-blue-50 text-blue-700 ring-blue-100"
          : "bg-amber-50 text-amber-800 ring-amber-100"
      )}
    >
      {tur}
    </span>
  );
}

function FlowTurBadge({ tur, type }: { tur: string; type: string }) {
  const collection = type === "COLLECTION";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
        collection
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-rose-50 text-rose-700 ring-rose-100"
      )}
    >
      {collection ? (
        <ArrowDownLeft className="h-3 w-3" />
      ) : (
        <ArrowUpRight className="h-3 w-3" />
      )}
      {tur}
    </span>
  );
}

const FATURA_RENDERERS: Record<string, (row: FaturaMutabakatRow) => ReactNode> = {
  faturaNo: (r) => (
    <span className="inline-flex items-center gap-1 font-mono text-sm font-medium">
      <FileText className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
      {r.faturaNo}
    </span>
  ),
  tarih: (r) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.tarih}</span>
  ),
  tur: (r) => <TurBadge tur={r.tur} docType={r._docType} />,
  tutar: (r) => <span className="font-medium tabular-nums">{r.tutar}</span>,
  tahsis: (r) => <span className="tabular-nums text-[var(--muted-foreground)]">{r.tahsis}</span>,
  bakiye: (r) => (
    <span
      className={cn(
        "font-semibold tabular-nums",
        r._balance > 0.01 ? "text-amber-700" : "text-emerald-700"
      )}
    >
      {r.bakiye}
    </span>
  ),
  durum: (r) => <DurumBadge durum={r.durum} status={r._status} />,
};

const ODEME_RENDERERS: Record<string, (row: OdemeMutabakatRow) => ReactNode> = {
  tarih: (r) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.tarih}</span>
  ),
  tur: (r) => <FlowTurBadge tur={r.tur} type={r._type} />,
  tutar: (r) => <span className="font-medium tabular-nums">{r.tutar}</span>,
  dagitilan: (r) => (
    <span className="tabular-nums text-[var(--muted-foreground)]">{r.dagitilan}</span>
  ),
  kalan: (r) => (
    <span
      className={cn(
        "font-semibold tabular-nums",
        r._unallocated > 0.01 ? "text-indigo-700" : "text-emerald-700"
      )}
    >
      {r.kalan}
    </span>
  ),
};

export function ReconcileWorkspace({ data }: { data: Reconciliation }) {
  const { run, pending } = useActionToast();
  const faturaRows = useMemo(() => mapFaturaMutabakatRows(data.invoices), [data.invoices]);
  const odemeRows = useMemo(() => mapOdemeMutabakatRows(data.cashFlows), [data.cashFlows]);
  const tahsisRows = useMemo(
    () => mapTahsisRows(data.allocations, data.invoices, data.cashFlows),
    [data.allocations, data.invoices, data.cashFlows]
  );

  const openInvoices = data.invoices.filter((i) => i.balance > 0.01);
  const openFlows = data.cashFlows.filter((c) => c.unallocated > 0.01);

  const [invoiceId, setInvoiceId] = useState("");
  const [cashFlowId, setCashFlowId] = useState("");
  const [amount, setAmount] = useState("");

  const selInvoice = openInvoices.find((i) => String(i.id) === invoiceId);
  const selFlow = openFlows.find((c) => String(c.id) === cashFlowId);
  const suggested =
    selInvoice && selFlow ? Math.min(selInvoice.balance, selFlow.unallocated) : 0;

  const faturaColumns = useMemo(
    () =>
      ["faturaNo", "tarih", "tur", "tutar", "tahsis", "bakiye", "durum"].map((key) => ({
        key,
        label:
          key === "faturaNo"
            ? "Fatura"
            : key === "tahsis"
              ? "Tahsis"
              : key === "bakiye"
                ? "Bakiye"
                : key.charAt(0).toUpperCase() + key.slice(1),
        align: ["tutar", "tahsis", "bakiye"].includes(key) ? ("right" as const) : undefined,
        sortValue: (r: FaturaMutabakatRow) => {
          if (key === "tarih") return r._date;
          if (key === "tutar") return r._total;
          if (key === "tahsis") return r._allocated;
          if (key === "bakiye") return r._balance;
          return undefined;
        },
        render: FATURA_RENDERERS[key],
        filterValue: (r: FaturaMutabakatRow) =>
          key === "tur" ? r.tur : key === "durum" ? r.durum : String((r as Record<string, unknown>)[key] ?? ""),
      })),
    []
  );

  const odemeColumns = useMemo(
    () =>
      ["tarih", "tur", "tutar", "dagitilan", "kalan"].map((key) => ({
        key,
        label:
          key === "dagitilan"
            ? "Dağıtılan"
            : key === "kalan"
              ? "Kalan"
              : key.charAt(0).toUpperCase() + key.slice(1),
        align: ["tutar", "dagitilan", "kalan"].includes(key) ? ("right" as const) : undefined,
        sortValue: (r: OdemeMutabakatRow) => {
          if (key === "tarih") return r._date;
          if (key === "tutar") return r._amount;
          if (key === "dagitilan") return r._allocated;
          if (key === "kalan") return r._unallocated;
          return undefined;
        },
        render: ODEME_RENDERERS[key],
        filterValue: (r: OdemeMutabakatRow) => (key === "tur" ? r.tur : String((r as Record<string, unknown>)[key] ?? "")),
      })),
    []
  );

  const tahsisColumns = useMemo(
    () => [
      {
        key: "fatura",
        label: "Fatura",
        render: (r: TahsisRow) => (
          <span className="inline-flex items-center gap-1 font-mono text-sm">
            <Hash className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            {r.fatura}
          </span>
        ),
      },
      {
        key: "odeme",
        label: "Ödeme Tarihi",
        render: (r: TahsisRow) => (
          <span className="tabular-nums text-sm">{r.odeme}</span>
        ),
      },
      {
        key: "tutar",
        label: "Tutar",
        align: "right" as const,
        sortValue: (r: TahsisRow) => r._amount,
        render: (r: TahsisRow) => (
          <span className="font-semibold tabular-nums text-indigo-700">{r.tutar}</span>
        ),
      },
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: TahsisRow) => (
          <Button
            variant="ghost"
            size="icon"
            disabled={pending}
            title="Tahsis kaldır"
            aria-label="Tahsis kaldır"
            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              if (confirm(`"${row.fatura}" tahsisi kaldırılsın mı?`)) {
                run(() => removeTahsis(row.id), { success: "Tahsis kaldırıldı." });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [pending, run]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-[var(--card)] p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
            <Link2 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-semibold">Ödeme Tahsis Et</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Açık fatura ile dağıtılmamış ödemeyi eşleştirin
            </p>
          </div>
        </div>

        {openInvoices.length === 0 || openFlows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
            Eşleştirme için hem açık fatura hem de dağıtılmamış ödeme/tahsilat gerekir.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(async () => {
                const result = await allocateTahsis(fd);
                if (!result?.error) {
                  setInvoiceId("");
                  setCashFlowId("");
                  setAmount("");
                }
                return result;
              }, { success: "Tahsis edildi." });
            }}
            className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end"
          >
            <div className="lg:col-span-4">
              <Label htmlFor="invoiceId">Fatura</Label>
              <Select
                id="invoiceId"
                name="invoiceId"
                required
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
              >
                <option value="" disabled>
                  Seçin
                </option>
                {openInvoices.map((i) => (
                  <option key={i.id} value={i.id}>
                    {(i.number ?? `#${i.id}`)} · kalan {formatCurrency(i.balance)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="lg:col-span-3">
              <Label htmlFor="cashFlowId">Ödeme / Tahsilat</Label>
              <Select
                id="cashFlowId"
                name="cashFlowId"
                required
                value={cashFlowId}
                onChange={(e) => setCashFlowId(e.target.value)}
              >
                <option value="" disabled>
                  Seçin
                </option>
                {openFlows.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.type === "COLLECTION" ? "Tahsilat" : "Ödeme"} · kalan{" "}
                    {formatCurrency(c.unallocated)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="amount">Tutar</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                value={amount}
                placeholder={suggested ? suggested.toFixed(2) : "0,00"}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:col-span-3">
              <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                <Wallet className="h-4 w-4" />
                {pending ? "İşleniyor…" : "Tahsis Et"}
              </Button>
              {suggested > 0 && (
                <button
                  type="button"
                  className="text-sm font-medium text-indigo-600 hover:underline"
                  onClick={() => setAmount(suggested.toFixed(2))}
                >
                  Önerilen: {formatCurrency(suggested)}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Faturalar
        </h3>
        <DataTable
          rows={faturaRows}
          columns={faturaColumns}
          defaultSort={{ key: "tarih", asc: true }}
          searchKeys={["faturaNo", "tur", "durum"]}
          searchPlaceholder="Fatura no veya durum ara…"
          filterKeys={[...MUTABAKAT_FATURA_PRIMARY_FILTER_KEYS]}
          amountFilter={{
            defaultField: "bakiye",
            fields: [
              { id: "bakiye", label: "Bakiye", getValue: (r) => r._balance },
              { id: "tutar", label: "Tutar", getValue: (r) => r._total },
            ],
          }}
          emptyText="Bu cariye ait fatura yok"
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Ödemeler / Tahsilatlar
        </h3>
        <DataTable
          rows={odemeRows}
          columns={odemeColumns}
          defaultSort={{ key: "tarih", asc: true }}
          searchKeys={["tur", "tarih"]}
          searchPlaceholder="Tür veya tarih ara…"
          filterKeys={[...MUTABAKAT_ODEME_PRIMARY_FILTER_KEYS]}
          amountFilter={{
            defaultField: "kalan",
            fields: [
              { id: "kalan", label: "Kalan", getValue: (r) => r._unallocated },
              { id: "tutar", label: "Tutar", getValue: (r) => r._amount },
            ],
          }}
          emptyText="Bu cariye ait ödeme/tahsilat yok"
        />
      </section>

      {tahsisRows.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Mevcut Tahsisler
          </h3>
          <DataTable
            rows={tahsisRows}
            columns={tahsisColumns}
            defaultSort={{ key: "tutar", asc: false }}
            searchKeys={["fatura", "odeme"]}
            searchPlaceholder="Fatura veya ödeme ara…"
            filterKeys={[...MUTABAKAT_TAHSIS_PRIMARY_FILTER_KEYS]}
            emptyText="Henüz tahsis yok"
          />
        </section>
      )}
    </div>
  );
}