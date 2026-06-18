"use client";

import { useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ayAdi } from "@/lib/calculations";

export function KdvDonemFilter({
  ay,
  yil,
  years,
  defaultAy,
  defaultYil,
}: {
  ay?: number;
  yil?: number;
  years: number[];
  defaultAy: number;
  defaultYil: number;
}) {
  const router = useRouter();

  function apply(form: HTMLFormElement) {
    const fd = new FormData(form);
    const nextAy = String(fd.get("ay") ?? "").trim();
    const nextYil = String(fd.get("yil") ?? "").trim();
    const params = new URLSearchParams();
    if (nextAy) params.set("month", nextAy);
    if (nextYil) params.set("year", nextYil);
    const qs = params.toString();
    router.push(qs ? `/raporlar/vat?${qs}` : "/raporlar/vat");
  }

  const hasFilter = ay !== defaultAy || yil !== defaultYil;

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
        <CalendarRange className="h-4 w-4 text-[var(--muted-foreground)]" />
        KDV Beyan Dönemi
      </div>
      <div>
        <Label htmlFor="kdv-filter-ay" className="text-xs uppercase tracking-wide">
          Ay
        </Label>
        <Select
          id="kdv-filter-ay"
          name="ay"
          defaultValue={String(ay ?? defaultAy)}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {ayAdi(m)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="kdv-filter-yil" className="text-xs uppercase tracking-wide">
          Yıl
        </Label>
        <Select id="kdv-filter-yil" name="yil" defaultValue={yil ? String(yil) : String(defaultYil)}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" size="sm">
        Uygula
      </Button>
      {hasFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/raporlar/vat")}
        >
          Varsayılana Dön
        </Button>
      )}
    </form>
  );
}
