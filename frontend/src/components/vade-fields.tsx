"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatCalendarDate } from "@/lib/utils";

const VADE_PRESETS = [
  { value: "", label: "Peşin / vadesiz" },
  { value: "30", label: "30 gün" },
  { value: "60", label: "60 gün" },
  { value: "90", label: "90 gün" },
  { value: "custom", label: "Özel gün" },
] as const;

export function VadeFields({
  idPrefix,
  invoiceDate,
  defaultTermDays,
  defaultDueDate,
}: {
  idPrefix: string;
  invoiceDate: string;
  defaultTermDays?: number | null;
  defaultDueDate?: string | null;
}) {
  const initialPreset =
    defaultTermDays && [30, 60, 90].includes(defaultTermDays)
      ? String(defaultTermDays)
      : defaultTermDays && defaultTermDays > 0
        ? "custom"
        : "";

  const [preset, setPreset] = useState(initialPreset);
  const [customDays, setCustomDays] = useState(
    initialPreset === "custom" && defaultTermDays ? String(defaultTermDays) : ""
  );

  const termDays =
    preset === "custom" ? Number(customDays) || 0 : preset ? Number(preset) : 0;

  const computedDue = useMemo(() => {
    if (!invoiceDate || termDays <= 0) return null;
    const d = new Date(invoiceDate + "T12:00:00");
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + termDays);
    return formatCalendarDate(d.toISOString());
  }, [invoiceDate, termDays]);

  return (
    <>
      <div>
        <Label htmlFor={`${idPrefix}-vadePreset`}>Vade (gün)</Label>
        <Select
          id={`${idPrefix}-vadePreset`}
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
        >
          {VADE_PRESETS.map((o) => (
            <option key={o.value || "none"} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <input type="hidden" name="termDays" value={termDays > 0 ? termDays : ""} />
      </div>
      {preset === "custom" && (
        <div>
          <Label htmlFor={`${idPrefix}-vadeGun`}>Özel vade günü</Label>
          <Input
            id={`${idPrefix}-vadeGun`}
            type="number"
            min={1}
            step={1}
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value)}
            placeholder="Örn. 45"
          />
        </div>
      )}
      <div>
        <Label>Hesaplanan vade tarihi</Label>
        <p className="mt-1.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-sm tabular-nums">
          {computedDue ?? (defaultDueDate ? formatCalendarDate(defaultDueDate) : "—")}
        </p>
      </div>
    </>
  );
}
