"use client";

import { useTransition } from "react";
import { useToast } from "@/components/ui/toast";

export function useActionToast() {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function run(
    action: () => Promise<void>,
    messages: { success: string; error?: string }
  ) {
    startTransition(async () => {
      try {
        await action();
        toast.success(messages.success);
      } catch {
        toast.error(messages.error ?? "İşlem başarısız oldu.");
      }
    });
  }

  return { run, pending };
}
