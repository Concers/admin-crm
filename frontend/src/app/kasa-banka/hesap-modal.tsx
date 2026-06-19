"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { createHesap, updateHesap } from "./actions";
import type { HesapRow } from "./kasa-rows";

export function HesapModal({
  mode,
  row,
  onClose,
}: {
  mode: "create" | "edit";
  row?: HesapRow;
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const p = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "Hesabı Düzenle" : "Yeni Kasa / Banka Hesabı"}
      description={isEdit ? "Hesap bilgilerini güncelleyin." : "Tahsilat ve ödemelerin bağlanacağı hesap tanımı."}
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Kaydet" : "Hesap Ekle"}
      maxWidth="max-w-lg"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        run(async () => {
          const result = isEdit ? await updateHesap(row.id, fd) : await createHesap(fd);
          if (!result?.error) onClose();
          return result;
        }, { success: isEdit ? "Hesap güncellendi." : "Hesap eklendi." });
      }}
    >
      <FormSection title="Hesap bilgileri">
        <div className="sm:col-span-2">
          <Label htmlFor={`${p}-name`}>Hesap adı *</Label>
          <Input id={`${p}-name`} name="name" required defaultValue={isEdit ? row._name : ""} />
        </div>
        <div>
          <Label htmlFor={`${p}-type`}>Tür</Label>
          <Select id={`${p}-type`} name="type" defaultValue={isEdit ? row._type : "CASH"}>
            <option value="CASH">Kasa</option>
            <option value="BANK">Banka</option>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${p}-currency`}>Para birimi</Label>
          <Select id={`${p}-currency`} name="currency" defaultValue={isEdit ? row._currency : "TRY"}>
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${p}-openingBalance`}>Açılış bakiyesi</Label>
          <Input
            id={`${p}-openingBalance`}
            name="openingBalance"
            type="number"
            step="0.01"
            defaultValue={isEdit ? String(row._openingBalance) : "0"}
          />
        </div>
      </FormSection>
    </FormModal>
  );
}
