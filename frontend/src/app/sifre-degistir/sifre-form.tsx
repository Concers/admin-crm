"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import { changePasswordAction } from "./actions";

export function SifreForm() {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => changePasswordAction(new FormData(form)), { success: "Şifreniz güncellendi." });
        form.reset();
      }}
      className="max-w-sm space-y-4"
    >
      <div>
        <Label htmlFor="current">Mevcut Şifre *</Label>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </div>
      <div>
        <Label htmlFor="next">Yeni Şifre *</Label>
        <Input id="next" name="next" type="password" autoComplete="new-password" required />
      </div>
      <div>
        <Label htmlFor="confirm">Yeni Şifre (Tekrar) *</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor…" : "Şifreyi Değiştir"}</Button>
    </form>
  );
}
