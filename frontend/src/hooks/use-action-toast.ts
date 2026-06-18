"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

type ActionResult = void | { error?: string };

export function useActionToast() {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, messages: { success: string; error?: string }) {
    startTransition(async () => {
      try {
        const result = await action();
        if (result && typeof result === "object" && "error" in result && result.error) {
          toast.error(String(result.error));
          return;
        }
        toast.success(messages.success);
        router.refresh();
      } catch {
        toast.error(messages.error ?? "İşlem başarısız oldu.");
      }
    });
  }

  return { run, pending };
}
