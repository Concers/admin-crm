import { PageShell } from "@/components/page-shell";
import { getDashboard } from "@/lib/api";
import { resolveDashboardHorizon } from "./dashboard-horizon";
import { DashboardView } from "./dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string }>;
}) {
  const sp = await searchParams;
  const months = resolveDashboardHorizon(sp.ay);
  const stats = await getDashboard(months);

  return (
    <PageShell title="Genel Bakış" description="Canlı iş zekası panosu">
      <DashboardView stats={stats} />
    </PageShell>
  );
}
