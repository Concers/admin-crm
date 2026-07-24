"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableToolbar, type ToolbarSelect } from "@/components/data-table-toolbar";
import { isFilterActive, type ColFilter, type FacetColumn } from "@/components/table-faceted-filters";
import { resolvePrimaryFilterKeys } from "@/lib/table-filter-keys";
import { uniqueStrings } from "@/lib/utils";

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  /** false ise sütun filtresi gösterilmez */
  filterable?: boolean;
  /** true ise yalnızca filtre için kullanılır, tabloda gösterilmez */
  hidden?: boolean;
  /** Sütun filtresi türü: çok-seçim (category, varsayılan) veya sayısal aralık (number) */
  filterType?: "category" | "number";
  /** Sıralama için ham değer (sayı, tarih ISO, vb.) */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Filtre eşleştirmesi için değer (varsayılan: sortValue veya hücre metni) */
  filterValue?: (row: T) => string;
  align?: "left" | "right";
};

export type TableFilterDef<T> = {
  key: keyof T & string;
  label: string;
  options?: string[];
  getValue?: (row: T) => string;
};

export type AmountFilterField<T> = {
  id: string;
  label: string;
  getValue: (row: T) => number;
};

function buildFilterOptions<T extends Record<string, unknown>>(
  rows: T[],
  def: TableFilterDef<T>
): string[] {
  if (def.options?.length) return def.options;
  const values = rows
    .map((r) => (def.getValue ? def.getValue(r) : String(r[def.key] ?? "")).trim())
    .filter(Boolean);
  return uniqueStrings(values);
}

function parseAmountInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function getSortRaw<T extends Record<string, unknown>>(row: T, col: Column<T>): string | number {
  const raw = col.sortValue ? col.sortValue(row) : row[col.key];
  if (raw == null || raw === "" || raw === "-") return "";
  if (typeof raw === "number") return raw;
  const asNum = Number(String(raw).replace(/[^\d.-]/g, ""));
  if (String(raw).match(/^\d{4}$/)) return asNum;
  if (typeof raw === "string" && /^\d+([.,]\d+)?$/.test(raw.trim())) return asNum;
  return String(raw).toLowerCase();
}

function compareSortValues(a: string | number, b: string | number, asc: boolean): number {
  const bothNum =
    typeof a === "number" && typeof b === "number" && !Number.isNaN(a) && !Number.isNaN(b);
  if (bothNum) return asc ? a - b : b - a;

  const sa = String(a);
  const sb = String(b);
  const cmp = sa.localeCompare(sb, "tr", { numeric: true });
  return asc ? cmp : -cmp;
}

const SKIP_FILTER_KEYS = new Set(["id", "sil"]);

function isFilterableColumn<T>(col: Column<T>) {
  return Boolean(col.label?.trim()) && col.filterable !== false && !SKIP_FILTER_KEYS.has(col.key);
}

function getColumnFilterValue<T extends Record<string, unknown>>(row: T, col: Column<T>): string {
  if (col.filterValue) return col.filterValue(row).trim();
  if (col.sortValue) {
    const v = col.sortValue(row);
    return v != null && v !== "" ? String(v).trim() : "";
  }
  const raw = row[col.key];
  return raw != null && raw !== "" ? String(raw).trim() : "";
}

