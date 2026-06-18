"use client";

import { useMemo, useState } from "react";
import { Search, Warehouse, PackageSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type RafUrun = { product: string; shelf: string | null; unit: string; stock: number };

const NO_SHELF = "Rafsız";

/**
 * Ürünleri rafa göre gruplar; rafa veya ürün adına göre arama yapılır.
 * "Bu üründe hangi raf?" ve "Bu rafta neler var?" sorularının ikisini de cevaplar.
 */
export function RafTakibiView({ rows }: { rows: RafUrun[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.product.toLowerCase().includes(q) || (r.shelf ?? NO_SHELF).toLowerCase().includes(q),
    );
  }, [rows, query]);

  const groups = useMemo(() => {
    const map = new Map<string, RafUrun[]>();
    for (const r of filtered) {
      const key = r.shelf?.trim() || NO_SHELF;
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return [...map.entries()]
      .map(([shelf, items]) => ({
        shelf,
        items: items.slice().sort((a, b) => a.product.localeCompare(b.product, "tr")),
        totalStock: items.reduce((s, i) => s + i.stock, 0),
      }))
      // Gerçek raflar önce, "Rafsız" en sonda; sonra rafa göre alfabetik.
      .sort((a, b) => {
        if (a.shelf === NO_SHELF) return 1;
        if (b.shelf === NO_SHELF) return -1;
        return a.shelf.localeCompare(b.shelf, "tr");
      });
  }, [filtered]);

  const shelfCount = groups.filter((g) => g.shelf !== NO_SHELF).length;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Raf veya ürün ara..."
          className="pl-9"
          aria-label="Raf veya ürün ara"
        />
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        <span className="font-medium text-[var(--foreground)]">{shelfCount}</span> raf ·{" "}
        <span className="font-medium text-[var(--foreground)]">{filtered.length}</span> ürün gösteriliyor
      </p>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-6 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)]">
            <PackageSearch className="h-6 w-6 text-[var(--muted-foreground)]" />
          </div>
          <p className="text-sm font-medium">Sonuç bulunamadı</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            &quot;{query}&quot; ile eşleşen raf veya ürün yok.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.shelf}>
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
                      <Warehouse className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold">{g.shelf}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{g.items.length} ürün</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[var(--muted-foreground)]">
                    Σ {g.totalStock.toLocaleString("tr-TR")}
                  </span>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {g.items.map((item) => (
                    <div key={item.product} className="flex items-center justify-between gap-3 px-5 py-2.5">
                      <span className="min-w-0 truncate text-sm">{item.product}</span>
                      <span className="shrink-0 text-sm font-medium tabular-nums">
                        {item.stock.toLocaleString("tr-TR")}{" "}
                        <span className="text-xs font-normal text-[var(--muted-foreground)]">{item.unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
