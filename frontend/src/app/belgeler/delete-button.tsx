"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";

/** Small client delete button used inside document list tables. */
export function DeleteButton({
  id,
  action,
  success,
}: {
  id: number;
  action: (id: number) => Promise<void>;
  success: string;
}) {
  const { run, pending } = useActionToast();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={pending}
      title="Sil"
      aria-label="Sil"
      onClick={() => {
        if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
        run(() => action(id), { success });
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