/** Numeric value of a column cell, for number-range filtering. */
function getColumnNumber<T extends Record<string, unknown>>(row: T, col: Column<T>): number | null {
  const raw = col.sortValue ? col.sortValue(row) : getColumnFilterValue(row, col);
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function TableHorizontalScroll({
  children,
}: {
  children: React.ReactNode;
  minWidth?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [overflows, setOverflows] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 2;
    setOverflows(hasOverflow);
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      ro.disconnect();
    };
  }, [updateScrollButtons, children]);

  function scrollStep(direction: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.65));
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {overflows && (
        <div className="flex items-center justify-end gap-1 border-b border-[var(--border)] bg-[var(--muted)]/40 px-2 py-1.5">
          <span className="mr-auto hidden text-xs text-[var(--muted-foreground)] sm:inline">
            Geniş tabloda sağa-sola kaydırın
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={!canScrollLeft}
            onClick={() => scrollStep(-1)}
            aria-label="Sola kaydır"
            title="Sola kaydır"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={!canScrollRight}
            onClick={() => scrollStep(1)}
            aria-label="Sağa kaydır"
            title="Sağa kaydır"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="relative">
        {overflows && canScrollLeft && (
          <div
            className="pointer-events-none absolute left-0 top-0 z-[2] h-full w-10 bg-gradient-to-r from-[var(--card)] to-transparent"
            aria-hidden
          />
        )}
        {overflows && canScrollRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 z-[2] h-full w-10 bg-gradient-to-l from-[var(--card)] to-transparent"
            aria-hidden
          />
        )}

        {overflows && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-1 top-1/2 z-[3] h-9 w-9 -translate-y-1/2 shadow-md disabled:opacity-0"
              disabled={!canScrollLeft}
              onClick={() => scrollStep(-1)}
              aria-label="Sola kaydır"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-1 top-1/2 z-[3] h-9 w-9 -translate-y-1/2 shadow-md disabled:opacity-0"
              disabled={!canScrollRight}
              onClick={() => scrollStep(1)}
              aria-label="Sağa kaydır"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        <div
          ref={scrollRef}
          className="table-scroll-x overflow-x-auto overscroll-x-contain scroll-smooth"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  rows,
  columns,
  onRowClick,
  searchKeys,
  searchPlaceholder = "Tabloda ara…",
  filters,
  amountFilter,
  columnFilters = true,
  filterKeys,
  defaultSort,
  emptyText = "Kayıt bulunamadı.",
  emptyHint = "Filtreleri temizleyin veya yeni kayıt ekleyin.",
  minTableWidth = "600px",
  preserveOrder = false,
  pageSize,
}: {
  rows: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  filters?: TableFilterDef<T>[];
  amountFilter?: { fields: AmountFilterField<T>[]; defaultField?: string };
  /** Her sütun başlığı altında filtre (varsayılan: açık) */
  columnFilters?: boolean;
  /** Toolbar’da gösterilecek önemli filtre sütunları (en fazla 5; belirtilmezse otomatik seçilir) */
  filterKeys?: string[];
  defaultSort?: { key: string; asc: boolean };
  emptyText?: string;
  emptyHint?: string;
  minTableWidth?: string;
  preserveOrder?: boolean;
  /** Verildiğinde tablo bu boyutta sayfalanır (uzun listelerde scroll'u azaltır). */
  pageSize?: number;
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [columnFilterValues, setColumnFilterValues] = useState<Record<string, ColFilter>>({});
  const [amountField, setAmountField] = useState(
    amountFilter?.defaultField ?? amountFilter?.fields[0]?.id ?? ""
  );
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
  const [asc, setAsc] = useState(defaultSort?.asc ?? true);

  const filterableColumns = useMemo(
    () => columns.filter(isFilterableColumn),
    [columns]
  );

  const primaryFilterKeys = useMemo(
    () => resolvePrimaryFilterKeys(columns, filterKeys),
    [columns, filterKeys]
  );

  const visibleColumns = useMemo(
    () => columns.filter((c) => !c.hidden),
    [columns]
  );

  const primaryFilterColumns = useMemo(
    () => filterableColumns.filter((c) => primaryFilterKeys.includes(c.key)),
    [filterableColumns, primaryFilterKeys]
  );

  const colByKey = useMemo(() => {
    const m = new Map<string, Column<T>>();
    for (const c of filterableColumns) m.set(c.key, c);
    return m;
  }, [filterableColumns]);

  // --- Faceted (cascading / bağlı) filtreleme -----------------------------
  // Her aktif filtreyi, sahibi olan anahtarla etiketli bir yükleme (predicate)
  // hâline getiririz. Bir filtrenin seçenekleri hesaplanırken KENDİ yüklemesi
  // hariç tutulur; böylece bir filtrede değer seçilince diğer filtreler yalnızca
  // kalan satırlarda gerçekten bulunan değerleri listeler.
  const amountFieldDef =
    amountFilter?.fields.find((f) => f.id === amountField) ?? amountFilter?.fields[0];
  const minAmount = parseAmountInput(amountMin);
  const maxAmount = parseAmountInput(amountMax);
  const hasAmountFilter = minAmount != null || maxAmount != null;

  const predicates = useMemo(() => {
    const list: { key: string; test: (row: T) => boolean }[] = [];
    const q = query.toLowerCase().trim();
    if (q && searchKeys?.length) {
      list.push({
        key: "__search__",
        test: (row) => searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
      });
    }
    if (filters?.length) {
      for (const f of filters) {
        const val = filterValues[f.key];
        if (!val) continue;
        list.push({
          key: f.key,
          test: (row) => (f.getValue ? f.getValue(row) : String(row[f.key] ?? "")).trim() === val,
        });
      }
    }
    if (columnFilters) {
      for (const [key, filter] of Object.entries(columnFilterValues)) {
        if (!isFilterActive(filter)) continue;
        const col = colByKey.get(key);
        if (!col) continue;
        if (filter.type === "category") {
          const set = new Set(filter.values);
          list.push({ key, test: (row) => set.has(getColumnFilterValue(row, col)) });
        } else {
          const min = parseAmountInput(filter.min);
          const max = parseAmountInput(filter.max);
          list.push({
            key,
            test: (row) => {
              const v = getColumnNumber(row, col);
              if (v == null) return false;
              if (min != null && v < min) return false;
              if (max != null && v > max) return false;
              return true;
            },
          });
        }
      }
    }
    if (hasAmountFilter && amountFieldDef) {
      list.push({
        key: "__amount__",
        test: (row) => {
          const val = amountFieldDef.getValue(row);
          if (minAmount != null && val < minAmount) return false;
          if (maxAmount != null && val > maxAmount) return false;
          return true;
        },
      });
    }
    return list;
  }, [
    query,
    searchKeys,
    filters,
    filterValues,
    columnFilters,
    columnFilterValues,
    colByKey,
    hasAmountFilter,
    amountFieldDef,
    minAmount,
    maxAmount,
  ]);

  // Tüm yüklemeleri uygular; excludeKey verilirse o anahtara ait yükleme atlanır.
  const applyExcept = useCallback(
    (excludeKey: string | null) =>
      rows.filter((row) => predicates.every((p) => (p.key === excludeKey ? true : p.test(row)))),
    [rows, predicates],
  );

  // Faceted filter columns — her kolonun seçenekleri kendi filtresi hariç diğer
  // tüm aktif filtreler uygulanmış satır kümesinden türetilir.
  const facetColumns = useMemo<FacetColumn[]>(() => {
    if (!columnFilters) return [];
    return filterableColumns.map((col) => {
      if (col.filterType === "number") {
        return { key: col.key, label: col.label, type: "number" as const };
      }
      const counts = new Map<string, number>();
      for (const r of applyExcept(col.key)) {
        const v = getColumnFilterValue(r, col);
        if (!v || v === "—" || v === "-") continue;
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
      const numeric = [...counts.keys()].every((v) => /^\d+$/.test(v));
      const options = [...counts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) =>
          numeric ? Number(a.value) - Number(b.value) : a.value.localeCompare(b.value, "tr", { numeric: true }),
        );
      return { key: col.key, label: col.label, type: "category" as const, options };
    });
  }, [columnFilters, filterableColumns, applyExcept]);

  const sortableColumns = useMemo(
    () => columns.filter((c) => !c.hidden && c.sortable !== false && c.key !== "id" && c.key !== "sil"),
    [columns]
  );

  // Özel filtre seçenekleri de faceted: her filtrenin listesi diğer aktif
  // filtreler uygulanmış satırlardan türetilir.
  const filterOptions = useMemo(() => {
    if (!filters?.length) return {};
    const out: Record<string, string[]> = {};
    for (const f of filters) {
      out[f.key] = buildFilterOptions(applyExcept(f.key), f);
    }
    return out;
  }, [filters, applyExcept]);

  const activeColumnFilterCount = Object.values(columnFilterValues).filter(isFilterActive).length;
  const activeFilterCount =
    Object.values(filterValues).filter(Boolean).length +
    activeColumnFilterCount +
    (hasAmountFilter ? 1 : 0);
  const hasActiveFilters = Boolean(query.trim() || activeFilterCount > 0);

  const filtered = useMemo(() => {
    // Tüm aktif filtreler (arama + özel + kolon + tutar) predicate motorundan.
    let data = applyExcept(null);

    if (!preserveOrder && sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        data = [...data].sort((a, b) => {
          const av = getSortRaw(a, col);
          const bv = getSortRaw(b, col);
          return compareSortValues(av, bv, asc);
        });
      }
    }

    return data;
  }, [applyExcept, sortKey, asc, preserveOrder, columns]);

  // --- Sayfalama (opt-in: pageSize) -----------------------------------------
  const [page, setPage] = useState(0);
  const pageCount = pageSize ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  // Filtre/sort sonrası mevcut sayfa taşarsa başa dön.
  useEffect(() => {
    if (page > pageCount - 1) setPage(0);
  }, [page, pageCount]);
  const paged = useMemo(
    () => (pageSize ? filtered.slice(page * pageSize, page * pageSize + pageSize) : filtered),
    [filtered, pageSize, page],
  );

  function clearFilters() {
    setQuery("");
    setFilterValues({});
    setColumnFilterValues({});
    setAmountMin("");
    setAmountMax("");
    setSortKey(defaultSort?.key ?? null);
    setAsc(defaultSort?.asc ?? true);
  }

  const showToolbar =
    searchKeys?.length ||
    filters?.length ||
    amountFilter?.fields.length ||
    sortableColumns.length ||
    columnFilters;

  const setColumnFilter = useCallback((key: string, filter: ColFilter | null) => {
    setColumnFilterValues((prev) => {
      if (filter === null) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: filter };
    });
  }, []);

  // Inline filter dropdowns: yalnızca önemli sütunlar + özel filtreler.
  const toolbarSelects: ToolbarSelect[] = [
    ...(columnFilters
      ? primaryFilterColumns
          .filter((col) => col.filterType !== "number")
          .map((col) => {
            const fc = facetColumns.find((f) => f.key === col.key);
            const cur = columnFilterValues[col.key];
            return {
              key: col.key,
              label: col.label,
              value: cur && cur.type === "category" ? cur.values[0] ?? "" : "",
              options: (fc?.options ?? []).map((o) => o.value),
              onChange: (v: string) =>
                setColumnFilter(col.key, v ? { type: "category", values: [v] } : null),
            };
          })
      : []),
    ...(filters ?? []).map((f) => ({
      key: f.key,
      label: f.label,
      value: filterValues[f.key] ?? "",
      options: filterOptions[f.key] ?? [],
      onChange: (v: string) =>
        setFilterValues((prev) => {
          if (!v) {
            const next = { ...prev };
            delete next[f.key];
            return next;
          }
          return { ...prev, [f.key]: v };
        }),
    })),
  ];


  return (
    <div className="space-y-3">
      {showToolbar ? (
        <DataTableToolbar
          showSearch={Boolean(searchKeys?.length)}
          searchPlaceholder={searchPlaceholder}
          query={query}
          onQueryChange={setQuery}
          selects={toolbarSelects}
          amount={
            amountFilter?.fields.length
              ? {
                  fields: amountFilter.fields.map((f) => ({ id: f.id, label: f.label })),
                  field: amountField,
                  onField: setAmountField,
                  min: amountMin,
                  max: amountMax,
                  onMin: setAmountMin,
                  onMax: setAmountMax,
                  active: Boolean(amountMin || amountMax),
                }
              : undefined
          }
          sort={
            !preserveOrder && sortableColumns.length > 0
              ? {
                  columns: sortableColumns.map((c) => ({ key: c.key, label: c.label })),
                  sortKey,
                  asc,
                  onToggle: (key) => {
                    if (sortKey === key) setAsc(!asc);
                    else {
                      setSortKey(key);
                      setAsc(true);
                    }
                  },
                  onDir: setAsc,
                }
              : undefined
          }
          count={filtered.length}
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        />
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <TableHorizontalScroll>
          <table className="w-full text-sm" style={{ minWidth: minTableWidth }}>
            <thead className="sticky top-0 z-[1] bg-[var(--accent)] backdrop-blur-sm">
              <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {visibleColumns.map((col) => {
                  const sortable = !preserveOrder && col.sortable !== false && col.key !== "id" && col.key !== "sil";
                  const colFilterActive = isFilterActive(columnFilterValues[col.key]);
                  return (
                    <th
                      key={col.key}
                      className={`whitespace-nowrap px-4 py-3 font-medium ${
                        col.align === "right" ? "text-right" : ""
                      } ${sortable ? "cursor-pointer select-none hover:text-[var(--foreground)]" : ""}`}
                      onClick={() => {
                        if (!sortable) return;
                        if (sortKey === col.key) setAsc(!asc);
                        else {
                          setSortKey(col.key);
                          setAsc(true);
                        }
                      }}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {colFilterActive && (
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]"
                            title="Filtre aktif"
                          />
                        )}
                        {sortKey === col.key ? (asc ? " ↑" : " ↓") : ""}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-4 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-[var(--muted-foreground)]">
                      <Inbox className="h-10 w-10 opacity-40" />
                      <p className="font-medium text-[var(--foreground)]">{emptyText}</p>
                      <p className="text-xs">{emptyHint}</p>
                      {hasActiveFilters && (
                        <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                          Filtreleri temizle
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {paged.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-[var(--border)]/80 transition-colors last:border-0 ${
                    i % 2 === 1 ? "bg-[var(--muted)]/20" : ""
                  } ${onRowClick ? "cursor-pointer hover:bg-[var(--accent)]" : "hover:bg-[var(--muted)]/35"}`}
                >
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2.5 align-middle ${
                        col.align === "right" ? "text-right tabular-nums" : ""
                      }`}
                    >
                      {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TableHorizontalScroll>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted-foreground)]">
        <p className="flex items-center">
          <Badge tone="blue" className="tabular-nums">
            {filtered.length}
          </Badge>
          <span className="ml-1.5">kayıt</span>
          {rows.length !== filtered.length && (
            <span className="ml-1">/ {rows.length} toplam</span>
          )}
          {pageSize && filtered.length > pageSize && (
            <span className="ml-2 tabular-nums">
              · {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} arası
            </span>
          )}
        </p>
        {pageSize && filtered.length > pageSize && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ‹ Önceki
            </Button>
            <span className="tabular-nums">
              {page + 1} / {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Sonraki ›
            </Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {sortKey && !preserveOrder && (
            <span>
              Sıralama: {sortableColumns.find((c) => c.key === sortKey)?.label ?? sortKey}{" "}
              {asc ? "↑" : "↓"}
            </span>
          )}
          {activeFilterCount > 0 && <span>{activeFilterCount} filtre aktif</span>}
        </div>
      </div>
    </div>
  );
}
