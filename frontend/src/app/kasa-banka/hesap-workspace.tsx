"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Wallet } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { deleteHesap } from "./actions";
import { HesapModal } from "./hesap-modal";
import type { HesapRow } from "./kasa-rows";

export function HesapWorkspace({ rows }: { rows: HesapRow[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<HesapRow | null>(null);

  const columns = useMemo(
    () => [
      {
        key: "hesap",
        label: "Hesap",
        render: (r: HesapRow) => (
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium">{r.hesap}</span>
          </div>
        ),
      },
      { key: "tur", label: "Tür" },
      { key: "paraBirimi", label: "PB" },
      { key: "acilis", label: "Açılış", align: "right" as const, sortValue: (r: HesapRow) => r._openingBalance },
      {
        key: "bakiye",
        label: "Güncel bakiye",
        align: "right" as const,
        sortValue: (r: HesapRow) => r._balance,
        render: (r: HesapRow) => (
          <span className={cn("font-semibold tabular-nums", r._balance >= 0 ? "text-emerald-800" : "text-rose-800")}>
            {r.bakiye}
          </span>
        ),
      },
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: HesapRow) => <HesapRowActions row={row} onEdit={() => setEditing(row)} />,
      },
    ],
    []
  );

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Hesap Ekle"
        hint="Kasa ve banka hesaplarını tanımlayın; tahsilat/ödemelerde seçilir."
        onAdd={() => setCreateOpen(true)}
      />
      <DataTable
        rows={rows}
        columns={columns}
        onRowClick={setEditing}
        defaultSort={{ key: "hesap", asc: true }}
        searchKeys={["hesap", "tur"]}
        searchPlaceholder="Hesap ara…"
        emptyText="Henüz hesap tanımlanmamış"
      />
      {createOpen && <HesapModal mode="create" onClose={() => setCreateOpen(false)} />}
      {editing && <HesapModal mode="edit" row={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function HesapRowActions({ row, onEdit }: { row: HesapRow; onEdit: () => void }) {
  const { run, pending } = useActionToast();
  return (
    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Düzenle">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        className="text-red-600 hover:bg-red-50"
        onClick={() => {
          if (confirm(`"${row.hesap}" hesabı silinsin mi?`)) {
            run(() => deleteHesap(row.id), { success: "Hesap silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function HesapFilter({
  accounts,
  selectedId,
}: {
  accounts: { id: number; name: string }[];
  selectedId?: number;
}) {
  const router = useRouter();
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Hesaba göre filtre
        </label>
        <Select
          className="h-10 min-w-[12rem] rounded-xl border-[var(--border)] bg-white text-sm"
          value={selectedId != null ? String(selectedId) : ""}
          onChange={(e) => {
            const v = e.target.value;
            router.push(v ? `/kasa-banka?hesap=${v}` : "/kasa-banka");
          }}
        >
          <option value="">Tüm hesaplar</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
