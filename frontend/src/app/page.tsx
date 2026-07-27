import { PageShell } from "@/components/page-shell";
import { LandingPage } from "@/components/landing/landing-page";
import { getDashboard } from "@/lib/api";
import { getSession } from "@/lib/session";
import { resolveDashboardHorizon } from "./dashboard-horizon";
import { DashboardView } from "./dashboard-view";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string }>;
}) {
  // Kök adres iki iş görür: oturum yoksa tanıtım sayfası, varsa panel.
  const session = await getSession();
  if (!session) return <LandingPage />;

  const sp = await searchParams;
  const months = resolveDashboardHorizon(sp.ay);
  const stats = await getDashboard(months);

  return (
    <PageShell title="Genel Bakış" description="Canlı iş zekası panosu">
      <DashboardView stats={stats} />
    </PageShell>
  );
}
