"use client";

import { useEffect, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

type FormModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  pending?: boolean;
  submitLabel: string;
  maxWidth?: string;
  children: ReactNode;
};

export function FormModal({
  title,
  description,
  onClose,
  onSubmit,
  pending = false,
  submitLabel,
  maxWidth = "max-w-3xl",
  children,
}: FormModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        className={`max-h-[92vh] w-full ${maxWidth} overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
          <div>
            <h3 id="form-modal-title" className="text-lg font-semibold">
              {title}
            </h3>
            {description && (
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{description}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={pending}
            onClick={onClose}
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          {children}
          <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Kaydediliyor..." : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
