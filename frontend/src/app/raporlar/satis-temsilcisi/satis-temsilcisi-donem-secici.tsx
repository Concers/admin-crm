"use client";

import { useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DONEM = [
  { value: "all", label: "Tüm zamanlar" },
  { value: "ay", label: "Bu ay" },
  { value: "yil", label: "Bu yıl" },
  { value: "12ay", label: "Son 12 ay" },
];

export function SatisTemsilcisiDonemSecici({ selected, label }: { selected: string; label: string }) {
  const router = useRouter();
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="border-b border-[var(--border)]/70 bg-gradient-to-r from-[var(--accent)]/60 to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <CalendarRange className="h-5 w-5 text-[var(--primary)]" />
          <div>
            <p className="text-sm font-semibold">Dönem: {label}</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">Satış girişi yapan kullanıcıya göre performans</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <Select
          className={cn("h-11 max-w-xs rounded-xl border-[var(--border)] bg-white text-sm")}
          value={selected}
          onChange={(e) => router.push(`/raporlar/satis-temsilcisi?donem=${e.target.value}`)}
        >
          {DONEM.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
