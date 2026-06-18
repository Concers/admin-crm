"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RecordWorkspaceToolbar({
  addLabel,
  onAdd,
  hint,
}: {
  addLabel: string;
  onAdd: () => void;
  hint?: string;
}) {
  return (
    <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
      {hint ? (
        <p className="text-sm text-[var(--muted-foreground)]">{hint}</p>
      ) : (
        <span />
      )}
      <Button onClick={onAdd} className="w-full shrink-0 sm:w-auto">
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
