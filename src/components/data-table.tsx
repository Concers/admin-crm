"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

export function DataTable<T extends Record<string, unknown>>({
  rows,
  columns,
  onRowClick,
  searchKeys,
  emptyText = "Kayıt bulunamadı.",
}: {
  rows: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  searchKeys?: (keyof T)[];
  emptyText?: string;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [asc, setAsc] = useState(true);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let data = rows;
    if (q && searchKeys) {
      data = data.filter((row) =>
        searchKeys.some((k) =>
          String(row[k] ?? "").toLowerCase().includes(q)
        )
      );
    }
    if (sortKey) {
      data = [...data].sort((a, b) => {
        const av = String(a[sortKey] ?? "").toLowerCase();
        const bv = String(b[sortKey] ?? "").toLowerCase();
        return asc ? av.localeCompare(bv, "tr") : bv.localeCompare(av, "tr");
      });
    }
    return data;
  }, [rows, query, searchKeys, sortKey, asc]);

  return (
    <div className="space-y-4">
      {searchKeys && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ara..."
            className="pl-9"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)] text-left text-[var(--muted-foreground)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium ${col.sortable !== false ? "cursor-pointer select-none" : ""}`}
                  onClick={() => {
                    if (col.sortable === false) return;
                    if (sortKey === col.key) setAsc(!asc);
                    else {
                      setSortKey(col.key);
                      setAsc(true);
                    }
                  }}
                >
                  {col.label}
                  {sortKey === col.key ? (asc ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-[var(--muted-foreground)]"
                >
                  {emptyText}
                </td>
              </tr>
            )}
            {filtered.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-[var(--border)] last:border-0 ${onRowClick ? "cursor-pointer hover:bg-[var(--muted)]" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">
        {filtered.length} kayıt gösteriliyor
      </p>
    </div>
  );
}
