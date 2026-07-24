"use client";

import { Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { useToast } from "@/components/ui/toast";
import type { Partner } from "@/lib/api";
import { CARI_FIELDS } from "@/lib/cari-fields";
import { deleteCariAction, updateCariAction } from "../actions";

export function CariForm({ partner }: { partner: Partner }) {
  const { run, pending } = useActionToast();
  const router = useRouter();
  const toast = useToast();
  const [deleting, startDelete] = useTransition();
  const fields = CARI_FIELDS[partner.type] ?? CARI_FIELDS.OTHER;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => updateCariAction(partner.id, new FormData(e.currentTarget)), {
          success: "Cari kaydedildi.",
        });
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => {
          const value = (partner[f.key] as string | null | undefined) ?? "";
          const required = f.key === "name";
          return (
            <div key={f.key} className={f.textarea ? "sm:col-span-2 lg:col-span-3" : ""}>
              <Label htmlFor={f.key}>
                {f.label}
                {required ? " *" : ""}
              </Label>
              {f.textarea ? (
                <Textarea id={f.key} name={f.key} rows={2} defaultValue={value} />
              ) : (
                <Input id={f.key} name={f.key} defaultValue={value} required={required} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          className="text-[var(--danger)] hover:bg-red-50"
          disabled={deleting}
          onClick={() => {
            if (!confirm(`"${partner.name}" carisi silinsin mi?`)) return;
            startDelete(async () => {
              const res = await deleteCariAction(partner.id);
              if (res?.error) return toast.error(res.error);
              toast.success("Cari silindi.");
              router.push("/tanimlama");
            });
          }}
        >
          <Trash2 className="h-4 w-4" /> Sil
        </Button>
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" /> {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
