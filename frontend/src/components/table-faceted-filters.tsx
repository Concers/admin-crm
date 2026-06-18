"use client";

import { useMemo, useState } from "react";
import { Check, Filter, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Per-column filter value. `category` = multi-select; `number` = min/max range. */
export type ColFilter =
  | { type: "category"; values: string[] }
  | { type: "number"; min: string; max: string };

export type FacetOption = { value: string; count: number };

export type FacetColumn = {
  key: string;
  label: string;
  type: "category" | "number";
  /** Distinct values + counts (category columns only). */
  options?: FacetOption[];
};

/** True when a filter actually constrains anything (used to decide chip / count). */
export function isFilterActive(f: ColFilter | undefined): boolean {
  if (!f) return false;
  if (f.type === "category") return f.values.length > 0;
  return f.min.trim() !== "" || f.max.trim() !== "";
}

function emptyFor(col: FacetColumn): ColFilter {
  return col.type === "number" ? { type: "number", min: "", max: "" } : { type: "category", values: [] };
}

function summarize(col: FacetColumn, f: ColFilter): string {
  if (f.type === "number") {
    const min = f.min.trim();
    const max = f.max.trim();
    if (min && max) return `${min} – ${max}`;
    if (min) return `≥ ${min}`;
    if (max) return `≤ ${max}`;
    return "aralık";
  }
  if (f.values.length === 0) return "seç…";
  if (f.values.length === 1) {
    const v = f.values[0];
    return v.length > 22 ? `${v.slice(0, 22)}…` : v;
  }
  return `${f.values.length} seçili`;
}

function CategoryControl({
  options,
  values,
  onChange,
}: {
  options: FacetOption[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? options.filter((o) => o.value.toLowerCase().includes(needle)) : options;
  }, [options, q]);
  const selected = new Set(values);

  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange([...next]);
  };

  return (
    <div className="space-y-2">
      {options.length > 8 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara…"
            className="h-8 pl-8 text-sm"
            aria-label="Seçenek ara"
          />
        </div>
      )}
      <div className="max-h-60 space-y-0.5 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="px-2 py-3 text-center text-xs text-[var(--muted-foreground)]">Seçenek yok</p>
        )}
        {filtered.map((o) => {
          const on = selected.has(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--muted)]"
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                  on
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)]",
                )}
              >
                {on && <Check className="h-3 w-3" />}
              </span>
              <span className="min-w-0 flex-1 truncate" title={o.value}>
                {o.value}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-[var(--muted-foreground)]">{o.count}</span>
            </button>
          );
        })}
      </div>
      {values.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="w-full rounded-md border border-[var(--border)] py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          Seçimi temizle
        </button>
      )}
    </div>
  );
}

function NumberControl({
  value,
  onChange,
}: {
  value: { min: string; max: string };
  onChange: (v: { min: string; max: string }) => void;
}) {
  return (
    <div className="flex items-end gap-2">
      <label className="min-w-0 flex-1 text-xs font-medium text-[var(--muted-foreground)]">
        En az
        <Input
          inputMode="decimal"
          value={value.min}
          onChange={(e) => onChange({ ...value, min: e.target.value })}
          placeholder="0"
          className="mt-1 h-8 tabular-nums"
        />
      </label>
      <span className="pb-1.5 text-[var(--muted-foreground)]">—</span>
      <label className="min-w-0 flex-1 text-xs font-medium text-[var(--muted-foreground)]">
        En çok
        <Input
          inputMode="decimal"
          value={value.max}
          onChange={(e) => onChange({ ...value, max: e.target.value })}
          placeholder="Sınırsız"
          className="mt-1 h-8 tabular-nums"
        />
      </label>
    </div>
  );
}

function FilterChip({
  col,
  filter,
  open,
  onOpenChange,
  onChange,
  onRemove,
}: {
  col: FacetColumn;
  filter: ColFilter;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onChange: (f: ColFilter) => void;
  onRemove: () => void;
}) {
  const active = isFilterActive(filter);
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border text-sm shadow-sm",
        active ? "border-[var(--primary)]/40 bg-[var(--primary)]/5" : "border-[var(--border)] bg-white",
      )}
    >
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button type="button" className="flex items-center gap-1.5 rounded-l-lg px-2.5 py-1.5">
            <span className="font-medium text-[var(--foreground)]">{col.label}</span>
            <span className="text-[var(--muted-foreground)]">·</span>
            <span className={cn(active ? "font-medium text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>
              {summarize(col, filter)}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <p className="mb-2 text-xs font-semibold text-[var(--muted-foreground)]">{col.label}</p>
          {col.type === "number" ? (
            <NumberControl
              value={filter.type === "number" ? filter : { min: "", max: "" }}
              onChange={(v) => onChange({ type: "number", ...v })}
            />
          ) : (
            <CategoryControl
              options={col.options ?? []}
              values={filter.type === "category" ? filter.values : []}
              onChange={(values) => onChange({ type: "category", values })}
            />
          )}
        </PopoverContent>
      </Popover>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${col.label} filtresini kaldır`}
        className="rounded-r-lg px-1.5 py-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function TableFacetedFilters({
  columns,
  value,
  onChange,
  onClearAll,
}: {
  columns: FacetColumn[];
  value: Record<string, ColFilter>;
  onChange: (key: string, filter: ColFilter | null) => void;
  onClearAll: () => void;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const activeKeys = columns.map((c) => c.key).filter((k) => k in value);
  const inactive = columns.filter((c) => !(c.key in value));
  const anyActive = activeKeys.some((k) => isFilterActive(value[k]));

  if (columns.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        <Filter className="h-3.5 w-3.5" />
        Filtreler
      </span>

      {activeKeys.map((key) => {
        const col = columns.find((c) => c.key === key)!;
        return (
          <FilterChip
            key={key}
            col={col}
            filter={value[key]}
            open={openKey === key}
            onOpenChange={(o) => setOpenKey(o ? key : null)}
            onChange={(f) => onChange(key, f)}
            onRemove={() => onChange(key, null)}
          />
        );
      })}

      {inactive.length > 0 && (
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-8 border-dashed">
              <Plus className="h-3.5 w-3.5" />
              Filtre ekle
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-1.5">
            <p className="px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)]">Filtrelenecek sütun</p>
            <div className="max-h-64 overflow-y-auto">
              {inactive.map((col) => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => {
                    onChange(col.key, emptyFor(col));
                    setAddOpen(false);
                    setOpenKey(col.key); // yeni filtreyi hemen aç
                  }}
                  className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--muted)]"
                >
                  {col.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {anyActive && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-[var(--muted-foreground)]"
          onClick={onClearAll}
        >
          <X className="h-3.5 w-3.5" />
          Temizle
        </Button>
      )}
    </div>
  );
}
