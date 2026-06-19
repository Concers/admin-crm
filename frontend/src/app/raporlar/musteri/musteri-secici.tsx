"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Users } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function MusteriSecici({
  customers,
  selected,
  listeMod,
}: {
  customers: string[];
  selected: string;
  listeMod?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03]">
      <div className="border-b border-[var(--border)]/70 bg-gradient-to-r from-[var(--accent)]/60 to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Müşteri Seçin</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Excel&apos;deki gibi tek cari detayı — tüm müşteriler için özet listeyi seçin
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Müşteri / Cari
        </label>
        <div className="relative">
          <Select
            className={cn(
              "h-11 w-full max-w-xl appearance-none rounded-xl border-[var(--border)] bg-white pr-10 text-sm shadow-sm",
              "focus-visible:border-[var(--primary)]/40 focus-visible:ring-[var(--primary)]/20"
            )}
            value={listeMod ? "" : selected}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) router.push("/raporlar/musteri?liste=1");
              else router.push(`/raporlar/musteri?ad=${encodeURIComponent(v)}`);
            }}
          >
            <option value="">Tüm müşteriler (özet liste)</option>
            {customers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        </div>
      </div>
    </div>
  );
}
