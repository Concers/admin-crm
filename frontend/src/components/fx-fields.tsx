"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/calculations";
import { lookupTcmbRate } from "@/lib/pricing-actions";

const CURRENCIES = ["TRY", "USD", "EUR", "GBP"] as const;

export function FxFields({
  idPrefix,
  defaultCurrency = "TRY",
  defaultRate = 1,
  amountTry,
}: {
  idPrefix: string;
  defaultCurrency?: string;
  defaultRate?: number;
  amountTry?: number;
}) {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [rate, setRate] = useState(String(defaultRate));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currency === "TRY") {
      setRate("1");
      return;
    }
    let cancelled = false;
    setLoading(true);
    lookupTcmbRate(currency).then((r) => {
      if (cancelled) return;
      if (r != null) setRate(String(r));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [currency]);

  const rateNum = Number(rate) || 1;
  const tlEquiv = amountTry != null && currency !== "TRY" ? amountTry * rateNum : amountTry;

  return (
    <>
      <div>
        <Label htmlFor={`${idPrefix}-currency`}>Para birimi</Label>
        <Select
          id={`${idPrefix}-currency`}
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-exchangeRate`}>
          Kur {currency !== "TRY" ? "(TCMB satış)" : ""}
        </Label>
        <Input
          id={`${idPrefix}-exchangeRate`}
          name="exchangeRate"
          type="number"
          step="0.0001"
          min="0"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          readOnly={currency === "TRY"}
          disabled={loading && currency !== "TRY"}
        />
        {loading && currency !== "TRY" ? (
          <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">TCMB kuru yükleniyor…</p>
        ) : null}
      </div>
      {currency !== "TRY" && tlEquiv != null && tlEquiv > 0 ? (
        <div className="sm:col-span-2 rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900">
          TL karşılığı (yaklaşık):{" "}
          <span className="font-semibold tabular-nums">{formatCurrency(tlEquiv)}</span>
        </div>
      ) : null}
    </>
  );
}
