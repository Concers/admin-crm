"use client";

import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import type { ProductLink, ProductLinkKind } from "@/lib/api";
import { addProductLinkAction, deleteProductLinkAction } from "../actions";

const KIND_LABEL: Record<ProductLinkKind, string> = {
  ARTICLE: "Bilimsel Makale",
  BLOG: "Blog Yazısı",
  INSTAGRAM: "Instagram İçeriği",
};

export function LinksEditor({ productId, links }: { productId: number; links: ProductLink[] }) {
  const { run, pending } = useActionToast();
  return (
    <div className="space-y-4">
      {links.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">Henüz bağlantı eklenmemiş.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)]">
          {links.map((l) => (
            <li key={l.id} className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs text-[var(--muted-foreground)]">
                    {KIND_LABEL[l.kind]}
                  </span>
                  {l.url ? (
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[var(--primary)] hover:underline"
                    >
                      {l.title}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-medium">{l.title}</span>
                  )}
                </div>
                {l.note && <p className="text-xs text-[var(--muted-foreground)]">{l.note}</p>}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-[var(--danger)]"
                disabled={pending}
                onClick={() =>
                  run(() => deleteProductLinkAction(productId, l.id), { success: "Bağlantı silindi." })
                }
                aria-label="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          run(() => addProductLinkAction(productId, new FormData(form)), {
            success: "Bağlantı eklendi.",
          });
          form.reset();
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Select name="kind" defaultValue="ARTICLE" aria-label="Tür">
          <option value="ARTICLE">Bilimsel Makale</option>
          <option value="BLOG">Blog Yazısı</option>
          <option value="INSTAGRAM">Instagram İçeriği</option>
        </Select>
        <Input name="title" required placeholder="Başlık / not" />
        <Input name="url" type="url" placeholder="https://… (opsiyonel)" />
        <Input name="note" placeholder="Ayırt edici kişisel not" />
        <div className="sm:col-span-2 lg:col-span-4">
          <Button type="submit" size="sm" disabled={pending}>
            <Plus className="h-4 w-4" />
            Bağlantı Ekle
          </Button>
        </div>
      </form>
    </div>
  );
}
