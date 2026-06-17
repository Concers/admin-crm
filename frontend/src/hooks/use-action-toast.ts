"use client";

import { useTransition } from "react";
import { useToast } from "@/components/ui/toast";

export function useActionToast() {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function run(
    action: () => Promise<void | { error?: string }>,
    messages: { success: string; error?: string }
  ) {
    startTransition(async () => {
      try {
        const result = await action();
        // Server actions surface validation/stock errors by returning {error}
        // (thrown errors are sanitised by Next in production).
        if (result && typeof result === "object" && "error" in result && result.error) {
          toast.error(String(result.error));
          return;
        }
        toast.success(messages.success);
      } catch {
        toast.error(messages.error ?? "İşlem başarısız oldu.");
      }
    });
  }

  return { run, pending };
}
