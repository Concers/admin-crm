"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GitCompare, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

/**
 * Birden fazla ürün seçip karşılaştırma moduna geçiren çok-seçimli denetim.
 * Seçim yerel tutulur; "Karşılaştır" ile `?kar=A,B` adresine yönlendirilir.
 */
export function UrunKarsilastirSecici({
  products,
  selected,
}: {
  products: string[];
  selected: string[];
}) {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(selected);
  const [toAdd, setToAdd] = useState("");

  const available = products.filter((p) => !picked.includes(p));

  function add(name: string) {
    if (!name || picked.includes(name)) return;
    setPicked((prev) => [...prev, name]);
    setToAdd("");
  }
  function remove(name: string) {
    setPicked((prev) => prev.filter((p) => p !== name));
  }
  function compare() {
    if (picked.length < 2) return;
    router.push(`/raporlar/urun?kar=${encodeURIComponent(picked.join(","))}`);
  }
  function clear() {
    setPicked([]);
    router.push("/raporlar/urun?liste=1");
  }

  const active = selected.length >= 2;
  const dirty = picked.join(",") !== selected.join(",");

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03]">
      <div className="border-b border-[var(--border)]/70 bg-gradient-to-r from-[var(--accent)]/60 to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
            <GitCompare className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Ürünleri Karşılaştır</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Birden fazla ürün seçin — satış, alım, kâr ve marjı yan yana görün
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {picked.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {picked.map((p) => (
              <span
                key={p}
                className="inline-flex max-w-[18rem] items-center gap-1 rounded-full bg-[var(--primary)]/10 py-1 pl-2.5 pr-1 text-xs font-medium text-[var(--primary)] ring-1 ring-[var(--primary)]/20"
              >
                <span className="truncate">{p}</span>
                <button
                  type="button"
                  onClick={() => remove(p)}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-[var(--primary)]/20"
                  aria-label={`${p} kaldır`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Select
              value={toAdd}
              onChange={(e) => add(e.target.value)}
              aria-label="Karşılaştırmaya ürün ekle"
              disabled={available.length === 0}
              className="h-10 w-full appearance-none rounded-lg border-[var(--border)] bg-white pr-9 text-sm shadow-sm"
            >
              <option value="">
                {available.length === 0 ? "Tüm ürünler eklendi" : "Ürün ekle…"}
              </option>
              {available.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
            <Plus className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          </div>

          <Button
            type="button"
            onClick={compare}
            disabled={picked.length < 2 || (active && !dirty)}
            className="h-10"
          >
            <GitCompare className="h-4 w-4" />
            {active ? "Güncelle" : "Karşılaştır"}
            {picked.length > 0 && <span className="tabular-nums">({picked.length})</span>}
          </Button>

          {(picked.length > 0 || active) && (
            <Button type="button" variant="ghost" onClick={clear} className="h-10 text-[var(--muted-foreground)]">
              <X className="h-4 w-4" />
              Temizle
            </Button>
          )}
        </div>

        {picked.length < 2 && (
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Karşılaştırma için en az 2 ürün seçin.
          </p>
        )}
      </div>
    </div>
  );
}
