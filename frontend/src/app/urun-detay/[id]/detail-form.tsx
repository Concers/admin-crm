"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { Product } from "@/lib/api";
import { URUN_DETAY_ALANLARI, URUN_SEKTORLERI } from "@/lib/urun-detay-fields";
import { updateProductDetailAction } from "../actions";

export function DetailForm({ product }: { product: Product }) {
  const { run, pending } = useActionToast();
  const selectedSectors = new Set((product.sectors ?? "").split(",").map((s) => s.trim()));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => updateProductDetailAction(product.id, new FormData(form)), {
          success: "Ürün kartı kaydedildi.",
        });
      }}
      className="space-y-6"
    >
      {/* Temel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Ürün Adı *</Label>
          <Input id="name" name="name" required defaultValue={product.name} />
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          <Input id="category" name="category" defaultValue={product.category ?? ""} />
        </div>
        <div>
          <Label htmlFor="unit">Birim</Label>
          <Input id="unit" name="unit" defaultValue={product.unit ?? "adet"} />
        </div>
      </div>

      {/* Sektör (çoklu) */}
      <div>
        <Label>Ürün Sektörü (çoklu)</Label>
        <div className="mt-1 flex flex-wrap gap-3">
          {URUN_SEKTORLERI.map((s) => (
            <label key={s.code} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={`sector_${s.code}`}
                defaultChecked={selectedSectors.has(s.code)}
                className="h-4 w-4"
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      {/* Bayraklar */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isBfm" defaultChecked={product.isBfm} className="h-4 w-4" />
          BFM Ürün (çok bileşenli satış ürünü)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product.isActive ?? true}
            className="h-4 w-4"
          />
          Aktif
        </label>
      </div>

      {/* Künye grupları */}
      {URUN_DETAY_ALANLARI.map((group) => (
        <fieldset key={group.title} className="space-y-3 rounded-lg border border-[var(--border)] p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            {group.title}
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.fields.map((f) => {
              const value = (product[f.key] as string | null | undefined) ?? "";
              return (
                <div key={f.key} className={f.textarea ? "sm:col-span-2 lg:col-span-3" : ""}>
                  <Label htmlFor={f.key}>{f.label}</Label>
                  {f.textarea ? (
                    <Textarea id={f.key} name={f.key} rows={3} defaultValue={value} />
                  ) : (
                    <Input id={f.key} name={f.key} defaultValue={value} />
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
