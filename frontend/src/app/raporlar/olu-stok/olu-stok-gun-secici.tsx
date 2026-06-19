"use client";

import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const GUN_SECENEKLERI = [
  { value: "30", label: "30 gün" },
  { value: "60", label: "60 gün" },
  { value: "90", label: "90 gün (varsayılan)" },
  { value: "120", label: "120 gün" },
  { value: "180", label: "180 gün" },
] as const;

export function OluStokGunSecici({ selected }: { selected: number }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03]">
      <div className="border-b border-[var(--border)]/70 bg-gradient-to-r from-[var(--accent)]/60 to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
            <CalendarClock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Hareketsizlik Eşiği</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Bu süreden uzun süredir satılmayan stoklar ölü stok sayılır
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Son satıştan bu yana geçen süre
        </label>
        <Select
          className={cn(
            "h-11 w-full max-w-xs appearance-none rounded-xl border-[var(--border)] bg-white text-sm shadow-sm",
            "focus-visible:border-[var(--primary)]/40 focus-visible:ring-[var(--primary)]/20"
          )}
          value={String(selected)}
          onChange={(e) => {
            const gun = e.target.value;
            router.push(`/raporlar/olu-stok?gun=${gun}`);
          }}
        >
          {GUN_SECENEKLERI.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
