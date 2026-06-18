"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Package,
  StickyNote,
  Warehouse,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { cn } from "@/lib/utils";
import { HareketModal } from "./hareket-modal";
import type { HareketTableRow } from "./hareket-rows";

const TUR_STYLES: Record<string, string> = {
  Giriş: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Çıkış: "bg-rose-50 text-rose-700 ring-rose-100",
  Düzeltme: "bg-amber-50 text-amber-800 ring-amber-100",
  Transfer: "bg-blue-50 text-blue-700 ring-blue-100",
  Fire: "bg-slate-50 text-slate-700 ring-slate-200",
};

const COLUMNS = [
  { key: "tarih", label: "Tarih" },
  { key: "urun", label: "Ürün" },
  { key: "tur", label: "Tür" },
  { key: "depo", label: "Depo" },
  { key: "miktar", label: "Miktar" },
  { key: "aciklama", label: "Açıklama" },
  { key: "notlar", label: "Notlar" },
] as const;

function TurBadge({ tur, type }: { tur: string; type: string }) {
  const Icon =
    type === "IN"
      ? ArrowDownLeft
      : type === "OUT" || type === "WASTE"
        ? ArrowUpRight
        : ArrowLeftRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
        TUR_STYLES[tur] ?? "bg-[var(--muted)] ring-[var(--border)]"
      )}
    >
      <Icon className="h-3 w-3" />
      {tur}
    </span>
  );
}

const CELL_RENDERERS: Record<string, (row: HareketTableRow) => ReactNode> = {
  tarih: (r) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.tarih}</span>
  ),
  urun: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
        <Package className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.urun}</span>
    </div>
  ),
  tur: (r) => <TurBadge tur={r.tur} type={r._type} />,
  depo: (r) =>
    r.depo !== "—" ? (
      <span className="inline-flex max-w-[10rem] items-center gap-1 truncate text-sm">
        <Warehouse className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        {r.depo}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  miktar: (r) => (
    <span
      className={cn(
        "inline-flex min-w-[3rem] justify-end rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
        r._signedQuantity < 0
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      )}
    >
      {r.miktar}
    </span>
  ),
  aciklama: (r) =>
    r.aciklama ? (
      <span className="max-w-[180px] truncate text-sm" title={r.aciklama}>
        {r.aciklama}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  notlar: (r) =>
    r.notlar ? (
      <span
        className="inline-flex max-w-[160px] items-center gap-1 truncate text-sm text-[var(--muted-foreground)]"
        title={r.notlar}
      >
        <StickyNote className="h-3.5 w-3.5 shrink-0" />
        {r.notlar}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
};

export function HareketWorkspace({
  rows,
  urunler,
  depolar,
}: {
  rows: HareketTableRow[];
  urunler: string[];
  depolar: { id: number; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);

  const columns = useMemo(
    () =>
      COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "tarih"
            ? (r: HareketTableRow) => r._date
            : col.key === "miktar"
              ? (r: HareketTableRow) => r._signedQuantity
              : undefined,
        align: col.key === "miktar" ? ("right" as const) : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: HareketTableRow) => {
          if (col.key === "urun") return r.urun;
          if (col.key === "tur") return r.tur;
          if (col.key === "depo") return r.depo;
          if (col.key === "aciklama") return r.aciklama;
          if (col.key === "notlar") return r.notlar;
          return String((r as Record<string, unknown>)[col.key] ?? "");
        },
      })),
    []
  );

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Hareket Ekle"
        hint="Stok giriş, çıkış, transfer ve düzeltme kayıtlarını buradan ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <DataTable
        rows={rows}
        searchKeys={["urun", "tur", "depo", "aciklama", "notlar", "tarih"]}
        searchPlaceholder="Ürün, depo veya açıklama ara…"
        defaultSort={{ key: "tarih", asc: false }}
        amountFilter={{
          defaultField: "miktar",
          fields: [
            {
              id: "miktar",
              label: "Miktar",
              getValue: (r) => Math.abs(r._quantity),
            },
          ],
        }}
        columns={columns}
        emptyText="Henüz stok hareketi yok"
        emptyHint="Yukarıdaki butonla ilk hareketi ekleyebilirsiniz."
      />
      {createOpen && (
        <HareketModal urunler={urunler} depolar={depolar} onClose={() => setCreateOpen(false)} />
      )}
    </>
  );
}
