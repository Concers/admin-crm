"use client";

import { useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { STOK_HAREKET_RAPOR_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { HareketDokumTableRow, HareketYon } from "./hareket-dokum-rows";

const TUR_STYLES: Record<string, string> = {
  Alım: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Satış: "bg-rose-50 text-rose-700 ring-rose-100",
  Giriş: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Çıkış: "bg-rose-50 text-rose-700 ring-rose-100",
  Düzeltme: "bg-amber-50 text-amber-800 ring-amber-100",
  Transfer: "bg-blue-50 text-blue-700 ring-blue-100",
  Fire: "bg-slate-50 text-slate-700 ring-slate-200",
};

const YON_TONE: Record<HareketYon, "green" | "red"> = {
  Giriş: "green",
  Çıkış: "red",
};

function TurBadge({ tur, type }: { tur: string; type: string }) {
  const Icon =
    type === "ALIM" || type === "IN"
      ? ArrowDownLeft
      : type === "SATIŞ" || type === "OUT" || type === "WASTE"
        ? ArrowUpRight
        : ArrowLeftRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
        TUR_STYLES[tur] ?? "bg-[var(--muted)] text-[var(--foreground)] ring-[var(--border)]"
      )}
    >
      <Icon className="h-3 w-3" />
      {tur}
    </span>
  );
}

function qtyCell(value: string, amount: number, tone?: "emerald" | "rose" | "default") {
  if (amount <= 0 && value === "—") {
    return <span className="text-sm text-[var(--muted-foreground)]">—</span>;
  }
  const styles = {
    emerald: "font-semibold text-emerald-700",
    rose: "font-semibold text-rose-700",
    default: "font-medium tabular-nums text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

export function HareketDokumTable({ rows }: { rows: HareketDokumTableRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "tarih",
        label: "Tarih",
        sortValue: (r: HareketDokumTableRow) => r._date,
        filterValue: (r: HareketDokumTableRow) => r.tarih,
        render: (r: HareketDokumTableRow) => (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium tabular-nums">
            <Calendar className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            {r.tarih}
          </span>
        ),
      },
      {
        key: "tur",
        label: "Tür",
        sortValue: (r: HareketDokumTableRow) => r.tur,
        filterValue: (r: HareketDokumTableRow) => r.tur,
        render: (r: HareketDokumTableRow) => <TurBadge tur={r.tur} type={r._type} />,
      },
      {
        key: "yon",
        label: "Yön",
        sortValue: (r: HareketDokumTableRow) => r.yon,
        filterValue: (r: HareketDokumTableRow) => r.yon,
        render: (r: HareketDokumTableRow) => <Badge tone={YON_TONE[r.yon]}>{r.yon}</Badge>,
      },
      {
        key: "giris",
        label: "Giriş",
        align: "right" as const,
        sortValue: (r: HareketDokumTableRow) => r._in,
        filterValue: (r: HareketDokumTableRow) => r.giris,
        render: (r: HareketDokumTableRow) => qtyCell(r.giris, r._in, "emerald"),
      },
      {
        key: "cikis",
        label: "Çıkış",
        align: "right" as const,
        sortValue: (r: HareketDokumTableRow) => r._out,
        filterValue: (r: HareketDokumTableRow) => r.cikis,
        render: (r: HareketDokumTableRow) => qtyCell(r.cikis, r._out, "rose"),
      },
      {
        key: "bakiye",
        label: "Bakiye",
        align: "right" as const,
        sortValue: (r: HareketDokumTableRow) => r._balance,
        filterValue: (r: HareketDokumTableRow) => r.bakiye,
        render: (r: HareketDokumTableRow) => (
          <span
            className={cn(
              "font-semibold tabular-nums",
              r._balance < 0
                ? "text-rose-700"
                : r._balance === 0
                  ? "text-amber-800"
                  : "text-[var(--foreground)]"
            )}
          >
            {r.bakiye}
          </span>
        ),
      },
      {
        key: "neden",
        label: "Açıklama",
        sortValue: (r: HareketDokumTableRow) => r.neden,
        filterValue: (r: HareketDokumTableRow) => r.neden,
        render: (r: HareketDokumTableRow) =>
          r.neden === "—" ? (
            <span className="text-sm text-[var(--muted-foreground)]">—</span>
          ) : (
            <span className="line-clamp-2 max-w-[14rem] text-sm" title={r.neden}>
              {r.neden}
            </span>
          ),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "tarih", asc: false }}
      searchKeys={["tur", "neden", "yon", "tarih"]}
      searchPlaceholder="Tür, yön veya açıklama ara…"
      filterKeys={[...STOK_HAREKET_RAPOR_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "bakiye",
        fields: [
          { id: "bakiye", label: "Bakiye", getValue: (r: HareketDokumTableRow) => r._balance },
          { id: "giris", label: "Giriş", getValue: (r: HareketDokumTableRow) => r._in },
          { id: "cikis", label: "Çıkış", getValue: (r: HareketDokumTableRow) => r._out },
        ],
      }}
      emptyText="Bu ürün için stok hareketi bulunamadı"
      emptyHint="Alım, satış veya manuel stok hareketi ekledikten sonra döküm oluşur."
    />
  );
}
