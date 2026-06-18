"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  Inbox,
  LayoutGrid,
  MoreHorizontal,
  Package,
  Pencil,
  Search,
  Trash2,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { calendarDay, calendarMonth, calendarYear } from "@/lib/dates";
import { cn, uniqueStrings } from "@/lib/utils";
import { deleteAlim } from "./actions";
import { AlimModal } from "./alim-modal";

export type AlimRow = {
  id: number;
  tarih: string;
  urunAdi: string;
  tedarikci: string;
  raf: string;
  birimAlimFiyati: string;
  alimAdeti: number;
  toplamTutar: string;
  kdvDahilTutar: string;
  pesinOdenen: string;
  _date: string;
  _productName: string;
  _supplierName: string;
  _quantity: number;
  _unitPrice: number;
  _vatRate: number;
  _paidAmount: number;
  _totalAmount: number;
  _vatIncludedAmount: number;
  _shelfLocation: string;
  _notes: string;
};

const AYLAR_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
function tarihKisa(date: string | Date): string {
  return `${calendarDay(date)} ${AYLAR_KISA[calendarMonth(date) - 1] ?? ""} ${calendarYear(date)}`;
}

export function AlimWorkspace({
  rows,
  urunler,
  tedarikciler,
}: {
  rows: AlimRow[];
  urunler: string[];
  tedarikciler: string[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AlimRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Alım Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni alım ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <AlimList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <AlimModal
          mode="create"
          urunler={urunler}
          tedarikciler={tedarikciler}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editing && (
        <AlimModal
          mode="edit"
          row={editing}
          urunler={urunler}
          tedarikciler={tedarikciler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

type SortKey = "_date" | "_quantity" | "_unitPrice" | "_totalAmount" | "_vatIncludedAmount" | "_paidAmount";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "_date", label: "Tarih" },
  { key: "_quantity", label: "Adet" },
  { key: "_unitPrice", label: "Birim Fiyat" },
  { key: "_totalAmount", label: "Toplam" },
  { key: "_vatIncludedAmount", label: "KDV Dahil" },
  { key: "_paidAmount", label: "Peşin" },
];

function SortHeader({
  label,
  active,
  asc,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th className={cn("whitespace-nowrap px-4 py-3 font-medium", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-[var(--foreground)]",
          align === "right" && "flex-row-reverse",
          active && "text-[var(--primary)]"
        )}
      >
        {label}
        {active ? (
          asc ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ArrowDownUp className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

function AlimList({ rows, onEdit }: { rows: AlimRow[]; onEdit: (row: AlimRow) => void }) {
  const [query, setQuery] = useState("");
  const [yil, setYil] = useState("");
  const [tedarikci, setTedarikci] = useState("");
  const [raf, setRaf] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("_date");
  const [asc, setAsc] = useState(false);

  const yilOptions = useMemo(
    () => uniqueStrings(rows.map((r) => String(calendarYear(r._date)))).sort(),
    [rows]
  );
  const tedarikciOptions = useMemo(
    () => uniqueStrings(rows.map((r) => r.tedarikci).filter((v) => v && v !== "—")).sort((a, b) => a.localeCompare(b, "tr")),
    [rows]
  );
  const rafOptions = useMemo(
    () => uniqueStrings(rows.map((r) => r.raf).filter(Boolean)).sort((a, b) => a.localeCompare(b, "tr")),
    [rows]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setAsc((p) => !p);
    else {
      setSortKey(key);
      setAsc(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = rows.filter((r) => {
      if (yil && String(calendarYear(r._date)) !== yil) return false;
      if (tedarikci && r.tedarikci !== tedarikci) return false;
      if (raf && r.raf !== raf) return false;
      if (q) {
        const hay = `${r.urunAdi} ${r.tedarikci} ${r.raf} ${r._notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    data = [...data].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return asc ? av - bv : bv - av;
    });
    return data;
  }, [rows, query, yil, tedarikci, raf, sortKey, asc]);

  const hasFilters = Boolean(query || yil || tedarikci || raf);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün, tedarikçi, raf ara…"
            className="h-9 pl-9"
            aria-label="Alımlarda ara"
          />
        </div>

        <Select value={yil} onChange={(e) => setYil(e.target.value)} className="h-9 w-auto min-w-[90px]" aria-label="Yıl">
          <option value="">Yıl: Tümü</option>
          {yilOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>

        <Select value={tedarikci} onChange={(e) => setTedarikci(e.target.value)} className="h-9 w-auto min-w-[140px]" aria-label="Tedarikçi">
          <option value="">Tedarikçi: Tümü</option>
          {tedarikciOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>

        <Select value={raf} onChange={(e) => setRaf(e.target.value)} className="h-9 w-auto min-w-[100px]" aria-label="Raf">
          <option value="">Raf: Tümü</option>
          {rafOptions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <ArrowDownUp className="h-3.5 w-3.5" />
              Sıralama
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sütuna göre</DropdownMenuLabel>
            {SORT_OPTIONS.map((o) => (
              <DropdownMenuItem key={o.key} onSelect={() => toggleSort(o.key)}>
                {sortKey === o.key ? (
                  asc ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                ) : (
                  <ArrowDownUp className="h-4 w-4 opacity-40" />
                )}
                {o.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setAsc(true)}>
              <ArrowUp className="h-4 w-4" /> Artan
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setAsc(false)}>
              <ArrowDown className="h-4 w-4" /> Azalan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-[var(--muted-foreground)]"
            onClick={() => {
              setQuery("");
              setYil("");
              setTedarikci("");
              setRaf("");
            }}
          >
            Temizle
          </Button>
        )}

        <span className="ml-auto text-xs text-[var(--muted-foreground)]">
          <span className="font-medium text-[var(--foreground)]">{filtered.length}</span> kayıt
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "1040px" }}>
            <thead className="border-b border-[var(--border)] bg-[var(--accent)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <SortHeader label="Tarih" active={sortKey === "_date"} asc={asc} onClick={() => toggleSort("_date")} />
                <th className="whitespace-nowrap px-4 py-3 font-medium">Ürün</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Tedarikçi</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Raf</th>
                <SortHeader label="Birim" active={sortKey === "_unitPrice"} asc={asc} onClick={() => toggleSort("_unitPrice")} align="right" />
                <SortHeader label="Adet" active={sortKey === "_quantity"} asc={asc} onClick={() => toggleSort("_quantity")} align="right" />
                <SortHeader label="Toplam" active={sortKey === "_totalAmount"} asc={asc} onClick={() => toggleSort("_totalAmount")} align="right" />
                <SortHeader label="KDV Dahil" active={sortKey === "_vatIncludedAmount"} asc={asc} onClick={() => toggleSort("_vatIncludedAmount")} align="right" />
                <SortHeader label="Peşin" active={sortKey === "_paidAmount"} asc={asc} onClick={() => toggleSort("_paidAmount")} align="right" />
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-[var(--muted-foreground)]">
                      <Inbox className="h-10 w-10 opacity-40" />
                      <p className="font-medium text-[var(--foreground)]">Alım kaydı bulunamadı</p>
                      <p className="text-xs">Filtreleri temizleyin veya yeni alım ekleyin.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onEdit(row)}
                    className="cursor-pointer border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--muted)]/40"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium tabular-nums">{tarihKisa(row._date)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                          <Package className="h-3.5 w-3.5" />
                        </span>
                        <span className="max-w-[16rem] truncate font-medium" title={row.urunAdi}>{row.urunAdi}</span>
                      </div>
                    </td>
                    <td className="max-w-[12rem] truncate px-4 py-2.5" title={row.tedarikci}>
                      {row.tedarikci && row.tedarikci !== "—" ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
                          <span className="truncate">{row.tedarikci}</span>
                        </span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {row.raf ? (
                        <Badge tone="indigo" className="gap-1">
                          <LayoutGrid className="h-3 w-3" />
                          {row.raf}
                        </Badge>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-[var(--muted-foreground)]">
                      {row.birimAlimFiyati}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge tone="default" className="tabular-nums">{row.alimAdeti}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium tabular-nums">{row.toplamTutar}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge tone="green" className="tabular-nums">{row.kdvDahilTutar}</Badge>
                    </td>
                    <td
                      className={cn(
                        "whitespace-nowrap px-4 py-2.5 text-right tabular-nums",
                        row._paidAmount > 0 ? "font-medium text-amber-700" : "text-[var(--muted-foreground)]"
                      )}
                    >
                      {row.pesinOdenen}
                    </td>
                    <td className="px-4 py-2.5">
                      <RowActions row={row} onEdit={() => onEdit(row)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RowActions({ row, onEdit }: { row: AlimRow; onEdit: () => void }) {
  const { run, pending } = useActionToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="İşlemler" aria-label="İşlemler">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => onEdit()}>
            <Pencil className="h-4 w-4" />
            Düzenle
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger" onSelect={() => setTimeout(() => setConfirmOpen(true), 0)}>
            <Trash2 className="h-4 w-4" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alım kaydı silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{row.urunAdi}</strong> ({row.tarih}) alım kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => run(() => deleteAlim(row.id), { success: "Alım kaydı silindi." })}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
