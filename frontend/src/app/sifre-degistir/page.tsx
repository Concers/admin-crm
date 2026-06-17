import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { SifreForm } from "./sifre-form";

export const dynamic = "force-dynamic";

export default function SifreDegistirPage() {
  return (
    <PageShell title="Şifre Değiştir">
      <Card>
        <CardContent>
          <SifreForm />
        </CardContent>
      </Card>
    </PageShell>
  );
}
