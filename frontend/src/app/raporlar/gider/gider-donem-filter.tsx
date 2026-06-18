"use client";

import { useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ayAdi } from "@/lib/calculations";

export function GiderDonemFilter({
  ay,
  yil,
  years,
}: {
  ay?: number;
  yil?: number;
  years: number[];
}) {
  const router = useRouter();

  function apply(form: HTMLFormElement) {
    const fd = new FormData(form);
    const nextAy = String(fd.get("ay") ?? "").trim();
    const nextYil = String(fd.get("yil") ?? "").trim();
    const params = new URLSearchParams();
    if (nextAy) params.set("ay", nextAy);
    if (nextYil) params.set("yil", nextYil);
    const qs = params.toString();
    router.push(qs ? `/raporlar/gider?${qs}` : "/raporlar/gider");
  }

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
        Dönem Filtresi
      </div>
      <div>
        <Label htmlFor="gider-filter-ay" className="text-xs">
          Ay
        </Label>
        <Select id="gider-filter-ay" name="ay" defaultValue={ay ? String(ay) : ""}>
          <option value="">Tüm aylar</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {ayAdi(m)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="gider-filter-yil" className="text-xs">
          Yıl
        </Label>
        <Select id="gider-filter-yil" name="yil" defaultValue={yil ? String(yil) : ""}>
          <option value="">Tüm yıllar</option>
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
      {(ay || yil) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/raporlar/gider")}
        >
          Filtreyi Temizle
        </Button>
      )}
    </form>
  );
}
