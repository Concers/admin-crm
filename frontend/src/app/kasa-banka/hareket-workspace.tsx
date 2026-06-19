"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import { deleteKasaHareket, updateKasaHareket } from "./actions";
import type { KasaHareketRow } from "./kasa-rows";

export function KasaHareketWorkspace({
  rows,
  accounts,
}: {
  rows: KasaHareketRow[];
  accounts: { id: number; name: string }[];
}) {
  const [editing, setEditing] = useState<KasaHareketRow | null>(null);

  const columns = useMemo(
    () => [
      { key: "tarih", label: "Tarih", sortValue: (r: KasaHareketRow) => r._date },
      { key: "tur", label: "Tür", filterValue: (r: KasaHareketRow) => r.tur },
      { key: "cari", label: "Cari" },
      { key: "hesap", label: "Hesap", filterValue: (r: KasaHareketRow) => r.hesap },
      {
        key: "tutar",
        label: "Tutar",
        align: "right" as const,
        sortValue: (r: KasaHareketRow) => r._amount,
        render: (r: KasaHareketRow) => (
          <span
            className={
              r._type === "COLLECTION" ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"
            }
          >
            {r.tutar}
          </span>
        ),
      },
      { key: "notlar", label: "Notlar" },
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: KasaHareketRow) => (
          <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={() => setEditing(row)} aria-label="Düzenle">
              <Pencil className="h-4 w-4" />
            </Button>
            <HareketDeleteButton id={row.id} label={row.cari} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        rows={rows}
        columns={columns}
        onRowClick={setEditing}
        defaultSort={{ key: "tarih", asc: false }}
        searchKeys={["cari", "hesap", "notlar"]}
        searchPlaceholder="Cari, hesap veya not ara…"
        filterKeys={["tur", "hesap"]}
        amountFilter={{
          defaultField: "tutar",
          fields: [{ id: "tutar", label: "Tutar", getValue: (r: KasaHareketRow) => r._amount }],
        }}
        emptyText="Hareket yok"
      />
      {editing && (
        <HareketEditModal row={editing} accounts={accounts} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

function HareketDeleteButton({ id, label }: { id: number; label: string }) {
  const { run, pending } = useActionToast();
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      className="text-red-600 hover:bg-red-50"
      onClick={() => {
        if (confirm(`"${label}" hareketi silinsin mi?`)) {
          run(() => deleteKasaHareket(id), { success: "Hareket silindi." });
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

function HareketEditModal({
  row,
  accounts,
  onClose,
}: {
  row: KasaHareketRow;
  accounts: { id: number; name: string }[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();

  return (
    <FormModal
      title="Kasa / Banka Hareketini Düzenle"
      description="Tahsilat veya ödeme kaydını güncelleyin."
      onClose={onClose}
      pending={pending}
      submitLabel="Kaydet"
      maxWidth="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        run(async () => {
          const result = await updateKasaHareket(row.id, fd);
          if (!result?.error) onClose();
          return result;
        }, { success: "Hareket güncellendi." });
      }}
    >
      <FormSection title="Hareket">
        <input type="hidden" name="type" value={row._type} />
        <div>
          <Label htmlFor="edit-tarih">Tarih</Label>
          <Input id="edit-tarih" name="tarih" type="date" required defaultValue={toDateInputValue(row._date)} />
        </div>
        <div>
          <Label htmlFor="edit-cari">Cari</Label>
          <Input id="edit-cari" name="cari" required defaultValue={row.cari} />
        </div>
        <div>
          <Label htmlFor="edit-tutar">Tutar</Label>
          <Input id="edit-tutar" name="tutar" type="number" step="0.01" min="0" required defaultValue={String(row._amount)} />
        </div>
        <div>
          <Label htmlFor="edit-accountId">Hesap</Label>
          <Select id="edit-accountId" name="accountId" defaultValue={row._accountId ? String(row._accountId) : ""}>
            <option value="">— Seçilmedi —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="edit-notlar">Notlar</Label>
          <Textarea id="edit-notlar" name="notlar" rows={2} defaultValue={row.notlar} />
        </div>
      </FormSection>
      <p className="text-sm text-[var(--muted-foreground)]">
        Mevcut tutar: <span className="font-semibold">{formatCurrency(row._amount)}</span>
      </p>
    </FormModal>
  );
}
