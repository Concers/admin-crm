"use client";

import { useMemo, useState } from "react";
import { Banknote, Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { Account, PaymentInstrument } from "@/lib/api";
import { removeInstrument } from "./actions";
import { CekSenetModal } from "./cek-senet-modal";

const STATUS_LABEL: Record<string, string> = {
  PORTFOLIO: "Portföyde",
  DEPOSITED: "Bankada",
  COLLECTED: "Tahsil",
  PAID: "Ödendi",
  BOUNCED: "Karşılıksız",
  CANCELLED: "İptal",
};

const TYPE_LABEL: Record<string, string> = {
  CHEQUE: "Çek",
  PROMISSORY_NOTE: "Senet",
};

type TableRow = {
  id: number;
  tur: string;
  yon: string;
  cari: string;
  no: string;
  tutar: string;
  vade: string;
  durum: string;
  _amount: number;
  _raw: PaymentInstrument;
};

export function CekSenetWorkspace({
  rows,
  partners,
  accounts,
}: {
  rows: PaymentInstrument[];
  partners: { name: string; type: string }[];
  accounts: Account[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentInstrument | null>(null);

  const tableRows: TableRow[] = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        tur: TYPE_LABEL[r.type] ?? r.type,
        yon: r.direction === "RECEIVABLE" ? "Alacak" : "Borç",
        cari: r.partner.name,
        no: r.number ?? "—",
        tutar: formatCurrency(r.amount),
        vade: r.dueDate.slice(0, 10),
        durum: STATUS_LABEL[r.status] ?? r.status,
        _amount: r.amount,
        _raw: r,
      })),
    [rows],
  );

  const portfolio = rows.filter((r) => r.status === "PORTFOLIO" || r.status === "DEPOSITED");
  const receivable = portfolio.filter((r) => r.direction === "RECEIVABLE").reduce((s, r) => s + r.amount, 0);
  const payable = portfolio.filter((r) => r.direction === "PAYABLE").reduce((s, r) => s + r.amount, 0);

  const columns = useMemo(
    () => [
      {
        key: "tur",
        label: "Tür",
        render: (row: TableRow) => (
          <span className="inline-flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            {row.tur}
          </span>
        ),
      },
      { key: "yon", label: "Yön" },
      { key: "cari", label: "Cari" },
      { key: "no", label: "No" },
      { key: "tutar", label: "Tutar", align: "right" as const, sortValue: (r: TableRow) => r._amount },
      { key: "vade", label: "Vade" },
      {
        key: "durum",
        label: "Durum",
        render: (row: TableRow) => {
          const s = row._raw.status;
          return (
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
                s === "BOUNCED"
                  ? "bg-rose-50 text-rose-700 ring-rose-100"
                  : s === "COLLECTED" || s === "PAID"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                    : "bg-amber-50 text-amber-800 ring-amber-100",
              )}
            >
              {row.durum}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: TableRow) => (
          <div className="flex gap-1">
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(row._raw)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={async () => {
                if (confirm("Silinsin mi?")) await removeInstrument(row._raw.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs uppercase text-[var(--muted-foreground)]">Portföy kayıt</p>
          <p className="text-2xl font-semibold">{portfolio.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="text-xs uppercase text-emerald-800/70">Alacak portföyü</p>
          <p className="text-lg font-semibold text-emerald-900">{formatCurrency(receivable)}</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
          <p className="text-xs uppercase text-rose-800/70">Borç portföyü</p>
          <p className="text-lg font-semibold text-rose-900">{formatCurrency(payable)}</p>
        </div>
      </div>

      <div className="mb-3 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Yeni kayıt
        </Button>
      </div>

      <DataTable
        rows={tableRows}
        columns={columns}
        defaultSort={{ key: "vade", asc: true }}
        searchKeys={["cari", "no", "tur", "durum"]}
        searchPlaceholder="Cari, belge no veya durum ara…"
        emptyText="Henüz çek/senet kaydı yok"
      />

      <CekSenetModal
        open={createOpen || !!editing}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        partners={partners}
        accounts={accounts}
        editing={editing}
      />
    </>
  );
}
