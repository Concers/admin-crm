"use client";

import { useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { GiderMerkeziDonem } from "./gider-merkezi-rows";

const DONEM_SECENEKLERI: { value: GiderMerkeziDonem; label: string }[] = [
  { value: "yil", label: "Bu yıl (varsayılan)" },
  { value: "ay", label: "Bu ay" },
  { value: "3ay", label: "Son 3 ay" },
  { value: "12ay", label: "Son 12 ay" },
];

export function GiderMerkeziDonemSecici({
  selected,
  donemLabel,
}: {
  selected: GiderMerkeziDonem;
  donemLabel: string;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03]">
      <div className="border-b border-[var(--border)]/70 bg-gradient-to-r from-[var(--accent)]/60 to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
            <CalendarRange className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Dönem Seçimi</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Seçili: {donemLabel} — önceki dönemle karşılaştırılır
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Rapor dönemi
        </label>
        <Select
          className={cn(
            "h-11 w-full max-w-xs appearance-none rounded-xl border-[var(--border)] bg-white text-sm shadow-sm",
            "focus-visible:border-[var(--primary)]/40 focus-visible:ring-[var(--primary)]/20"
          )}
          value={selected}
          onChange={(e) => {
            router.push(`/raporlar/gider-merkezi?donem=${e.target.value}`);
          }}
        >
          {DONEM_SECENEKLERI.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
