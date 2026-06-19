"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Pencil, Trash2, Users } from "lucide-react";
import { DataTable } from "@/components/data-table";
import {
  CARI_TANIM_PRIMARY_FILTER_KEYS,
  URUN_TANIM_PRIMARY_FILTER_KEYS,
} from "@/lib/table-primary-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { createKisi, deleteKisi, loadPartnerContacts, updateKisi } from "./actions";
import { KisiModal } from "./kisi-modal";
import { PARTNER_TYPE_OPTIONS, partnerTypeLabel } from "@/lib/partner-types";
import type { PartnerType } from "@/lib/api";

const TIP_BADGE: Record<string, string> = {
  SUPPLIER: "bg-blue-50 text-blue-700 ring-blue-100",
  SERVICE_PROVIDER: "bg-violet-50 text-violet-700 ring-violet-100",
  OWNER: "bg-amber-50 text-amber-700 ring-amber-100",
  CUSTOMER: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  OTHER: "bg-[var(--muted)] text-[var(--muted-foreground)] ring-[var(--border)]",
};

function TipBadge({ tip }: { tip: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1",
        TIP_BADGE[tip] ?? TIP_BADGE.OTHER
      )}
    >
      {partnerTypeLabel(tip)}
    </span>
  );
}

function RowActions({
  onEdit,
  onDelete,
  disabled,
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={onEdit}
        title="Düzenle"
        aria-label="Düzenle"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={onDelete}
        title="Sil"
        aria-label="Sil"
        className="text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

type TedarikciRow = { id: number; tip: PartnerType; ad: string; priceTier: string };

export function TedarikciList({
  rows,
  onUpdate,
  onDelete,
}: {
  rows: TedarikciRow[];
  onUpdate: (id: number, fd: FormData) => Promise<{ error?: string } | void>;
  onDelete: (id: number) => Promise<{ error?: string } | void>;
}) {
  const [editing, setEditing] = useState<TedarikciRow | null>(null);
  const [kisiPartner, setKisiPartner] = useState<TedarikciRow | null>(null);
  const { run, pending } = useActionToast();

  const tableRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        tipLabel: partnerTypeLabel(r.tip),
      })),
    [rows]
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    run(
      async () => {
        await onUpdate(editing.id, fd);
        setEditing(null);
      },
      { success: "Kayıt güncellendi." }
    );
  }

  return (
    <>
      <DataTable
        rows={tableRows}
        onRowClick={(row) => setEditing(row)}
        defaultSort={{ key: "ad", asc: true }}
        searchKeys={["ad", "tipLabel"]}
        searchPlaceholder="Cari adı veya tip ara…"
        filterKeys={[...CARI_TANIM_PRIMARY_FILTER_KEYS]}
        emptyText="Henüz cari eklenmemiş"
        emptyHint="Yukarıdaki butonla yeni cari ekleyebilirsiniz."
        columns={[
          {
            key: "tipLabel",
            label: "Tip",
            filterValue: (r) => r.tipLabel,
            render: (r) => <TipBadge tip={r.tip} />,
          },
          { key: "ad", label: "Ad" },
          {
            key: "priceTier",
            label: "Segment",
            render: (r) => r.priceTier || <span className="text-[var(--muted-foreground)]">—</span>,
          },
          {
            key: "id",
            label: "",
            sortable: false,
            filterable: false,
            render: (row) => (
              <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Kişiler"
                  onClick={() => setKisiPartner(row)}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <RowActions
                  disabled={pending}
                  onEdit={() => setEditing(row)}
                  onDelete={() => {
                    if (confirm(`"${row.ad}" silinsin mi?`)) {
                      run(() => onDelete(row.id), { success: "Kayıt silindi." });
                    }
                  }}
                />
              </div>
            ),
          },
        ]}
      />

      {editing && (
        <FormModal
          title="Cari Kaydını Düzenle"
          description="Tip ve ad bilgilerini güncelleyin."
          onClose={() => setEditing(null)}
          pending={pending}
          submitLabel="Kaydet"
          maxWidth="max-w-lg"
          onSubmit={handleSubmit}
        >
          <FormSection title="Cari Bilgileri">
            <div>
              <Label htmlFor="edit-tip">Tip</Label>
              <Select id="edit-tip" name="tip" defaultValue={editing.tip}>
                {PARTNER_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-ad">Ad *</Label>
              <Input id="edit-ad" name="ad" defaultValue={editing.ad} required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="edit-tier">Fiyat segmenti</Label>
              <Input id="edit-tier" name="priceTier" defaultValue={editing.priceTier} placeholder="WHOLESALE, RETAIL…" />
            </div>
          </FormSection>
        </FormModal>
      )}
      {kisiPartner && (
        <KisiModal
          partner={kisiPartner}
          onClose={() => setKisiPartner(null)}
          loadContacts={loadPartnerContacts}
          onCreate={createKisi}
          onUpdate={updateKisi}
          onDelete={deleteKisi}
        />
      )}
    </>
  );
}

type UrunRow = { id: number; ad: string; raf: string };

