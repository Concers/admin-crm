"use client";

import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { NakitAkisHorizon } from "./nakit-akis-rows";

const AY_SECENEKLERI: { value: NakitAkisHorizon; label: string }[] = [
  { value: 3, label: "3 ay" },
  { value: 6, label: "6 ay (varsayılan)" },
  { value: 9, label: "9 ay" },
  { value: 12, label: "12 ay" },
];

export function NakitAkisAySecici({
  selected,
  horizonLabel,
}: {
  selected: NakitAkisHorizon;
  horizonLabel: string;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03]">
      <div className="border-b border-[var(--border)]/70 bg-gradient-to-r from-[var(--accent)]/60 to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
            <CalendarClock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Projeksiyon Süresi</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Önümüzdeki {horizonLabel} — tahsil edilmemiş alacak ve ödenmemiş borçlar
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Ay sayısı
        </label>
        <Select
          className={cn(
            "h-11 w-full max-w-xs appearance-none rounded-xl border-[var(--border)] bg-white text-sm shadow-sm",
            "focus-visible:border-[var(--primary)]/40 focus-visible:ring-[var(--primary)]/20"
          )}
          value={String(selected)}
          onChange={(e) => {
            router.push(`/raporlar/nakit-akis?ay=${e.target.value}`);
          }}
        >
          {AY_SECENEKLERI.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
