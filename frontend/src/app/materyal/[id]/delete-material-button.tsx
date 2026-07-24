"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteMaterialAction } from "../actions";

export function DeleteMaterialButton({ id }: { id: number }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-[var(--danger)] hover:bg-red-50"
      onClick={() => {
        if (!confirm("Bu materyal kartı silinsin mi?")) return;
        startTransition(async () => {
          const res = await deleteMaterialAction(id);
          if (res && "error" in res && res.error) {
            toast.error(String(res.error));
            return;
          }
          toast.success("Materyal silindi.");
          router.push("/materyal");
        });
      }}
    >
      <Trash2 className="h-4 w-4" />
      Materyali Sil
    </Button>
  );
}
