"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function AccountSelectField({
  id,
  name = "accountId",
  accounts,
  defaultValue,
}: {
  id: string;
  name?: string;
  accounts: { id: number; name: string }[];
  defaultValue?: number | null;
}) {
  return (
    <div>
      <Label htmlFor={id}>Hesap (kasa/banka)</Label>
      <Select id={id} name={name} defaultValue={defaultValue ? String(defaultValue) : ""}>
        <option value="">— Seçilmedi —</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
