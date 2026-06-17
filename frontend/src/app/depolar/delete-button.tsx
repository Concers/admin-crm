"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteWarehouseAction } from "./actions";

export function DeleteButton({ id, name }: { id: number; name: string }) {
  const { run, pending } = useActionToast();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={pending}
      title="Sil"
      aria-label="Sil"
      className="text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600"
      onClick={() => {
        if (confirm(`"${name}" silinsin mi?`)) {
          run(() => deleteWarehouseAction(id), { success: "Depo silindi." });
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
