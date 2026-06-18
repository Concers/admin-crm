"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { createDepo, updateDepo } from "./actions";
import type { DepoTableRow } from "./depo-rows";

export function DepoModal({
  mode,
  row,
  onClose,
}: {
  mode: "create" | "edit";
  row?: DepoTableRow;
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "Depoyu Düzenle" : "Yeni Depo"}
      description={
        isEdit
          ? "Depo adı ve lokasyon bilgisini güncelleyin."
          : "Yeni depo veya lokasyon tanımı ekleyin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Depo Ekle"}
      maxWidth="max-w-lg"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateDepo(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Depo güncellendi." });
        } else {
          run(async () => {
            const result = await createDepo(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Depo eklendi." });
        }
      }}
    >
      <FormSection title="Depo bilgileri">
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-name`}>Depo Adı *</Label>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            required
            placeholder="Örn. Ana Depo"
            defaultValue={isEdit ? row._name : ""}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-location`}>Lokasyon</Label>
          <Input
            id={`${idPrefix}-location`}
            name="location"
            placeholder="Adres veya bölge"
            defaultValue={isEdit ? row._location : ""}
          />
        </div>
      </FormSection>
    </FormModal>
  );
}
