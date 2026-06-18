"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency } from "@/lib/utils";
import { ItemsEditor } from "./items-editor";
import { createFiyatListesi, updateFiyatListesi } from "./actions";
import type { FiyatTableRow } from "./fiyat-rows";

export function FiyatModal({
  mode,
  row,
  products,
  onClose,
}: {
  mode: "create" | "edit";
  row?: FiyatTableRow;
  products: { id: number; name: string }[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "Fiyat Listesini Düzenle" : "Yeni Fiyat Listesi"}
      description={
        isEdit
          ? "Liste bilgilerini ve ürün fiyatlarını güncelleyin."
          : "Ürün fiyatlarını içeren yeni bir liste oluşturun."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Fiyat Listesi Ekle"}
      maxWidth="max-w-4xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateFiyatListesi(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Fiyat listesi güncellendi." });
        } else {
          run(async () => {
            const result = await createFiyatListesi(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Fiyat listesi eklendi." });
        }
      }}
    >
      <FormSection title="Liste bilgileri">
        <div>
          <Label htmlFor={`${idPrefix}-name`}>Liste Adı *</Label>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            required
            placeholder="Örn. Perakende 2024"
            defaultValue={isEdit ? row._name : ""}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-currency`}>Para Birimi *</Label>
          <Input
            id={`${idPrefix}-currency`}
            name="currency"
            required
            defaultValue={isEdit ? row._currency : "TRY"}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-tier`}>Müşteri Segmenti</Label>
          <Input
            id={`${idPrefix}-tier`}
            name="tier"
            placeholder="Örn. wholesale, retail"
            defaultValue={isEdit ? row._tier : ""}
          />
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={isEdit ? row._isActive : true}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            Aktif liste
          </label>
        </div>
      </FormSection>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 p-4">
        <ItemsEditor
          key={isEdit ? row.id : "new"}
          products={products}
          initialItems={isEdit ? row._items : undefined}
        />
      </div>

      {isEdit && row._avgPrice > 0 && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900">
          Ortalama fiyat:{" "}
          <span className="font-semibold tabular-nums">{formatCurrency(row._avgPrice)}</span>
          <span className="mx-2 text-blue-300">·</span>
          {row.kalemSayisi} kalem
        </div>
      )}
    </FormModal>
  );
}
