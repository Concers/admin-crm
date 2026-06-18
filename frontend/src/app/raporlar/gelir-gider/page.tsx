import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { getGelirGiderDateBounds, getGelirGiderReport } from "@/lib/api";
import { dateInputToApi, parseDateInput } from "@/lib/dates";
import { formatCalendarDate, formatCurrency, toDateInputValue } from "@/lib/utils";
import {
  FileBarChart,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { GelirGiderDonemFilter } from "./gelir-gider-donem-filter";
import { mapGelirGiderMatrix } from "./gelir-gider-rows";
import { GelirGiderMatrixTable } from "./gelir-gider-tablo";

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

export default async function GelirGiderRaporPage({
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
  const rapor = await getGelirGiderReport(startApi, endApi);
  const matrix = mapGelirGiderMatrix(rapor);
  const hasData =
    rapor.satisToplam > 0 ||
    rapor.alimToplam > 0 ||
    rapor.urunGiderleri > 0 ||
    rapor.genelGiderler > 0;

  return (
    <PageShell
      title="Gelir-Gider Raporu"
      description='Excel "Gelir_Gider Rapor" sayfasıyla aynı özet ve ürün/gider kırılımı'
    >
      <GelirGiderDonemFilter
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
        <span className="mx-2 text-[var(--border)]">·</span>
        Kar/Zarar = Satış (KDV hariç) − Alım − Ürün Gideri − Genel Gider
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        <StatCard
          label="Yapılan Satış Toplamı"
          value={formatCurrency(rapor.satisToplam)}
          icon={TrendingUp}
          accent="emerald"
          subtext="KDV hariç"
        />
        <StatCard
          label="Yapılan Alımlar Toplamı"
          value={formatCurrency(rapor.alimToplam)}
          icon={ShoppingCart}
          accent="amber"
        />
        <StatCard
          label="Ürün Giderleri"
          value={formatCurrency(rapor.urunGiderleri)}
          icon={TrendingDown}
          accent="rose"
          subtext={`${rapor.urunGiderKalemleri.length} ürün`}
        />
        <StatCard
          label="Genel Giderler"
          value={formatCurrency(rapor.genelGiderler)}
          icon={Wallet}
          accent="indigo"
          subtext={`${rapor.genelGiderKalemleri.length} kalem`}
        />
        <StatCard
          label="Kar / Zarar"
          value={formatCurrency(rapor.karZarar)}
          icon={FileBarChart}
          accent={rapor.karZarar >= 0 ? "emerald" : "rose"}
        />
      </div>

      <PanelCard
        icon={FileBarChart}
        title="Gelir – Gider Kırılımı"
        description="Excel'deki dört sütunlu matris: satış, alım, ürün gideri ve genel gider dağılımı"
        accent="blue"
      >
        <GelirGiderMatrixTable rows={matrix.rows} toplamSatiri={matrix.toplamSatiri} />
      </PanelCard>
    </PageShell>
  );
}
