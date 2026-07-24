"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { Material } from "@/lib/api";
import {
  AMBALAJ_ALT_TURLERI,
  MATERYAL_ALANLARI,
  MATERYAL_KATEGORILERI,
  MATERYAL_SCOPE,
} from "@/lib/materyal-fields";
import { updateMaterialAction } from "../actions";

export function DetailForm({ material }: { material: Material }) {
  const { run, pending } = useActionToast();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => updateMaterialAction(material.id, new FormData(form)), {
          success: "Materyal kartı kaydedildi.",
        });
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Materyal Adı *</Label>
          <Input id="name" name="name" required defaultValue={material.name} />
        </div>
        <div>
          <Label htmlFor="category">Kategori *</Label>
          <Select id="category" name="category" defaultValue={material.category}>
            {MATERYAL_KATEGORILERI.map((k) => (
              <option key={k.code} value={k.code}>
                {k.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="subType">Alt Tür</Label>
          <Input id="subType" name="subType" list="alt-tur" defaultValue={material.subType ?? ""} />
          <datalist id="alt-tur">
            {AMBALAJ_ALT_TURLERI.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor="scope">Kullanım</Label>
          <Select id="scope" name="scope" defaultValue={material.scope}>
            {MATERYAL_SCOPE.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="unitPrice">Birim Fiyat</Label>
          <Input
            id="unitPrice"
            name="unitPrice"
            type="number"
            step="0.01"
            defaultValue={material.unitPrice ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="currency">Para Birimi</Label>
          <Input id="currency" name="currency" defaultValue={material.currency ?? "TRY"} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MATERYAL_ALANLARI.map((f) => {
          const value = (material[f.key] as string | null | undefined) ?? "";
          return (
            <div key={f.key} className={f.textarea ? "sm:col-span-2 lg:col-span-3" : ""}>
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.textarea ? (
                <Textarea id={f.key} name={f.key} rows={2} defaultValue={value} />
              ) : (
                <Input id={f.key} name={f.key} defaultValue={value} />
              )}
            </div>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={material.isActive ?? true}
          className="h-4 w-4"
        />
        Aktif
      </label>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
