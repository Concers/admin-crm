"use client";

import { type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

/**
 * Shared record modal, built on the shadcn/ui Dialog (Radix): focus-trapping,
 * scroll-lock and Escape handling come for free. A sticky header sits above a
 * scrollable form body; closing is blocked while a submit is `pending`.
 */
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
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent
        showClose={!pending}
        className={cn("flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0", maxWidth)}
        onInteractOutside={(e) => {
          if (pending) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (pending) e.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 border-b border-[var(--border)] px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex-1 space-y-4 overflow-y-auto p-6">
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
      </DialogContent>
    </Dialog>
  );
}
