"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  FileText,
  Hash,
  Wallet,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";
import type { CariOzetRow } from "./mutabakat-rows";

const CELL_RENDERERS: Record<string, (row: CariOzetRow) => ReactNode> = {
  cari: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
        <Building2 className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.cari}</span>
    </div>
  ),
  faturalanan: (r) => <span className="tabular-nums">{r.faturalanan}</span>,
  tahsis: (r) => <span className="tabular-nums text-[var(--muted-foreground)]">{r.tahsis}</span>,
  acikBakiye: (r) => (
    <span
      className={cn(
        "font-semibold tabular-nums",
        r._open > 0.01 ? "text-amber-700" : "text-emerald-700"
      )}
    >
      {r.acikBakiye}
    </span>
  ),
};

export function SummaryWorkspace({ rows }: { rows: CariOzetRow[] }) {
  const columns = useMemo(
    () => [
      { key: "cari", label: "Cari", render: CELL_RENDERERS.cari },
      {
        key: "faturalanan",
        label: "Faturalanan",
        align: "right" as const,
        sortValue: (r: CariOzetRow) => r._invoiced,
        render: CELL_RENDERERS.faturalanan,
      },
      {
        key: "tahsis",
        label: "Tahsis Edilen",
        align: "right" as const,
        sortValue: (r: CariOzetRow) => r._allocated,
        render: CELL_RENDERERS.tahsis,
      },
      {
        key: "acikBakiye",
        label: "Açık Bakiye",
        align: "right" as const,
        sortValue: (r: CariOzetRow) => r._open,
        render: CELL_RENDERERS.acikBakiye,
      },
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: CariOzetRow) =>
          row.id > 0 ? (
            <Link
              href={`/mutabakat?partnerId=${row.id}`}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-medium hover:bg-[var(--muted)]"
            >
              Mutabakat
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null,
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      defaultSort={{ key: "acikBakiye", asc: false }}
      searchKeys={["cari"]}
      searchPlaceholder="Cari ara…"
      amountFilter={{
        defaultField: "acik",
        fields: [{ id: "acik", label: "Açık Bakiye", getValue: (r) => r._open }],
      }}
      columns={columns}
      emptyText="Faturalanan cari bulunamadı"
      emptyHint="Fatura kaydı olan cariler burada listelenir."
    />
  );
}

export function PartnerPickerHint() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm text-indigo-950">
      <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
      <p>
        Aşağıdaki listeden bir cari seçerek mutabakat ekranına geçebilir veya üstten
        doğrudan cari arayabilirsiniz.
      </p>
    </div>
  );
}

export function EmptyPartnerIcon() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
        <FileText className="h-6 w-6" />
      </span>
      <p className="text-sm font-medium">Mutabakat için cari seçin</p>
      <p className="max-w-sm text-sm text-[var(--muted-foreground)]">
        Yukarıdan bir cari seçip &quot;Getir&quot; ile açık faturaları ve ödemeleri görüntüleyin.
      </p>
    </div>
  );
}
