"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { BudgetTarget } from "@/lib/api";
import { saveBudgetTarget } from "./actions";

const METRIC_LABELS: Record<string, string> = {
  SALES_REVENUE: "Satış (KDV hariç)",
  EXPENSE_TOTAL: "Toplam gider",
  EXPENSE_CATEGORY: "Gider türü",
};

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export function ButceHedefPanel({
  year,
  targets,
  categories,
}: {
  year: number;
  targets: BudgetTarget[];
  categories: string[];
}) {
  const [state, action, pending] = useActionState<{ error?: string } | null, FormData>(
    async (_prev, formData) => (await saveBudgetTarget(formData)) ?? null,
    null,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={action} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Hedef Ekle / Güncelle</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Aynı ay + tür kombinasyonu güncellenir.</p>
        <input type="hidden" name="year" value={year} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">Ay</label>
            <Select name="month" className="h-10 w-full rounded-lg border-[var(--border)]" defaultValue="1">
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">Tür</label>
            <Select name="metric" className="h-10 w-full rounded-lg border-[var(--border)]" defaultValue="SALES_REVENUE">
              <option value="SALES_REVENUE">Satış hedefi</option>
              <option value="EXPENSE_TOTAL">Toplam gider hedefi</option>
              <option value="EXPENSE_CATEGORY">Gider türü hedefi</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">Gider türü (opsiyonel)</label>
            <Select name="category" className="h-10 w-full rounded-lg border-[var(--border)]" defaultValue="">
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">Hedef tutar (₺)</label>
            <Input name="amount" type="number" min={0} step="0.01" required className="h-10" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">Not</label>
            <Input name="notes" className="h-10" placeholder="Opsiyonel" />
          </div>
        </div>
        {state?.error && <p className="mt-3 text-sm text-rose-700">{state.error}</p>}
        <Button type="submit" className="mt-4" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Hedefi kaydet"}
        </Button>
      </form>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Tanımlı hedefler ({targets.length})</h2>
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
          {targets.length === 0 && (
            <li className="text-[var(--muted-foreground)]">Henüz hedef yok.</li>
          )}
          {targets.map((t) => (
            <li key={t.id} className="flex items-start justify-between gap-2 rounded-lg border border-[var(--border)]/70 px-3 py-2">
              <div>
                <p className="font-medium">{MONTHS[t.month - 1]} — {METRIC_LABELS[t.metric]}</p>
                {t.category && <p className="text-xs text-[var(--muted-foreground)]">{t.category}</p>}
                <p className="tabular-nums text-[var(--primary)]">{t.amount.toLocaleString("tr-TR")} ₺</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
