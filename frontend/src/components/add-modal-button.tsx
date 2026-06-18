"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";

/** Tanımlama ve benzeri küçük formlar için modal ekleme düğmesi. */
export function AddModalButton({
  label,
  title,
  description,
  successMessage,
  action,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  successMessage: string;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {label}
      </Button>
      {open && (
        <AddModalForm
          title={title}
          description={description}
          successMessage={successMessage}
          action={action}
          onClose={() => setOpen(false)}
        >
          {children}
        </AddModalForm>
      )}
    </>
  );
}

function AddModalForm({
  title,
  description,
  successMessage,
  action,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  successMessage: string;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  onClose: () => void;
  children: ReactNode;
}) {
  const { run, pending } = useActionToast();
  return (
    <FormModal
      title={title}
      description={description}
      onClose={onClose}
      pending={pending}
      submitLabel="Kaydet"
      maxWidth="max-w-lg"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await action(new FormData(e.currentTarget));
          if (!result?.error) onClose();
          return result;
        }, { success: successMessage });
      }}
    >
      <div className="grid grid-cols-1 gap-4">{children}</div>
    </FormModal>
  );
}

export { RecordWorkspaceToolbar };
