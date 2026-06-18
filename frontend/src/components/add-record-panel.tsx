"use client";

import { useState, type ReactNode } from "react";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";

/** Liste + 「Yeni Ekle」 butonu + modal — tüm veri giriş sayfalarında ortak düzen. */
export function AddRecordPanel({
  addLabel,
  hint,
  children,
  renderModal,
}: {
  addLabel: string;
  hint?: string;
  children: ReactNode;
  renderModal: (props: { onClose: () => void }) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel={addLabel}
        hint={hint ?? "Satıra tıklayarak düzenleyebilir veya yeni kayıt ekleyebilirsiniz."}
        onAdd={() => setOpen(true)}
      />
      {children}
      {open && renderModal({ onClose: () => setOpen(false) })}
    </>
  );
}
