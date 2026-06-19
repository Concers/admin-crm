"use client";

import { useMemo, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCalendarDate } from "@/lib/utils";
import { lockPeriod, unlockPeriod } from "./actions";
import type { PeriodLock } from "@/lib/api";

const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function lockLabel(lock: PeriodLock) {
  if (lock.month == null) return `${lock.year} — Tüm yıl`;
  return `${lock.year} — ${AYLAR[lock.month - 1] ?? lock.month}`;
}

export function DonemKapatmaWorkspace({ locks }: { locks: PeriodLock[] }) {
  const { run, pending } = useActionToast();
  const [scope, setScope] = useState("month");

  const rows = useMemo(
    () =>
      locks.map((l) => ({
        id: l.id,
        donem: lockLabel(l),
        not: l.note?.trim() || "—",
        tarih: formatCalendarDate(l.createdAt),
      })),
    [locks]
  );

  return (
    <div className="space-y-6">
      <Card className="border-[var(--border)] shadow-sm">
        <CardContent className="pt-5">
          <h3 className="mb-1 text-sm font-semibold">Yeni dönem kilidi</h3>
          <p className="mb-4 text-xs text-[var(--muted-foreground)]">
            Kilitli döneme satış, alım, gider ve tahsilat eklenemez (423 period_locked).
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(() => lockPeriod(new FormData(e.currentTarget)), { success: "Dönem kilitlendi." });
              e.currentTarget.reset();
              setScope("month");
            }}
            className="space-y-4"
          >
            <FormSection title="Kilit parametreleri">
              <div>
                <Label htmlFor="year">Yıl *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min={2000}
                  max={2100}
                  required
                  defaultValue={new Date().getFullYear()}
                />
              </div>
              <div>
                <Label htmlFor="scope">Kapsam</Label>
                <Select id="scope" name="scope" value={scope} onChange={(e) => setScope(e.target.value)}>
                  <option value="month">Tek ay</option>
                  <option value="year">Tüm yıl</option>
                </Select>
              </div>
              {scope === "month" && (
                <div>
                  <Label htmlFor="month">Ay</Label>
                  <Select id="month" name="month" defaultValue={String(new Date().getMonth() + 1)}>
                    {AYLAR.map((label, i) => (
                      <option key={label} value={i + 1}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              <div className="sm:col-span-2">
                <Label htmlFor="note">Not</Label>
                <Textarea id="note" name="note" rows={2} placeholder="Kapanış notu (opsiyonel)" />
              </div>
            </FormSection>
            <Button type="submit" disabled={pending}>
              <Lock className="mr-2 h-4 w-4" />
              {pending ? "Kilitleniyor…" : "Dönemi Kilitle"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <DataTable
        rows={rows}
        columns={[
          {
            key: "donem",
            label: "Kilitli dönem",
            render: (r) => (
              <span className="inline-flex items-center gap-2 font-medium">
                <Lock className="h-4 w-4 text-amber-600" />
                {r.donem}
              </span>
            ),
          },
          { key: "not", label: "Not" },
          { key: "tarih", label: "Oluşturulma" },
          {
            key: "id",
            label: "",
            sortable: false as const,
            filterable: false as const,
            render: (row) => (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (confirm(`${row.donem} kilidi kaldırılsın mı?`)) {
                    run(() => unlockPeriod(row.id), { success: "Kilit kaldırıldı." });
                  }
                }}
              >
                <Unlock className="mr-1 h-4 w-4" />
                Kaldır
              </Button>
            ),
          },
        ]}
        defaultSort={{ key: "donem", asc: false }}
        searchKeys={["donem", "not"]}
        emptyText="Aktif dönem kilidi yok"
        emptyHint="Yukarıdaki formdan yıl/ay kilitleyebilirsiniz."
      />
    </div>
  );
}
