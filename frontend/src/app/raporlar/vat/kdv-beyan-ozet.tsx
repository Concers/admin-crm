import type { VatDeclaration } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Minus, Scale } from "lucide-react";

function Money({
  value,
  tone = "default",
  prefix,
}: {
  value: number;
  tone?: "default" | "positive" | "negative" | "expense";
  prefix?: string;
}) {
  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        tone === "positive" && "text-emerald-700",
        tone === "negative" && "text-rose-700",
        tone === "expense" && "text-amber-700"
      )}
    >
      {prefix}
      {formatCurrency(value)}
    </span>
  );
}

function RowLine({
  label,
  sublabel,
  value,
  tone,
  prefix,
  emphasized,
  icon: Icon,
}: {
  label: string;
  sublabel?: string;
  value: number;
  tone?: "default" | "positive" | "negative" | "expense";
  prefix?: string;
  emphasized?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg px-3 py-3",
        emphasized ? "bg-[var(--muted)]/40 ring-1 ring-[var(--border)]" : "hover:bg-[var(--muted)]/20"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
              emphasized
                ? "bg-indigo-50 text-indigo-600 ring-indigo-100"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] ring-[var(--border)]"
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <p className={cn("text-sm", emphasized ? "font-semibold" : "text-[var(--foreground)]")}>
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-[var(--muted-foreground)]">{sublabel}</p>
          )}
        </div>
      </div>
      <Money value={value} tone={tone} prefix={prefix} />
    </div>
  );
}

export function KdvBeyanOzet({ data }: { data: VatDeclaration }) {
  const isDevreden = data.payableVat < 0;

  return (
    <div className="space-y-1">
      <RowLine
        label="Satış Matrahı (KDV Hariç)"
        sublabel={`${data.salesCount} satış kaydı`}
        value={data.salesBase}
        emphasized
        icon={ArrowUpRight}
      />
      <RowLine
        label="Hesaplanan KDV"
        sublabel="Satışlardan tahakkuk eden KDV"
        value={data.outputVat}
        tone="positive"
        icon={ArrowUpRight}
      />
      <RowLine
        label="Alım Matrahı (KDV Hariç)"
        sublabel={`${data.purchaseCount} alım kaydı`}
        value={data.purchasesBase}
        emphasized
        icon={ArrowDownLeft}
      />
      <RowLine
        label="İndirilecek KDV"
        sublabel="Alımlardan indirilebilir KDV"
        value={data.inputVat}
        tone="expense"
        prefix="− "
        icon={Minus}
      />
      <div
        className={cn(
          "mt-2 rounded-xl border px-4 py-4",
          isDevreden
            ? "border-amber-100 bg-amber-50/50"
            : "border-indigo-100 bg-indigo-50/50"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg ring-1",
                isDevreden
                  ? "bg-amber-100 text-amber-700 ring-amber-200"
                  : "bg-indigo-100 text-indigo-700 ring-indigo-200"
              )}
            >
              <Scale className="h-4 w-4" />
            </span>
            <div>
              <p className="text-base font-semibold">
                {isDevreden ? "Devreden KDV" : "Ödenecek KDV"}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Hesaplanan KDV − İndirilecek KDV
              </p>
            </div>
          </div>
          <Money
            value={Math.abs(data.payableVat)}
            tone={isDevreden ? "expense" : data.payableVat > 0 ? "positive" : "default"}
          />
        </div>
      </div>
    </div>
  );
}
