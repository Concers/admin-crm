import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { getGelirGiderDateBounds, getIncomeStatement } from "@/lib/api";
import { dateInputToApi, parseDateInput } from "@/lib/dates";
import { formatCalendarDate, formatCurrency, toDateInputValue } from "@/lib/utils";
import {
  FileBarChart,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { GelirTablosuDonemFilter } from "./donem-filter";
import { GelirTablosuOzet } from "./gelir-tablosu-ozet";

export const dynamic = "force-dynamic";

function resolveRange(
  startStr: string | undefined,
  endStr: string | undefined,
  bounds: { min: string; max: string } | null
) {
  const year = new Date().getFullYear();
  const calendarDefaultStart = `${year}-01-01`;
  const calendarDefaultEnd = toDateInputValue(new Date());
  const defaultStart = bounds ? toDateInputValue(bounds.min) : calendarDefaultStart;
  const defaultEnd = bounds ? toDateInputValue(bounds.max) : calendarDefaultEnd;
  const startInput =
    startStr && parseDateInput(startStr) ? startStr : defaultStart;
  const endInput =
    endStr && parseDateInput(endStr) ? endStr : defaultEnd;
  return {
    startInput,
    endInput,
    defaultStart,
    defaultEnd,
    startApi: dateInputToApi(startInput)!,
    endApi: dateInputToApi(endInput)!,
  };
}

export default async function IncomeStatementPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const sp = await searchParams;
  const bounds = await getGelirGiderDateBounds();
  const { startInput, endInput, defaultStart, defaultEnd, startApi, endApi } = resolveRange(
    sp.start,
    sp.end,
    bounds
  );
  const data = await getIncomeStatement(startApi, endApi);

  const brutMarj =
    data.revenue > 0 ? Math.round((data.grossProfit / data.revenue) * 100) : null;
  const netMarj =
    data.revenue > 0 ? Math.round((data.netProfit / data.revenue) * 100) : null;
  const hasData = data.revenue > 0 || data.operatingExpenses > 0;

  return (
    <PageShell
      title="Gelir Tablosu"
      description="Dönemsel gelir tablosu: net satış, maliyet, brüt kâr ve faaliyet giderleri"
    >
      <GelirTablosuDonemFilter
        start={startInput}
        end={endInput}
        defaultStart={defaultStart}
        defaultEnd={defaultEnd}
      />

      <p className="text-sm text-[var(--muted-foreground)]">
        Dönem:{" "}
        <span className="font-medium text-[var(--foreground)]">
          {formatCalendarDate(startInput)} – {formatCalendarDate(endInput)}
        </span>
        {bounds && !hasData && (
          <>
            <span className="mx-2 text-[var(--border)]">·</span>
            <span className="text-amber-700">
              Bu aralıkta kayıt yok. Veriler{" "}
              {formatCalendarDate(bounds.min)} – {formatCalendarDate(bounds.max)} arasında.
            </span>
          </>
        )}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Net Satış"
          value={formatCurrency(data.revenue)}
          icon={TrendingUp}
          accent="emerald"
        />
        <StatCard
          label="Brüt Kâr"
          value={formatCurrency(data.grossProfit)}
          icon={TrendingUp}
          accent="indigo"
          subtext={brutMarj != null ? `%${brutMarj} marj` : undefined}
        />
        <StatCard
          label="Faaliyet Giderleri"
          value={formatCurrency(data.operatingExpenses)}
          icon={TrendingDown}
          accent="rose"
        />
        <StatCard
          label="Net Kâr / Zarar"
          value={formatCurrency(data.netProfit)}
          icon={Scale}
          accent={data.netProfit >= 0 ? "emerald" : "rose"}
          subtext={netMarj != null ? `%${netMarj} marj` : undefined}
        />
      </div>

      <PanelCard
        icon={FileBarChart}
        title="Gelir Tablosu Özeti"
        description="Net satıştan net kâra kadar kademeli özet (KDV hariç satış, birim maliyet × adet SMM)"
        accent="indigo"
      >
        <GelirTablosuOzet data={data} />
      </PanelCard>
    </PageShell>
  );
}
