"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ExternalLink, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Attachment } from "@/lib/api";
import { addAttachment, loadAttachments, removeAttachment } from "@/lib/attachment-actions";
import { formatDate } from "@/lib/utils";

export function EntityAttachments({
  entityName,
  entityId,
  category,
  title = "Dosya Ekleri",
}: {
  entityName: string;
  entityId: number;
  /** Set to scope this box to one attachment category (ürün kartı: ANALIZ/SERTIFIKA/GORSEL/ETIKET). */
  category?: string;
  title?: string;
}) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await loadAttachments(entityName, entityId);
      setItems(category ? list.filter((a) => a.category === category) : list);
      setError(null);
    } catch {
      setError("Ekler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [entityName, entityId, category]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 p-4">
      <div className="flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-[var(--muted-foreground)]" />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {title}
        </h4>
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">
        Dosya yükleme yok; harici bağlantı (URL) ve dosya adı kaydedilir.
      </p>

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Yükleniyor…</p>
      ) : error ? (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">Henüz ek yok.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)] bg-white">
          {items.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <div className="min-w-0">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[var(--primary)] hover:underline"
                >
                  {a.fileName}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                <p className="text-xs text-[var(--muted-foreground)]">{formatDate(a.uploadedAt)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-[var(--danger)]"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await removeAttachment(a.id);
                    if (!res.error) await refresh();
                  });
                }}
                aria-label="Eki sil"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          fd.set("entityName", entityName);
          fd.set("entityId", String(entityId));
          if (category) fd.set("category", category);
          startTransition(async () => {
            const res = await addAttachment(fd);
            if (!res.error) {
              e.currentTarget.reset();
              await refresh();
            }
          });
        }}
      >
        <div>
          <Label htmlFor={`att-name-${entityId}`}>Dosya Adı</Label>
          <Input id={`att-name-${entityId}`} name="fileName" required placeholder="fatura-2024-001.pdf" />
        </div>
        <div>
          <Label htmlFor={`att-url-${entityId}`}>Bağlantı (URL)</Label>
          <Input
            id={`att-url-${entityId}`}
            name="url"
            type="url"
            required
            placeholder="https://..."
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Kaydediliyor…" : "Ek Ekle"}
          </Button>
        </div>
      </form>
    </div>
  );
}
