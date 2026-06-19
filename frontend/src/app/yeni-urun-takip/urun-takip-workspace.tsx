"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  Minus,
  PackageSearch,
  Pencil,
  StickyNote,
  Trash2,
  Truck,
  XCircle,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { URUN_TAKIP_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  URUN_TAKIP_TABLE_COLUMNS,
  isBoolColumn,
} from "@/lib/urun-takip-fields";
import { deleteUrunTakip } from "./actions";
import { UrunTakipModal } from "./urun-takip-modal";
import type { UrunTakipTableRow } from "./urun-takip-rows";

export type UrunTakipRow = UrunTakipTableRow;

function BoolBadge({ value }: { value: string }) {
  const v = value.trim().toLowerCase();
  if (value === "—" || !v) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
        <Minus className="h-3 w-3" />
        —
      </span>
    );
  }
  if (["evet", "yes", "true", "1", "x", "✓", "tamam", "ok"].includes(v)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
        <CheckCircle2 className="h-3 w-3 shrink-0" />
        Evet
      </span>
    );
  }
  if (["hayır", "hayir", "no", "false", "0"].includes(v)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
        <XCircle className="h-3 w-3 shrink-0" />
        Hayır
      </span>
    );
  }
  return <span className="text-xs">{value}</span>;
}

function defaultCell(value: string, key: string): ReactNode {
  if (value === "—") {
    return <span className="text-xs text-[var(--muted-foreground)]">—</span>;
  }
  if (isBoolColumn(key)) {
    return <BoolBadge value={value} />;
  }
  if (key.includes("Ucreti") || key.includes("Maliyeti")) {
    return <span className="whitespace-nowrap text-xs font-medium tabular-nums">{value}</span>;
  }
  if (key.includes("Tarih") || key === "baslangic" || key.includes("Vade") || key.includes("Tahmini")) {
    return <span className="whitespace-nowrap text-xs tabular-nums">{value}</span>;
  }
  return (
    <span className="block max-w-[9rem] truncate text-xs" title={value}>
      {value}
    </span>
  );
}

const SPECIAL_RENDERERS: Record<string, (row: UrunTakipTableRow) => ReactNode> = {
  urunAdi: (r) => (
    <div className="flex min-w-0 max-w-[11rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-100">
        <PackageSearch className="h-3.5 w-3.5" />
      </span>
      <span className="truncate text-sm font-medium">{r.urunAdi}</span>
    </div>
  ),
  tedarikci: (r) =>
    r.tedarikci !== "—" ? (
      <span className="inline-flex max-w-[9rem] items-center gap-1 truncate text-xs">
        <Truck className="h-3 w-3 shrink-0 text-[var(--muted-foreground)]" />
        {r.tedarikci}
      </span>
    ) : (
      defaultCell("—", "tedarikci")
    ),
  webYuklemeTarihi: (r) =>
    r.webYuklemeTarihi && r.webYuklemeTarihi !== "—" ? (
      <span className="inline-flex max-w-[10rem] items-center gap-1 truncate text-xs text-[var(--muted-foreground)]" title={String(r.webYuklemeTarihi)}>
        <StickyNote className="h-3 w-3 shrink-0" />
        {String(r.webYuklemeTarihi)}
      </span>
    ) : (
      defaultCell("—", "webYuklemeTarihi")
    ),
};

export function UrunTakipWorkspace({
  rows,
  tedarikciler,
}: {
  rows: UrunTakipTableRow[];
  tedarikciler: string[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UrunTakipTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Ürün Takibi Ekle"
        hint="Excel’deki 50 süreç satırının tamamı tabloda — kaydırarak görebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <UrunTakipList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <UrunTakipModal
          mode="create"
          tedarikciler={tedarikciler}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editing && (
        <UrunTakipModal
          mode="edit"
          row={editing}
          tedarikciler={tedarikciler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function UrunTakipList({
  rows,
  onEdit,
}: {
  rows: UrunTakipTableRow[];
  onEdit: (row: UrunTakipTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...URUN_TAKIP_TABLE_COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "baslangic"
            ? (r: UrunTakipTableRow) => r._startDate ?? ""
            : col.key === "urunAdi"
              ? (r: UrunTakipTableRow) => r.urunAdi
              : undefined,
        render: (row: UrunTakipTableRow) => {
          const special = SPECIAL_RENDERERS[col.key];
          if (special) return special(row);
          const value = String((row as Record<string, unknown>)[col.key] ?? "—");
          return defaultCell(value, col.key);
        },
        filterValue: (r: UrunTakipTableRow) =>
          String((r as Record<string, unknown>)[col.key] ?? ""),
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: UrunTakipTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "urunAdi", asc: true }}
      searchKeys={["urunAdi", "tedarikci", "sinif", "ureticiKim", "hangiAnaliz"]}
      searchPlaceholder="Ürün, tedarikçi veya analiz ara…"
      filterKeys={[...URUN_TAKIP_PRIMARY_FILTER_KEYS]}
      columns={columns}
      minTableWidth="5200px"
      emptyText="Henüz ürün takip kaydı yok"
      emptyHint="Excel’den içe aktarın veya yeni kayıt ekleyin."
    />
  );
}

function RowActions({ row, onEdit }: { row: UrunTakipTableRow; onEdit: () => void }) {
  const { run, pending } = useActionToast();
  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        title="Düzenle"
        aria-label="Düzenle"
        className="h-8 w-8"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        title="Sil"
        aria-label="Sil"
        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => {
          if (confirm(`"${row.urunAdi}" takip kaydı silinsin mi?`)) {
            run(() => deleteUrunTakip(row.id), { success: "Ürün takibi silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
