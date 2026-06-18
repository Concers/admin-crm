"use client";

import { useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GelirTablosuDonemFilter({
  start,
  end,
  defaultStart,
  defaultEnd,
}: {
  start: string;
  end: string;
  defaultStart: string;
  defaultEnd: string;
}) {
  const router = useRouter();

  function apply(form: HTMLFormElement) {
    const fd = new FormData(form);
    const nextStart = String(fd.get("start") ?? "").trim();
    const nextEnd = String(fd.get("end") ?? "").trim();
    const params = new URLSearchParams();
    if (nextStart) params.set("start", nextStart);
    if (nextEnd) params.set("end", nextEnd);
    const qs = params.toString();
    router.push(qs ? `/raporlar/income-statement?${qs}` : "/raporlar/income-statement");
  }

  const hasFilter = start !== defaultStart || end !== defaultEnd;

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
        Gelir Tablosu Dönemi
      </div>
      <div>
        <Label htmlFor="gt-filter-start" className="text-xs uppercase tracking-wide">
          Başlangıç Tarihi
        </Label>
        <Input id="gt-filter-start" name="start" type="date" defaultValue={start} />
      </div>
      <div>
        <Label htmlFor="gt-filter-end" className="text-xs uppercase tracking-wide">
          Bitiş Tarihi
        </Label>
        <Input id="gt-filter-end" name="end" type="date" defaultValue={end} />
      </div>
      <Button type="submit" size="sm">
        Uygula
      </Button>
      {hasFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/raporlar/income-statement")}
        >
          Filtreyi Temizle
        </Button>
      )}
    </form>
  );
}
