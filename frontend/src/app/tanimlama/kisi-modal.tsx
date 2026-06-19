"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Contact } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";

type PartnerRef = { id: number; ad: string };

export function KisiModal({
  partner,
  onClose,
  loadContacts,
  onCreate,
  onUpdate,
  onDelete,
}: {
  partner: PartnerRef;
  onClose: () => void;
  loadContacts: (partnerId: number) => Promise<Contact[]>;
  onCreate: (partnerId: number, fd: FormData) => Promise<{ error?: string } | void>;
  onUpdate: (id: number, fd: FormData) => Promise<{ error?: string } | void>;
  onDelete: (id: number) => Promise<{ error?: string } | void>;
}) {
  const { run, pending } = useActionToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadContacts(partner.id).then(setContacts);
  }, [partner.id, loadContacts]);

  function refresh() {
    loadContacts(partner.id).then(setContacts);
  }

  return (
    <FormModal
      title={`İletişim Kişileri — ${partner.ad}`}
      description="Cariye bağlı kişileri yönetin."
      onClose={onClose}
      pending={pending}
      submitLabel="Kapat"
      maxWidth="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Henüz kişi eklenmemiş.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
            {contacts.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {[c.title, c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => {
                      if (confirm(`"${c.name}" silinsin mi?`)) {
                        run(async () => {
                          await onDelete(c.id);
                          refresh();
                        }, { success: "Kişi silindi." });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Kişi ekle
        </Button>
      </div>

      {(adding || editing) && (
        <FormModal
          title={editing ? "Kişiyi Düzenle" : "Yeni Kişi"}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          pending={pending}
          submitLabel={editing ? "Kaydet" : "Ekle"}
          maxWidth="max-w-lg"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(async () => {
              if (editing) await onUpdate(editing.id, fd);
              else await onCreate(partner.id, fd);
              setAdding(false);
              setEditing(null);
              refresh();
            }, { success: editing ? "Kişi güncellendi." : "Kişi eklendi." });
          }}
        >
          <FormSection title="Kişi bilgileri">
            <div className="sm:col-span-2">
              <Label htmlFor="kisi-name">Ad *</Label>
              <Input id="kisi-name" name="name" required defaultValue={editing?.name ?? ""} />
            </div>
            <div>
              <Label htmlFor="kisi-title">Ünvan</Label>
              <Input id="kisi-title" name="title" defaultValue={editing?.title ?? ""} />
            </div>
            <div>
              <Label htmlFor="kisi-phone">Telefon</Label>
              <Input id="kisi-phone" name="phone" defaultValue={editing?.phone ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="kisi-email">E-posta</Label>
              <Input id="kisi-email" name="email" type="email" defaultValue={editing?.email ?? ""} />
            </div>
          </FormSection>
        </FormModal>
      )}
    </FormModal>
  );
}
