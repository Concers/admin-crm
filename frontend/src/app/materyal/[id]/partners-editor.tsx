"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useActionToast } from "@/hooks/use-action-toast";
import type { Partner, MaterialPartnerLink } from "@/lib/api";
import { MATERYAL_ROL_ETIKET } from "@/lib/materyal-fields";
import { addMaterialPartnerAction, deleteMaterialPartnerAction } from "../actions";

const ROLE_TONE: Record<string, "green" | "blue"> = { SUPPLIER: "green", CUSTOMER: "blue" };

export function PartnersEditor({
  materialId,
  partnerLinks,
  partners,
}: {
  materialId: number;
  partnerLinks: MaterialPartnerLink[];
  partners: Partner[];
}) {
  const { run, pending } = useActionToast();
  const sortedPartners = [...partners].sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return (
    <div className="space-y-4">
      {partnerLinks.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">Henüz cari bağlanmamış.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)]">
          {partnerLinks.map((pl) => (
            <li key={pl.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <Badge tone={ROLE_TONE[pl.role] ?? "default"}>
                  {MATERYAL_ROL_ETIKET[pl.role] ?? pl.role}
                </Badge>
                <span className="truncate font-medium">{pl.partner.name}</span>
                {pl.note && (
                  <span className="truncate text-xs text-[var(--muted-foreground)]">— {pl.note}</span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-[var(--danger)]"
                disabled={pending}
                onClick={() =>
                  run(() => deleteMaterialPartnerAction(materialId, pl.id), {
                    success: "Cari bağı silindi.",
                  })
                }
                aria-label="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          run(() => addMaterialPartnerAction(materialId, new FormData(form)), {
            success: "Cari bağlandı.",
          });
          form.reset();
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Select name="partnerId" required aria-label="Cari" defaultValue="">
          <option value="" disabled>
            Cari seçin…
          </option>
          {sortedPartners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select name="role" defaultValue="SUPPLIER" aria-label="Rol">
          <option value="SUPPLIER">Tedarikçi</option>
          <option value="CUSTOMER">Müşteri</option>
        </Select>
        <Input name="note" placeholder="Not (opsiyonel)" />
        <div>
          <Button type="submit" size="sm" disabled={pending}>
            <Plus className="h-4 w-4" />
            Bağla
          </Button>
        </div>
      </form>
    </div>
  );
}
