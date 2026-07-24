"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteProductAction } from "../actions";

export function DeleteProductButton({ id }: { id: number }) {
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
        if (!confirm("Bu ürün kartı silinsin mi?")) return;
        startTransition(async () => {
          const res = await deleteProductAction(id);
          if (res && "error" in res && res.error) {
            toast.error(String(res.error));
            return;
          }
          toast.success("Ürün silindi.");
          router.push("/urun-detay");
        });
      }}
    >
      <Trash2 className="h-4 w-4" />
      Ürünü Sil
    </Button>
  );
}
