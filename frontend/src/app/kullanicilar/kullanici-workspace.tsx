"use client";

import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormModal, FormSection } from "@/components/form-modal";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { createUserAction } from "./actions";

function KullaniciFormModal({ onClose }: { onClose: () => void }) {
  const { run, pending } = useActionToast();
  return (
    <FormModal
      title="Yeni Kullanıcı"
      description="Sisteme giriş yapacak kullanıcı ekleyin."
      onClose={onClose}
      pending={pending}
      submitLabel="Kullanıcı Ekle"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          await createUserAction(new FormData(e.currentTarget));
          onClose();
        }, { success: "Kullanıcı eklendi." });
      }}
    >
      <FormSection title="Hesap bilgileri">
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
      </FormSection>
    </FormModal>
  );
}

export function KullaniciWorkspace({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <RecordWorkspaceToolbar addLabel="Yeni Kullanıcı Ekle" onAdd={() => setOpen(true)} />
      {children}
      {open && <KullaniciFormModal onClose={() => setOpen(false)} />}
    </>
  );
}
