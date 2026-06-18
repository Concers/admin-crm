"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteGider } from "./actions";

export function DeleteGiderButton({ id }: { id: number }) {
  const { run, pending } = useActionToast();
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      title="Sil"
      onClick={() => {
        if (confirm("Silmek istediğinize emin misiniz?")) {
          run(() => deleteGider(id), { success: "Gider kaydı silindi." });
        }
      }}
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </Button>
  );
}
