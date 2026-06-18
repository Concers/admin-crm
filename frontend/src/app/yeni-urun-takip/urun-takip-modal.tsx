"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  URUN_TAKIP_FIELDS,
  URUN_TAKIP_SECTION_ORDER,
  type UrunTakipFieldDef,
} from "@/lib/urun-takip-fields";
import { defaultFieldValue } from "@/lib/urun-takip-form";
import { createUrunTakip, updateUrunTakip } from "./actions";
import type { UrunTakipTableRow } from "./urun-takip-rows";

function TriBoolSelect({
  id,
  name,
  label,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} name={name} defaultValue={defaultValue}>
        <option value="">—</option>
        <option value="true">Evet</option>
        <option value="false">Hayır</option>
      </Select>
    </div>
  );
}

function FieldInput({
  field,
  idPrefix,
  defaultValue,
  tedarikciler,
}: {
  field: UrunTakipFieldDef;
  idPrefix: string;
  defaultValue: string;
  tedarikciler: string[];
}) {
  const id = `${idPrefix}-${field.key}`;
  const span = field.wide ? "sm:col-span-2" : "";

  if (field.input === "bool") {
    return (
      <div className={span}>
        <TriBoolSelect id={id} name={field.key} label={field.label} defaultValue={defaultValue} />
      </div>
    );
  }

  if (field.input === "supplier") {
    return (
      <div className={span}>
        <Label htmlFor={id}>{field.label}</Label>
        <Input id={id} name={field.key} list={`${idPrefix}-tedarikci-list`} defaultValue={defaultValue} />
        <datalist id={`${idPrefix}-tedarikci-list`}>
          {tedarikciler.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>
    );
  }

  if (field.input === "date") {
    return (
      <div className={span}>
        <Label htmlFor={id}>{field.label}</Label>
        <Input id={id} name={field.key} type="date" defaultValue={defaultValue} />
      </div>
    );
  }

  if (field.input === "number") {
    return (
      <div className={span}>
        <Label htmlFor={id}>{field.label}</Label>
        <Input
          id={id}
          name={field.key}
          type="number"
          step="1"
          min="0"
          defaultValue={defaultValue}
        />
      </div>
    );
  }

  return (
    <div className={span}>
      <Label htmlFor={id}>
        {field.label}
        {field.required ? " *" : ""}
      </Label>
      <Input
        id={id}
        name={field.key}
        required={field.required}
        defaultValue={defaultValue}
      />
    </div>
  );
}

export function UrunTakipModal({
  mode,
  row,
  tedarikciler,
  onClose,
}: {
  mode: "create" | "edit";
  row?: UrunTakipTableRow;
  tedarikciler: string[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  const fieldsBySection = URUN_TAKIP_SECTION_ORDER.map((section) => ({
    section,
    fields: URUN_TAKIP_FIELDS.filter((f) => f.section === section),
  }));

  return (
    <FormModal
      title={isEdit ? "Ürün Takibini Düzenle" : "Yeni Ürün Takibi"}
      description="Excel’deki 50 süreç alanının tamamı — bölümler halinde doldurun."
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Kayıt Ekle"}
      maxWidth="max-w-5xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateUrunTakip(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Ürün takibi güncellendi." });
        } else {
          run(async () => {
            const result = await createUrunTakip(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Ürün takibi eklendi." });
        }
      }}
    >
      {fieldsBySection.map(({ section, fields }) => (
        <FormSection key={section} title={section}>
          {fields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              idPrefix={idPrefix}
              defaultValue={defaultFieldValue(field, isEdit ? row : undefined)}
              tedarikciler={tedarikciler}
            />
          ))}
        </FormSection>
      ))}
    </FormModal>
  );
}
