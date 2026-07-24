"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

type ImportType = "sales" | "purchases" | "expenses";

type ImportResult = {
  total: number;
  valid: number;
  invalid: number;
  errors: { row: number; error: string }[];
  committed: boolean;
  created?: number;
};

export function ImportButton({ type }: { type: ImportType }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function send(commit: boolean) {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/import/${type}${commit ? "?commit=true" : ""}`, {
      method: "POST",
      body: fd,
    });
    const data = (await res.json().catch(() => null)) as ImportResult | { error?: string } | null;
    if (!res.ok || !data || "error" in data) {
      toast.error("İçe aktarma başarısız (dosya biçimini kontrol edin).");
      return;
    }
    return data as ImportResult;
  }

  function onPreview() {
    startTransition(async () => {
      const data = await send(false);
      if (data) setPreview(data);
    });
  }

  function onCommit() {
    startTransition(async () => {
      const data = await send(true);
      if (data) {
        toast.success(`${data.created ?? 0} kayıt içe aktarıldı.`);
        setOpen(false);
        reset();
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
      >
        <Upload className="h-4 w-4" />
        İçe Aktar
      </button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : (setOpen(false), reset()))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dosyadan İçe Aktar</DialogTitle>
            <DialogDescription>
              Excel (.xlsx), CSV veya XML yükleyin. Önce önizleyin, sonra kaydedin. Sütun başlıkları
              dışa aktarılan dosyayla aynıdır (tarih, ürün, adet…).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[var(--border)] p-4 hover:bg-[var(--muted)]/30">
              <FileUp className="h-5 w-5 text-[var(--muted-foreground)]" />
              <span className="text-sm">
                {file ? (
                  <strong>{file.name}</strong>
                ) : (
                  "Dosya seçin (.xlsx / .csv / .xml)"
                )}
              </span>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.xml"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setPreview(null);
                }}
              />
            </label>

            {preview && (
              <div className="space-y-2 rounded-lg border border-[var(--border)] p-3 text-sm">
                <div className="flex flex-wrap gap-4">
                  <span>Toplam: <strong>{preview.total}</strong></span>
                  <span className="text-emerald-600">
                    Geçerli: <strong>{preview.valid}</strong>
                  </span>
                  <span className={preview.invalid ? "text-amber-600" : ""}>
                    Hatalı: <strong>{preview.invalid}</strong>
                  </span>
                </div>
                {preview.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded border border-[var(--border)] bg-[var(--muted)]/20 p-2">
                    <p className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5" /> Atlanacak satırlar:
                    </p>
                    <ul className="space-y-0.5 text-xs text-[var(--muted-foreground)]">
                      {preview.errors.map((e, i) => (
                        <li key={i}>
                          Satır {e.row}: {e.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {preview.valid > 0 && (
                  <p className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {preview.valid} geçerli kayıt kaydedilmeye hazır.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onPreview} disabled={!file || pending}>
                {pending && !preview ? "Okunuyor…" : "Önizle"}
              </Button>
              <Button
                type="button"
                onClick={onCommit}
                disabled={!preview || preview.valid === 0 || pending}
              >
                {pending ? "Kaydediliyor…" : `Kaydet${preview ? ` (${preview.valid})` : ""}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