export function UrunList({
  rows,
  onUpdate,
  onDelete,
}: {
  rows: UrunRow[];
  onUpdate: (id: number, fd: FormData) => Promise<{ error?: string } | void>;
  onDelete: (id: number) => Promise<{ error?: string } | void>;
}) {
  const [editing, setEditing] = useState<UrunRow | null>(null);
  const { run, pending } = useActionToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    run(
      async () => {
        await onUpdate(editing.id, fd);
        setEditing(null);
      },
      { success: "Ürün güncellendi." }
    );
  }

  return (
    <>
      <DataTable
        rows={rows}
        onRowClick={(row) => setEditing(row)}
        defaultSort={{ key: "ad", asc: true }}
        searchKeys={["ad", "raf"]}
        searchPlaceholder="Ürün veya raf ara…"
        filterKeys={[...URUN_TANIM_PRIMARY_FILTER_KEYS]}
        emptyText="Henüz ürün eklenmemiş"
        emptyHint="Yukarıdaki butonla yeni ürün ekleyebilirsiniz."
        columns={[
          { key: "ad", label: "Ürün Adı" },
          {
            key: "raf",
            label: "Hangi Raf",
            render: (r) =>
              r.raf ? (
                <span className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                  {r.raf}
                </span>
              ) : (
                <span className="text-[var(--muted-foreground)]">—</span>
              ),
          },
          {
            key: "id",
            label: "",
            sortable: false,
            filterable: false,
            render: (row) => (
              <RowActions
                disabled={pending}
                onEdit={() => setEditing(row)}
                onDelete={() => {
                  if (confirm(`"${row.ad}" silinsin mi?`)) {
                    run(() => onDelete(row.id), { success: "Ürün silindi." });
                  }
                }}
              />
            ),
          },
        ]}
      />

      {editing && (
        <FormModal
          title="Ürün Kaydını Düzenle"
          description="Ürün adı ve raf bilgisini güncelleyin."
          onClose={() => setEditing(null)}
          pending={pending}
          submitLabel="Kaydet"
          maxWidth="max-w-lg"
          onSubmit={handleSubmit}
        >
          <FormSection title="Ürün Bilgileri">
            <div>
              <Label htmlFor="edit-urun-ad">Ürün Adı *</Label>
              <Input id="edit-urun-ad" name="ad" defaultValue={editing.ad} required />
            </div>
            <div>
              <Label htmlFor="edit-urun-raf">Hangi Raf</Label>
              <Input id="edit-urun-raf" name="raf" defaultValue={editing.raf} placeholder="Örn. A-03" />
            </div>
          </FormSection>
        </FormModal>
      )}
    </>
  );
}

type SimpleRow = { id: number; ad: string };

export function SimpleAdList({
  rows,
  label,
  onUpdate,
  onDelete,
  searchPlaceholder,
  emptyText,
  editTitle,
}: {
  rows: SimpleRow[];
  label: string;
  onUpdate: (id: number, fd: FormData) => Promise<{ error?: string } | void>;
  onDelete: (id: number) => Promise<{ error?: string } | void>;
  searchPlaceholder?: string;
  emptyText?: string;
  editTitle?: string;
}) {
  const [editing, setEditing] = useState<SimpleRow | null>(null);
  const { run, pending } = useActionToast();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    run(
      async () => {
        await onUpdate(editing.id, fd);
        setEditing(null);
      },
      { success: "Kayıt güncellendi." }
    );
  }

  return (
    <>
      <DataTable
        rows={rows}
        onRowClick={setEditing}
        defaultSort={{ key: "ad", asc: true }}
        searchKeys={["ad"]}
        searchPlaceholder={searchPlaceholder ?? `${label} ara…`}
        emptyText={emptyText ?? `Henüz ${label.toLowerCase()} eklenmemiş`}
        emptyHint="Yukarıdaki butonla yeni kayıt ekleyebilirsiniz."
        columns={[
          { key: "ad", label },
          {
            key: "id",
            label: "",
            sortable: false,
            filterable: false,
            render: (row) => (
              <RowActions
                disabled={pending}
                onEdit={() => setEditing(row)}
                onDelete={() => {
                  if (confirm(`"${row.ad}" silinsin mi?`)) {
                    run(() => onDelete(row.id), { success: "Kayıt silindi." });
                  }
                }}
              />
            ),
          },
        ]}
      />

      {editing && (
        <FormModal
          title={editTitle ?? `${label} Düzenle`}
          description="Kayıt bilgilerini güncelleyin."
          onClose={() => setEditing(null)}
          pending={pending}
          submitLabel="Kaydet"
          maxWidth="max-w-lg"
          onSubmit={handleSubmit}
        >
          <FormSection title="Kayıt Bilgileri">
            <div className="sm:col-span-2">
              <Label htmlFor="edit-ad-simple">{label} *</Label>
              <Input id="edit-ad-simple" name="ad" defaultValue={editing.ad} required />
            </div>
          </FormSection>
        </FormModal>
      )}
    </>
  );
}
