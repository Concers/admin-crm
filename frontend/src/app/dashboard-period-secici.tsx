"use client";

import { useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DashboardHorizon } from "@/lib/api";

const SECENEKLER: { value: DashboardHorizon; label: string }[] = [
  { value: 3, label: "Son 3 ay" },
  { value: 6, label: "Son 6 ay" },
  { value: 9, label: "Son 9 ay" },
  { value: 12, label: "Son 12 ay" },
];

export function DashboardPeriodSecici({
  selected,
  variant = "default",
}: {
  selected: DashboardHorizon;
  variant?: "default" | "hero";
}) {
  const router = useRouter();
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2",
        isHero
          ? "border border-white/15 bg-white/10 backdrop-blur-md"
          : "border border-[var(--border)] bg-[var(--card)] shadow-sm",
      )}
    >
      <CalendarRange className={cn("h-4 w-4", isHero ? "text-white/80" : "text-[var(--primary)]")} />
      <label htmlFor="dashboard-horizon" className="sr-only">
        Dönem
      </label>
      <Select
        id="dashboard-horizon"
        className={cn(
          "h-8 min-w-[132px] border-0 bg-transparent text-sm font-medium shadow-none focus:ring-0",
          isHero ? "text-white" : "",
        )}
        value={String(selected)}
        onChange={(e) => {
          const v = e.target.value;
          router.push(v === "6" ? "/" : `/?ay=${v}`);
        }}
      >
        {SECENEKLER.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
