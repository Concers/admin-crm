"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { createUserAction } from "./actions";

export function KullaniciForm() {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => createUserAction(new FormData(form)), {
          success: "Kullanıcı eklendi.",
        });
        form.reset();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div><Label htmlFor="name">Ad *</Label><Input id="name" name="name" required /></div>
      <div><Label htmlFor="email">E-posta *</Label><Input id="email" name="email" type="email" required /></div>
      <div><Label htmlFor="password">Şifre *</Label><Input id="password" name="password" type="password" required /></div>
      <div>
        <Label htmlFor="role">Rol *</Label>
        <Select id="role" name="role" required defaultValue="SALES_REP">
          <option value="ADMIN">Yönetici</option>
          <option value="SALES_REP">Satış Temsilcisi</option>
          <option value="WAREHOUSE_MANAGER">Depo Sorumlusu</option>
        </Select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          {pending ? "Kaydediliyor..." : "Kullanıcı Ekle"}
        </Button>
      </div>
    </form>
  );
}
