"use client";

import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Users,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";

const TEDARIKCI_TIPLERI = ["TEDARİKÇİ", "HİZMET VEREN", "EL PATRON"] as const;

const TIP_BADGE: Record<string, string> = {
  TEDARİKÇİ: "bg-blue-50 text-blue-700 ring-blue-100",
  "HİZMET VEREN": "bg-violet-50 text-violet-700 ring-violet-100",
  "EL PATRON": "bg-amber-50 text-amber-700 ring-amber-100",
};

function TipBadge({ tip }: { tip: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1",
        TIP_BADGE[tip] ?? "bg-[var(--muted)] text-[var(--muted-foreground)] ring-[var(--border)]"
      )}
    >
      {tip}
    </span>
  );
}

function ListSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label="Listede ara"
      />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  query,
  entity,
}: {
  icon: React.ElementType;
  query: string;
  entity: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)]">
        <Icon className="h-6 w-6 text-[var(--muted-foreground)]" />
      </div>
      <p className="text-sm font-medium">
        {query ? "Arama sonucu bulunamadı" : `Henüz ${entity} eklenmemiş`}
      </p>
      <p className="mt-1 max-w-xs text-xs text-[var(--muted-foreground)]">
        {query
          ? `"${query}" ile eşleşen kayıt yok. Farklı bir terim deneyin.`
          : `Yukarıdaki formu kullanarak ilk ${entity} kaydını ekleyebilirsiniz.`}
      </p>
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
  disabled,
  editLabel = "Düzenle",
  deleteLabel = "Sil",
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  editLabel?: string;
  deleteLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={onEdit}
        title={editLabel}
        aria-label={editLabel}
        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={onDelete}
        title={deleteLabel}
        aria-label={deleteLabel}
        className="text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ListShell({
  children,
  count,
  total,
}: {
  children: React.ReactNode;
  count: number;
  total: number;
}) {
  return (
    <div className="space-y-3">
      {total > 0 && (
        <p className="text-xs text-[var(--muted-foreground)]">
          {count === total ? (
            <>{total} kayıt listeleniyor</>
          ) : (
            <>
              <span className="font-medium text-[var(--foreground)]">{count}</span> / {total}{" "}
              kayıt gösteriliyor
            </>
          )}
        </p>
      )}
      {children}
    </div>
  );
}

export function TedarikciList({
  rows,
  onUpdate,
  onDelete,
}: {
  rows: { id: number; tip: string; ad: string }[];
  onUpdate: (id: number, fd: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [editId, setEditId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const { run, pending } = useActionToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.ad.toLowerCase().includes(q) || r.tip.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <ListShell count={filtered.length} total={rows.length}>
      {rows.length > 3 && (
        <ListSearch
          value={query}
          onChange={setQuery}
          placeholder="Tedarikçi veya tip ara..."
        />
      )}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} query={query} entity="tedarikçi" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--muted)] shadow-[0_1px_0_var(--border)]">
                <tr className="text-left text-[var(--muted-foreground)]">
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">
                    Tip
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">
                    Ad
                  </th>
                  <th className="w-20 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) =>
                  editId === row.id ? (
                    <tr key={row.id} className="border-t bg-[var(--accent)]/60">
                      <td className="px-4 py-2">
                        <Select name="tip" defaultValue={row.tip} id={`tip-${row.id}`}>
                          {TEDARIKCI_TIPLERI.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-2">
                        <Input name="ad" defaultValue={row.ad} id={`ad-${row.id}`} />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-0.5">
                          <Button
                            type="button"
                            size="icon"
                            disabled={pending}
                            title="Kaydet"
                            aria-label="Kaydet"
                            onClick={() => {
                              const fd = new FormData();
                              const tip = (
                                document.getElementById(`tip-${row.id}`) as HTMLSelectElement
                              ).value;
                              const ad = (
                                document.getElementById(`ad-${row.id}`) as HTMLInputElement
                              ).value;
                              fd.set("tip", tip);
                              fd.set("ad", ad);
                              run(
                                async () => {
                                  await onUpdate(row.id, fd);
                                  setEditId(null);
                                },
                                { success: "Kayıt güncellendi." }
                              );
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="İptal"
                            aria-label="İptal"
                            onClick={() => setEditId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={row.id}
                      className="border-t transition-colors hover:bg-[var(--muted)]/60"
                    >
                      <td className="px-4 py-2.5">
                        <TipBadge tip={row.tip} />
                      </td>
                      <td className="px-4 py-2.5 font-medium">{row.ad}</td>
                      <td className="px-4 py-2.5">
                        <RowActions
                          disabled={pending}
                          onEdit={() => setEditId(row.id)}
                          onDelete={() => {
                            if (confirm(`"${row.ad}" silinsin mi?`)) {
                              run(() => onDelete(row.id), {
                                success: "Kayıt silindi.",
                              });
                            }
                          }}
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ListShell>
  );
}

export function SimpleAdList({
  rows,
  label,
  onUpdate,
  onDelete,
  searchPlaceholder,
  emptyEntity,
  emptyIcon: EmptyIcon = Tags,
}: {
  rows: { id: number; ad: string }[];
  label: string;
  onUpdate: (id: number, fd: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  searchPlaceholder?: string;
  emptyEntity?: string;
  emptyIcon?: React.ElementType;
}) {
  const [editId, setEditId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const { run, pending } = useActionToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.ad.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <ListShell count={filtered.length} total={rows.length}>
      {rows.length > 3 && (
        <ListSearch
          value={query}
          onChange={setQuery}
          placeholder={searchPlaceholder ?? `${label} ara...`}
        />
      )}
      {filtered.length === 0 ? (
        <EmptyState
          icon={EmptyIcon}
          query={query}
          entity={emptyEntity ?? label.toLowerCase()}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--muted)] shadow-[0_1px_0_var(--border)]">
                <tr className="text-left text-[var(--muted-foreground)]">
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">
                    {label}
                  </th>
                  <th className="w-20 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) =>
                  editId === row.id ? (
                    <tr key={row.id} className="border-t bg-[var(--accent)]/60">
                      <td className="px-4 py-2">
                        <Input name="ad" defaultValue={row.ad} id={`ad-${row.id}`} />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-0.5">
                          <Button
                            type="button"
                            size="icon"
                            disabled={pending}
                            title="Kaydet"
                            aria-label="Kaydet"
                            onClick={() => {
                              const fd = new FormData();
                              const ad = (
                                document.getElementById(`ad-${row.id}`) as HTMLInputElement
                              ).value;
                              fd.set("ad", ad);
                              run(
                                async () => {
                                  await onUpdate(row.id, fd);
                                  setEditId(null);
                                },
                                { success: "Kayıt güncellendi." }
                              );
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="İptal"
                            aria-label="İptal"
                            onClick={() => setEditId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={row.id}
                      className="border-t transition-colors hover:bg-[var(--muted)]/60"
                    >
                      <td className="px-4 py-2.5 font-medium">{row.ad}</td>
                      <td className="px-4 py-2.5">
                        <RowActions
                          disabled={pending}
                          onEdit={() => setEditId(row.id)}
                          onDelete={() => {
                            if (confirm(`"${row.ad}" silinsin mi?`)) {
                              run(() => onDelete(row.id), {
                                success: "Kayıt silindi.",
                              });
                            }
                          }}
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ListShell>
  );
}
