"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Account, PaymentInstrument } from "@/lib/api";
import { saveInstrument } from "./actions";

export function CekSenetModal({
  open,
  onClose,
  partners,
  accounts,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  partners: { name: string; type: string }[];
  accounts: Account[];
  editing?: PaymentInstrument | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  if (!open) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await saveInstrument(fd, editing?.id);
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{editing ? "Düzenle" : "Yeni çek / senet"}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Tür</Label>
            <Select name="type" defaultValue={editing?.type ?? "CHEQUE"} className="mt-1 h-10 w-full">
              <option value="CHEQUE">Çek</option>
              <option value="PROMISSORY_NOTE">Senet</option>
            </Select>
          </div>
          <div>
            <Label>Yön</Label>
            <Select name="direction" defaultValue={editing?.direction ?? "RECEIVABLE"} className="mt-1 h-10 w-full">
              <option value="RECEIVABLE">Alacak (müşteri)</option>
              <option value="PAYABLE">Borç (tedarikçi)</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Cari</Label>
            <Input name="partnerName" list="partner-list" defaultValue={editing?.partner.name ?? ""} required className="mt-1 h-10" />
            <datalist id="partner-list">
              {partners.map((p) => (
                <option key={p.name} value={p.name} />
              ))}
            </datalist>
          </div>
          <div>
            <Label>Belge no</Label>
            <Input name="number" defaultValue={editing?.number ?? ""} className="mt-1 h-10" />
          </div>
          <div>
            <Label>Tutar</Label>
            <Input name="amount" type="number" min={0.01} step="0.01" defaultValue={editing?.amount ?? ""} required className="mt-1 h-10" />
          </div>
          <div>
            <Label>Düzenleme</Label>
            <Input name="issueDate" type="date" defaultValue={editing?.issueDate.slice(0, 10) ?? ""} required className="mt-1 h-10" />
          </div>
          <div>
            <Label>Vade</Label>
            <Input name="dueDate" type="date" defaultValue={editing?.dueDate.slice(0, 10) ?? ""} required className="mt-1 h-10" />
          </div>
          <div>
            <Label>Para birimi</Label>
            <Input name="currency" defaultValue={editing?.currency ?? "TRY"} className="mt-1 h-10" />
          </div>
          <div>
            <Label>Banka hesabı</Label>
            <Select name="accountId" defaultValue={String(editing?.accountId ?? "")} className="mt-1 h-10 w-full">
              <option value="">—</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Durum</Label>
            <Select name="status" defaultValue={editing?.status ?? "PORTFOLIO"} className="mt-1 h-10 w-full">
              <option value="PORTFOLIO">Portföyde</option>
              <option value="DEPOSITED">Bankaya verildi</option>
              <option value="COLLECTED">Tahsil edildi</option>
              <option value="PAID">Ödendi</option>
              <option value="BOUNCED">Karşılıksız</option>
              <option value="CANCELLED">İptal</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Not</Label>
            <Input name="notes" defaultValue={editing?.notes ?? ""} className="mt-1 h-10" />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>İptal</Button>
          <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor…" : "Kaydet"}</Button>
        </div>
      </form>
    </div>
  );
}
