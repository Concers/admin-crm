"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  Inbox,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
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
import { calendarDay, calendarMonth, calendarYear } from "@/lib/dates";
import { cn, uniqueStrings } from "@/lib/utils";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteGider } from "./actions";
import type { GiderTableRow } from "./gider-rows";

const AYLAR_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function tarihKisa(date: Date | string): string {
  return `${calendarDay(date)} ${AYLAR_KISA[calendarMonth(date) - 1] ?? ""} ${calendarYear(date)}`;
}

type SortKey = "_date" | "_totalAmount" | "_paidAmount" | "_periyot" | "giderTuru";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "_date", label: "Tarih" },
  { key: "giderTuru", label: "Gider Türü" },
  { key: "_periyot", label: "Periyot" },
  { key: "_totalAmount", label: "Toplam Tutar" },
  { key: "_paidAmount", label: "Peşin Ödenen" },
];

function sortValue(row: GiderTableRow, key: SortKey): number | string {
  switch (key) {
    case "_date":
      return new Date(row._date).getTime();
    case "_totalAmount":
      return row._totalAmount;
    case "_paidAmount":
      return row._paidAmount;
    case "_periyot":
      return row._durationMonths ?? 0;
    case "giderTuru":
      return row.giderTuru.toLowerCase();
  }
}

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

export function GiderTable({
  rows,
  onEdit,
}: {
  rows: GiderTableRow[];
  onEdit: (row: GiderTableRow) => void;
}) {
  const [query, setQuery] = useState("");
  const [yil, setYil] = useState("");
  const [tur, setTur] = useState("");
  const [periyot, setPeriyot] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("_date");
  const [asc, setAsc] = useState(false);

  const yilOptions = useMemo(() => uniqueStrings(rows.map((r) => r.yil).filter((v) => v && v !== "-")).sort(), [rows]);
  const turOptions = useMemo(
    () => uniqueStrings(rows.map((r) => r.giderTuru).filter((v) => v && v !== "-")).sort((a, b) => a.localeCompare(b, "tr")),
    [rows]
  );
  const periyotOptions = useMemo(
    () => uniqueStrings(rows.map((r) => r.periyotAy).filter((v) => v && v !== "-")).sort((a, b) => Number(a) - Number(b)),
    [rows]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setAsc((p) => !p);
    else {
      setSortKey(key);
      setAsc(key === "giderTuru");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let data = rows.filter((r) => {
      if (yil && r.yil !== yil) return false;
      if (tur && r.giderTuru !== tur) return false;
      if (periyot && r.periyotAy !== periyot) return false;
      if (q) {
        const hay = `${r.giderTuru} ${r.tedarikciAdi} ${r.urunAdi} ${r.faturaNo} ${r.notlar}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    data = [...data].sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "tr");
      return asc ? cmp : -cmp;
    });
    return data;
  }, [rows, query, yil, tur, periyot, sortKey, asc]);

  const hasFilters = Boolean(query || yil || tur || periyot);

  return (
    <div className="space-y-3">
      {/* Kompakt tek satır: arama + filtreler + sıralama */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gider türü, tedarikçi, fatura no, ürün…"
            className="h-9 pl-9"
            aria-label="Giderlerde ara"
          />
        </div>

        <Select value={yil} onChange={(e) => setYil(e.target.value)} className="h-9 w-auto min-w-[90px]" aria-label="Yıl">
          <option value="">Yıl: Tümü</option>
          {yilOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>

        <Select value={tur} onChange={(e) => setTur(e.target.value)} className="h-9 w-auto min-w-[130px]" aria-label="Gider Türü">
          <option value="">Gider Türü: Tümü</option>
          {turOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>

        <Select value={periyot} onChange={(e) => setPeriyot(e.target.value)} className="h-9 w-auto min-w-[110px]" aria-label="Periyot">
          <option value="">Periyot: Tümü</option>
          {periyotOptions.map((p) => (
            <option key={p} value={p}>{p} ay</option>
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
              setTur("");
              setPeriyot("");
            }}
          >
            Temizle
          </Button>
        )}

        <span className="ml-auto text-xs text-[var(--muted-foreground)]">
          <span className="font-medium text-[var(--foreground)]">{filtered.length}</span> kayıt
        </span>
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: "980px" }}>
            <thead className="border-b border-[var(--border)] bg-[var(--accent)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <SortHeader label="Tarih" active={sortKey === "_date"} asc={asc} onClick={() => toggleSort("_date")} />
                <SortHeader label="Gider Türü" active={sortKey === "giderTuru"} asc={asc} onClick={() => toggleSort("giderTuru")} />
                <th className="whitespace-nowrap px-4 py-3 font-medium">Tedarikçi / Ürün</th>
                <SortHeader label="Periyot" active={sortKey === "_periyot"} asc={asc} onClick={() => toggleSort("_periyot")} />
                <SortHeader label="Toplam Tutar" active={sortKey === "_totalAmount"} asc={asc} onClick={() => toggleSort("_totalAmount")} align="right" />
                <SortHeader label="Peşin Ödenen" active={sortKey === "_paidAmount"} asc={asc} onClick={() => toggleSort("_paidAmount")} align="right" />
                <th className="whitespace-nowrap px-4 py-3 font-medium">Fatura No</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-[var(--muted-foreground)]">
                      <Inbox className="h-10 w-10 opacity-40" />
                      <p className="font-medium text-[var(--foreground)]">Kayıt bulunamadı</p>
                      <p className="text-xs">Filtreleri temizleyin veya yeni gider ekleyin.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const urunGideri = row.giderKategori === "Ürün Gideri";
                  const taraf = urunGideri ? row.urunAdi : row.tedarikciAdi;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => onEdit(row)}
                      className="cursor-pointer border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--muted)]/40"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium tabular-nums">{tarihKisa(row._date)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{row.giderTuru}</span>
                          <Badge tone={urunGideri ? "indigo" : "blue"} className="w-fit">
                            {row.giderKategori}
                          </Badge>
                        </div>
                      </td>
                      <td className="max-w-[16rem] truncate px-4 py-2.5" title={taraf !== "-" ? taraf : undefined}>
                        {taraf !== "-" ? taraf : <span className="text-[var(--muted-foreground)]">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.periyotAy !== "-" ? (
                          <Badge tone="amber" className="tabular-nums">{row.periyotAy} ay</Badge>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge tone="green" className="tabular-nums">{row.toplamTutar}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-[var(--muted-foreground)]">
                        {row.pesinOdenen}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-[var(--muted-foreground)]">
                        {row.faturaNo || "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <RowActions row={row} onEdit={() => onEdit(row)} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RowActions({ row, onEdit }: { row: GiderTableRow; onEdit: () => void }) {
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
            <AlertDialogTitle>Gider kaydı silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{row.giderTuru}</strong> ({row.gun}) gider kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => run(() => deleteGider(row.id), { success: "Gider kaydı silindi." })}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
