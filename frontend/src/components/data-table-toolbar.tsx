"use client";

import { ArrowDown, ArrowDownUp, ArrowUp, Banknote, Search, X } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ToolbarSelect = {
  key: string;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
};

export type ToolbarAmount = {
  fields: { id: string; label: string }[];
  field: string;
  onField: (v: string) => void;
  min: string;
  max: string;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
  active: boolean;
};

export type ToolbarSort = {
  columns: { key: string; label: string }[];
  sortKey: string | null;
  asc: boolean;
  onToggle: (key: string) => void;
  onDir: (asc: boolean) => void;
};

/**
 * Compact, single-row table toolbar: search + inline filter dropdowns +
 * (optional) amount-range popover + a "Sıralama" dropdown + clear + count.
 * Shared across every DataTable so all list pages get the same filter UX.
 */
export function DataTableToolbar({
  showSearch,
  searchPlaceholder,
  query,
  onQueryChange,
  selects,
  amount,
  sort,
  count,
  hasActiveFilters,
  onClear,
}: {
  showSearch: boolean;
  searchPlaceholder?: string;
  query: string;
  onQueryChange: (v: string) => void;
  selects: ToolbarSelect[];
  amount?: ToolbarAmount;
  sort?: ToolbarSort;
  count: number;
  hasActiveFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showSearch && (
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-9"
            aria-label="Tabloda ara"
          />
        </div>
      )}

      {selects.map((s) => (
        <Select
          key={s.key}
          value={s.value}
          onChange={(e) => s.onChange(e.target.value)}
          aria-label={s.label}
          className={cn("h-9 w-auto min-w-[110px] max-w-[200px]", s.value && "border-[var(--primary)]/50 text-[var(--foreground)]")}
        >
          <option value="">{s.label}: Tümü</option>
          {s.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.length > 36 ? `${opt.slice(0, 36)}…` : opt}
            </option>
          ))}
        </Select>
      ))}

      {amount && amount.fields.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("h-9", amount.active && "border-[var(--primary)]/50 text-[var(--primary)]")}
            >
              <Banknote className="h-3.5 w-3.5" />
              Tutar
              {amount.active && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 space-y-3">
            {amount.fields.length > 1 && (
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Hangi tutar</label>
                <Select value={amount.field} onChange={(e) => amount.onField(e.target.value)} className="h-9 w-full">
                  {amount.fields.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </Select>
              </div>
            )}
            <div className="flex items-end gap-2">
              <label className="min-w-0 flex-1 text-xs font-medium text-[var(--muted-foreground)]">
                En az (₺)
                <Input inputMode="decimal" value={amount.min} onChange={(e) => amount.onMin(e.target.value)} placeholder="0" className="mt-1 h-9 tabular-nums" />
              </label>
              <span className="pb-2 text-[var(--muted-foreground)]">—</span>
              <label className="min-w-0 flex-1 text-xs font-medium text-[var(--muted-foreground)]">
                En çok (₺)
                <Input inputMode="decimal" value={amount.max} onChange={(e) => amount.onMax(e.target.value)} placeholder="∞" className="mt-1 h-9 tabular-nums" />
              </label>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {sort && sort.columns.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <ArrowDownUp className="h-3.5 w-3.5" />
              Sıralama
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
            <DropdownMenuLabel>Sütuna göre</DropdownMenuLabel>
            {sort.columns.map((c) => (
              <DropdownMenuItem key={c.key} onSelect={() => sort.onToggle(c.key)}>
                {sort.sortKey === c.key ? (
                  sort.asc ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                ) : (
                  <ArrowDownUp className="h-4 w-4 opacity-40" />
                )}
                {c.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => sort.onDir(true)}>
              <ArrowUp className="h-4 w-4" /> Artan
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => sort.onDir(false)}>
              <ArrowDown className="h-4 w-4" /> Azalan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="h-9 text-[var(--muted-foreground)]" onClick={onClear}>
          <X className="h-3.5 w-3.5" />
          Temizle
        </Button>
      )}

      <span className="ml-auto whitespace-nowrap text-xs text-[var(--muted-foreground)]">
        <span className="font-medium text-[var(--foreground)]">{count}</span> kayıt
      </span>
    </div>
  );
}
