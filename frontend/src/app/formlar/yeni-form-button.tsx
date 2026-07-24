"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { createFormAction } from "./actions";

export function YeniFormButton({ kind, label }: { kind: string; label: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createFormAction(kind);
          if (res.error) return toast.error(res.error);
          toast.success(`${label} oluşturuldu.`);
          if (res.id) router.push(`/formlar/${res.id}`);
        })
      }
      className="inline-flex items-center gap-1 rounded-md bg-[var(--primary)] px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
    >
      <Plus className="h-3.5 w-3.5" />
      {pending ? "…" : "Yeni"}
    </button>
  );
}
