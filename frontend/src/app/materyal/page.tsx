import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMaterials, type Material } from "@/lib/api";
import { MATERYAL_KATEGORILERI, MATERYAL_SCOPE_ETIKET } from "@/lib/materyal-fields";
import { YeniMateryalForm } from "./yeni-materyal-form";

export const dynamic = "force-dynamic";

const SCOPE_TONE: Record<string, "green" | "blue" | "indigo"> = {
  OWN: "green",
  B2B: "blue",
  BOTH: "indigo",
};

export default async function MateryalListPage() {
  const materials = await getMaterials();

  // Kategoriye göre grupla; kategori sırası sabit listeden.
  const byCategory = new Map<string, Material[]>();
  for (const m of materials) {
    const arr = byCategory.get(m.category) ?? [];
    arr.push(m);
    byCategory.set(m.category, arr);
  }

  return (
    <PageShell
      title="Materyal Detay"
      description="Ambalaj, etiket, sticker ve diğer materyaller — kendi markamız ve B2B"
    >
      <Card>
        <CardContent className="space-y-2">
          <h3 className="text-sm font-semibold">Yeni Materyal Kartı</h3>
          <YeniMateryalForm />
        </CardContent>
      </Card>

      {materials.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">Henüz materyal kartı yok.</p>
      )}

      {MATERYAL_KATEGORILERI.filter((k) => byCategory.has(k.code)).map((k) => {
        const items = [...(byCategory.get(k.code) ?? [])].sort((a, b) =>
          a.name.localeCompare(b.name, "tr"),
        );
        // Ambalaj alt türlerine göre alt gruplama (Doypack, Şişe…).
        const subTypes = [...new Set(items.map((m) => m.subType?.trim() || "—"))];
        return (
          <section key={k.code} className="space-y-3">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-[var(--muted-foreground)]" />
              <h2 className="text-base font-semibold">{k.label}</h2>
              <span className="text-xs text-[var(--muted-foreground)]">({items.length})</span>
            </div>
            {subTypes.map((st) => (
              <div key={st} className="space-y-2">
                {k.code === "AMBALAJ" && (
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                    {st}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items
                    .filter((m) => (m.subType?.trim() || "—") === st)
                    .map((m) => (
                      <Link key={m.id} href={`/materyal/${m.id}`} className="group">
                        <Card className="h-full transition-colors group-hover:border-[var(--primary)]">
                          <CardContent className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="truncate font-medium">{m.name}</span>
                              <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            <p className="truncate text-xs text-[var(--muted-foreground)]">
                              {[m.model, m.color, m.size].filter(Boolean).join(" · ") || "—"}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <Badge tone={SCOPE_TONE[m.scope] ?? "default"}>
                                {MATERYAL_SCOPE_ETIKET[m.scope] ?? m.scope}
                              </Badge>
                              {m.subType && k.code !== "AMBALAJ" && (
                                <Badge>{m.subType}</Badge>
                              )}
                              {m.unitPrice != null && (
                                <Badge tone="amber">
                                  {m.unitPrice} {m.currency ?? "TRY"}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </PageShell>
  );
}
