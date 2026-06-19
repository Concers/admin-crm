"use client";

import { useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { Select } from "@/components/ui/select";

const YEARS = [2024, 2025, 2026, 2027];

export function ButceYilSecici({ selected }: { selected: number }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03]">
      <div className="border-b border-[var(--border)]/70 bg-gradient-to-r from-[var(--accent)]/60 to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
            <CalendarRange className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Yıl Seçimi</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">{selected} bütçe hedefleri ve gerçekleşen</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <Select
          className="h-11 w-full max-w-xs rounded-xl border-[var(--border)] bg-white text-sm shadow-sm"
          value={String(selected)}
          onChange={(e) => router.push(`/raporlar/butce?yil=${e.target.value}`)}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
