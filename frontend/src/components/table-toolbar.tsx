"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Banknote,
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const fieldControlClass =
  "h-9 w-full min-w-0 rounded-lg border-[var(--border)] bg-white text-sm shadow-sm transition-[border-color,box-shadow] hover:border-[var(--primary)]/30 focus:border-[var(--primary)]/50";

function ToolbarField({
  label,
  children,
  active,
}: {
  label: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-[128px] flex-1 rounded-xl border p-2.5 transition-colors sm:min-w-[148px] sm:max-w-[210px]",
        active
          ? "border-[var(--primary)]/35 bg-[var(--primary)]/[0.06] shadow-[0_0_0_1px_rgba(153,104,136,0.08)]"
          : "border-[var(--border)]/80 bg-white/80 hover:border-[var(--border)]"
      )}
    >
      <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            active ? "bg-[var(--primary)]" : "bg-[var(--border)]"
          )}
        />
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  active,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  active?: boolean;
}) {
  return (
    <ToolbarField label={label} active={active}>
      <div className="relative">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className={cn(
            fieldControlClass,
            "appearance-none pr-8",
            active && "border-[var(--primary)]/40 font-medium text-[var(--foreground)]"
          )}
        >
          <option value="">Tümü</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.length > 32 ? `${opt.slice(0, 32)}…` : opt}
            </option>
          ))}
        </Select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
      </div>
    </ToolbarField>
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
  count,
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
  count?: number;
}) {
  const primary = columnFilters ?? [];
  const inlineLimit = 4;
  const inlineFilters = primary.slice(0, inlineLimit);
  const extraFilters = primary.slice(inlineLimit);
  const hasExtra = extraFilters.length > 0;
  const hasAmount = (amountFields?.length ?? 0) > 0;
  const amountActive = Boolean(amountMin || amountMax);
  const activeColumnCount = primary.filter((f) => f.value).length;
  const activePills = primary.filter((f) => f.value);
  const [extraOpen, setExtraOpen] = useState(false);

  const hasControls =
    inlineFilters.length > 0 || hasExtra || hasAmount || showSort;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_4px_24px_-8px_rgba(42,43,42,0.12)] ring-1 ring-black/[0.03]">
      {/* Üst şerit */}
      <div className="relative border-b border-[var(--border)]/70 bg-gradient-to-r from-[var(--accent)]/80 via-white to-[var(--primary)]/[0.07] px-4 py-3 sm:px-5">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--primary)] to-[#c99da3]" />
        <div className="flex flex-wrap items-center justify-between gap-3 pl-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[var(--border)]/60">
              <SlidersHorizontal className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
                Filtrele & Ara
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Tabloyu daraltmak için kriter seçin
              </p>
            </div>
            {activeFilterCount > 0 && (
              <Badge tone="indigo" className="tabular-nums shadow-sm">
                {activeFilterCount} aktif
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {typeof count === "number" && (
              <div className="rounded-full bg-white/90 px-3 py-1 text-xs shadow-sm ring-1 ring-[var(--border)]/60">
                <span className="font-semibold text-[var(--primary)]">{count}</span>
                <span className="text-[var(--muted-foreground)]"> kayıt</span>
              </div>
            )}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 border-[var(--border)] bg-white/90 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={onClear}
              >
                <X className="h-3.5 w-3.5" />
                Temizle
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-gradient-to-b from-[var(--muted)]/25 to-white p-4 sm:p-5">
        {showSearch && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--primary)]/70" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "h-11 rounded-xl border-[var(--border)] bg-white pl-10 pr-4 shadow-sm",
                "placeholder:text-[var(--muted-foreground)]/80",
                "focus-visible:border-[var(--primary)]/40 focus-visible:ring-[var(--primary)]/20",
                query && "border-[var(--primary)]/35 ring-1 ring-[var(--primary)]/15"
              )}
              aria-label="Tabloda ara"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Aramayı temizle"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {hasControls && (
          <div className="space-y-3">
            {inlineFilters.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  <Filter className="h-3 w-3" />
                  Önemli filtreler
                </p>
                <div className="flex flex-wrap items-stretch gap-2">
                  {inlineFilters.map((f) => (
                    <SelectField
                      key={f.key}
                      label={f.label}
                      value={f.value}
                      options={f.options}
                      onChange={f.onChange}
                      active={Boolean(f.value)}
                    />
                  ))}

                  {hasExtra && (
                    <div className="flex items-end pb-0.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-[62px] rounded-xl border-dashed px-3 shadow-sm",
                          extraOpen && "border-[var(--primary)]/40 bg-[var(--primary)]/[0.05]"
                        )}
                        onClick={() => setExtraOpen((o) => !o)}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
                        +{extraFilters.length} filtre
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            extraOpen && "rotate-180"
                          )}
                        />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(hasAmount || showSort) && (
              <div className="flex flex-wrap items-end gap-2">
                {hasAmount && (
                  <div
                    className={cn(
                      "flex flex-wrap items-end gap-2 rounded-xl border p-3 shadow-sm",
                      amountActive
                        ? "border-[var(--primary)]/30 bg-[var(--primary)]/[0.04]"
                        : "border-[var(--border)]/80 bg-white/90"
                    )}
                  >
                    <div className="mb-1 flex w-full items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                      <Banknote className="h-3 w-3 text-[var(--primary)]" />
                      Tutar aralığı
                    </div>
                    {amountFields!.length > 1 && (
                      <ToolbarField label="Alan" active={amountActive}>
                        <div className="relative">
                          <Select
                            value={amountField}
                            onChange={(e) => onAmountFieldChange(e.target.value)}
                            className={cn(fieldControlClass, "appearance-none pr-8 min-w-[120px]")}
                          >
                            {amountFields!.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.label}
                              </option>
                            ))}
                          </Select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
                        </div>
                      </ToolbarField>
                    )}
                    <ToolbarField label="Min ₺" active={Boolean(amountMin)}>
                      <Input
                        inputMode="decimal"
                        value={amountMin}
                        onChange={(e) => onAmountMinChange(e.target.value)}
                        placeholder="0"
                        className={cn(fieldControlClass, "w-24 tabular-nums")}
                      />
                    </ToolbarField>
                    <ToolbarField label="Max ₺" active={Boolean(amountMax)}>
                      <Input
                        inputMode="decimal"
                        value={amountMax}
                        onChange={(e) => onAmountMaxChange(e.target.value)}
                        placeholder="∞"
                        className={cn(fieldControlClass, "w-24 tabular-nums")}
                      />
                    </ToolbarField>
                  </div>
                )}

                {showSort && sortableColumns.length > 0 && (
                  <div className="flex flex-wrap items-end gap-2 rounded-xl border border-[var(--border)]/80 bg-white/90 p-3 shadow-sm">
                    <div className="mb-1 flex w-full items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                      <ArrowUpDown className="h-3 w-3 text-[var(--primary)]" />
                      Sıralama
                    </div>
                    <ToolbarField label="Sütun" active={Boolean(sortKey)}>
                      <div className="relative">
                        <Select
                          value={sortKey ?? ""}
                          onChange={(e) => onSortKeyChange(e.target.value || null)}
                          className={cn(fieldControlClass, "min-w-[130px] appearance-none pr-8")}
                        >
                          <option value="">Varsayılan</option>
                          {sortableColumns.map((c) => (
                            <option key={c.key} value={c.key}>
                              {c.label}
                            </option>
                          ))}
                        </Select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      </div>
                    </ToolbarField>
                    <div className="pb-0.5">
                      <div className="flex rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-0.5 shadow-inner">
                        <button
                          type="button"
                          disabled={!sortKey}
                          className={cn(
                            "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                            asc && sortKey
                              ? "bg-white text-[var(--foreground)] shadow-sm"
                              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          )}
                          onClick={() => onAscChange(true)}
                        >
                          <ArrowUp className="h-3 w-3" />
                          Artan
                        </button>
                        <button
                          type="button"
                          disabled={!sortKey}
                          className={cn(
                            "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                            !asc && sortKey
                              ? "bg-white text-[var(--foreground)] shadow-sm"
                              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          )}
                          onClick={() => onAscChange(false)}
                        >
                          <ArrowDown className="h-3 w-3" />
                          Azalan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {extraOpen && extraFilters.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-dashed border-[var(--primary)]/25 bg-[var(--primary)]/[0.03] p-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Ek filtreler
            </p>
            <div className="flex flex-wrap items-stretch gap-2">
              {extraFilters.map((f) => (
                <SelectField
                  key={f.key}
                  label={f.label}
                  value={f.value}
                  options={f.options}
                  onChange={f.onChange}
                  active={Boolean(f.value)}
                />
              ))}
            </div>
          </div>
        )}

        {(activePills.length > 0 || amountActive || query) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)]/60 pt-3">
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Uygulanan:</span>
            {query && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] ring-1 ring-[var(--border)]/50">
                <Search className="h-3 w-3 text-[var(--primary)]" />
                &ldquo;{query.length > 20 ? `${query.slice(0, 20)}…` : query}&rdquo;
              </span>
            )}
            {activePills.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--primary)] ring-1 ring-[var(--primary)]/20"
              >
                {f.label}: {f.value.length > 18 ? `${f.value.slice(0, 18)}…` : f.value}
              </span>
            ))}
            {amountActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                <Banknote className="h-3 w-3" />
                {amountMin || "0"} – {amountMax || "∞"} ₺
              </span>
            )}
          </div>
        )}

        {activeColumnCount > 0 && !activePills.length && !query && !amountActive && (
          <p className="text-xs text-[var(--muted-foreground)]">
            {activeColumnCount} önemli filtre aktif
          </p>
        )}
      </div>
    </div>
  );
}
