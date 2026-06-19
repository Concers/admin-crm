"use client";

import { useMemo, useState, useTransition } from "react";
import { PackageSearch, Plus, Search, Trash2, Warehouse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addShelf, removeShelf } from "./shelf-actions";

export type RafUrun = { product: string; shelf: string | null; unit: string; stock: number };
export type BosRaf = { id: number; code: string; location: string | null; notes: string | null };

const NO_SHELF = "Rafsız";

/**
 * Ürünleri rafa göre gruplar; rafa veya ürün adına göre arama yapılır.
 * Boş raflar (Shelf modeli) ayrı bölümde listelenir.
 */
export function RafTakibiView({
  rows,
  emptyShelves,
}: {
  rows: RafUrun[];
  emptyShelves: BosRaf[];
}) {
  const [query, setQuery] = useState("");
  const [showShelfForm, setShowShelfForm] = useState(false);
  const [pending, startTransition] = useTransition();

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
      .sort((a, b) => {
        if (a.shelf === NO_SHELF) return 1;
        if (b.shelf === NO_SHELF) return -1;
        return a.shelf.localeCompare(b.shelf, "tr");
      });
  }, [filtered]);

  const shelfCount = groups.filter((g) => g.shelf !== NO_SHELF).length;

  return (
    <div className="space-y-6">
      {emptyShelves.length > 0 && (
        <Card className="border-dashed border-amber-200 bg-amber-50/40">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-950">Boş Raflar ({emptyShelves.length})</p>
            <p className="mt-1 text-xs text-amber-800/80">
              Tanımlı ancak ürün atanmamış raf lokasyonları.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {emptyShelves.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-900"
                >
                  {s.code}
                  {s.location ? (
                    <span className="font-normal text-amber-700">· {s.location}</span>
                  ) : null}
                  <button
                    type="button"
                    className="ml-1 text-amber-600 hover:text-[var(--danger)]"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(`"${s.code}" rafını silmek istiyor musunuz?`)) return;
                      startTransition(async () => {
                        await removeShelf(s.id);
                      });
                    }}
                    aria-label={`${s.code} rafını sil`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Raf veya ürün ara..."
            className="pl-9"
            aria-label="Raf veya ürün ara"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowShelfForm((v) => !v)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Raf Ekle
        </Button>
      </div>

      {showShelfForm && (
        <Card>
          <CardContent className="p-4">
            <form
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                startTransition(async () => {
                  const res = await addShelf(fd);
                  if (!res.error) {
                    e.currentTarget.reset();
                    setShowShelfForm(false);
                  }
                });
              }}
            >
              <div>
                <Label htmlFor="shelf-code">Raf Kodu *</Label>
                <Input id="shelf-code" name="code" required placeholder="A-01" />
              </div>
              <div>
                <Label htmlFor="shelf-location">Lokasyon</Label>
                <Input id="shelf-location" name="location" placeholder="Depo 1 — Koridor A" />
              </div>
              <div>
                <Label htmlFor="shelf-notes">Not</Label>
                <Input id="shelf-notes" name="notes" placeholder="Opsiyonel" />
              </div>
              <div className="sm:col-span-3">
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? "Kaydediliyor…" : "Raf Kaydet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-[var(--muted-foreground)]">
        <span className="font-medium text-[var(--foreground)]">{shelfCount}</span> dolu raf ·{" "}
        <span className="font-medium text-[var(--foreground)]">{emptyShelves.length}</span> boş raf ·{" "}
        <span className="font-medium text-[var(--foreground)]">{filtered.length}</span> ürün
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
