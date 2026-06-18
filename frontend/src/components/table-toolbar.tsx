"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDownUp,
  Banknote,
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const fieldControlClass =
  "h-9 w-full rounded-lg border-[var(--border)] bg-white text-sm shadow-sm transition-shadow focus:shadow-md";

function ToolbarField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-[var(--muted-foreground)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToolbarGroup({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--border)]/80 bg-white/70 p-3.5 shadow-sm backdrop-blur-sm sm:p-4",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Icon className="h-4 w-4" />
        </span>
        <h4 className="text-sm font-semibold text-[var(--foreground)]">{title}</h4>
      </div>
      {children}
    </section>
  );
}

export type TableToolbarFilter = {
  key: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export type TableToolbarAmountField = {
  id: string;
  label: string;
};

export function TableToolbar({
  showSearch = true,
  searchPlaceholder,
  query,
  onQueryChange,
  columnFilters,
  amountFields,
  amountField,
  onAmountFieldChange,
  amountMin,
  amountMax,
  onAmountMinChange,
  onAmountMaxChange,
  sortableColumns,
  sortKey,
  onSortKeyChange,
  asc,
  onAscChange,
  showSort,
  activeFilterCount,
  hasActiveFilters,
  onClear,
}: {
  searchPlaceholder?: string;
  query: string;
  onQueryChange: (v: string) => void;
  columnFilters?: TableToolbarFilter[];
  amountFields?: TableToolbarAmountField[];
  amountField: string;
  onAmountFieldChange: (v: string) => void;
  amountMin: string;
  amountMax: string;
  onAmountMinChange: (v: string) => void;
  onAmountMaxChange: (v: string) => void;
  sortableColumns: { key: string; label: string }[];
  sortKey: string | null;
  onSortKeyChange: (key: string | null) => void;
  asc: boolean;
  onAscChange: (asc: boolean) => void;
  showSort: boolean;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onClear: () => void;
  showSearch?: boolean;
}) {
  const hasColumnFilters = (columnFilters?.length ?? 0) > 0;
  const hasAmount = (amountFields?.length ?? 0) > 0;
  const activeColumnCount = columnFilters?.filter((f) => f.value).length ?? 0;
  const [columnsOpen, setColumnsOpen] = useState(
    () => (columnFilters?.length ?? 0) <= 8
  );

  const bottomGroupCount = [hasAmount, showSort].filter(Boolean).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)]/80 bg-gradient-to-br from-white via-white to-slate-50/90 shadow-sm ring-1 ring-black/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)]/60 bg-white/50 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-sm font-semibold text-[var(--foreground)]">Arama ve filtreler</span>
          {activeFilterCount > 0 && (
            <Badge tone="blue" className="tabular-nums">
              {activeFilterCount} aktif
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-[var(--muted-foreground)]"
            onClick={onClear}
          >
            <X className="h-3.5 w-3.5" />
            Tümünü temizle
          </Button>
        )}
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {showSearch && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 rounded-xl border-[var(--border)]/80 bg-white pl-10 shadow-sm"
              aria-label="Tabloda ara"
            />
          </div>
        )}

        {hasColumnFilters && (
          <div className="rounded-xl border border-[var(--border)]/80 bg-white/80 shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-[var(--muted)]/30"
              onClick={() => setColumnsOpen((o) => !o)}
              aria-expanded={columnsOpen}
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Filter className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-[var(--foreground)]">Sütun filtreleri</span>
                {activeColumnCount > 0 && (
                  <Badge tone="blue" className="tabular-nums">
                    {activeColumnCount}
                  </Badge>
                )}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform",
                  columnsOpen && "rotate-180"
                )}
              />
            </button>

            {columnsOpen && (
              <div className="border-t border-[var(--border)]/60 px-4 pb-4 pt-3">
                <div className="max-h-56 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {columnFilters!.map((f) => (
                      <ToolbarField key={f.key} label={f.label}>
                        <Select
                          value={f.value}
                          onChange={(e) => f.onChange(e.target.value)}
                          aria-label={f.label}
                          className={cn(
                            fieldControlClass,
                            f.value && "border-[var(--primary)]/40 ring-1 ring-[var(--primary)]/20"
                          )}
                        >
                          <option value="">Tümü</option>
                          {f.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.length > 40 ? `${opt.slice(0, 40)}…` : opt}
                            </option>
                          ))}
                        </Select>
                      </ToolbarField>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {bottomGroupCount > 0 && (
          <div
            className={cn(
              "grid gap-3",
              bottomGroupCount === 1 && "grid-cols-1",
              bottomGroupCount >= 2 && "md:grid-cols-2"
            )}
          >
            {hasAmount && (
              <ToolbarGroup icon={Banknote} title="Tutar aralığı">
                <div className="space-y-2.5">
                  {amountFields!.length > 1 && (
                    <ToolbarField label="Hangi tutar">
                      <Select
                        value={amountField}
                        onChange={(e) => onAmountFieldChange(e.target.value)}
                        className={fieldControlClass}
                      >
                        {amountFields!.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </Select>
                    </ToolbarField>
                  )}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                    <ToolbarField label="En az (₺)">
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={amountMin}
                        onChange={(e) => onAmountMinChange(e.target.value)}
                        className={cn(fieldControlClass, "tabular-nums")}
                      />
                    </ToolbarField>
                    <span className="pb-2.5 text-sm text-[var(--muted-foreground)]">—</span>
                    <ToolbarField label="En çok (₺)">
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Sınırsız"
                        value={amountMax}
                        onChange={(e) => onAmountMaxChange(e.target.value)}
                        className={cn(fieldControlClass, "tabular-nums")}
                      />
                    </ToolbarField>
                  </div>
                </div>
              </ToolbarGroup>
            )}

            {showSort && (
              <ToolbarGroup icon={ArrowDownUp} title="Sıralama">
                <div className="space-y-2.5">
                  <ToolbarField label="Sütuna göre">
                    <Select
                      value={sortKey ?? ""}
                      onChange={(e) => onSortKeyChange(e.target.value || null)}
                      className={fieldControlClass}
                    >
                      <option value="">Varsayılan sıra</option>
                      {sortableColumns.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </ToolbarField>
                  <ToolbarField label="Yön">
                    <div
                      className={cn(
                        "grid grid-cols-2 gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-1",
                        !sortKey && "pointer-events-none opacity-50"
                      )}
                    >
                      <button
                        type="button"
                        className={cn(
                          "rounded-md px-2 py-2 text-xs font-medium transition-all",
                          asc && sortKey
                            ? "bg-white text-[var(--foreground)] shadow-sm"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                        onClick={() => onAscChange(true)}
                      >
                        ↑ Artan
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "rounded-md px-2 py-2 text-xs font-medium transition-all",
                          !asc && sortKey
                            ? "bg-white text-[var(--foreground)] shadow-sm"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                        onClick={() => onAscChange(false)}
                      >
                        ↓ Azalan
                      </button>
                    </div>
                  </ToolbarField>
                </div>
              </ToolbarGroup>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
