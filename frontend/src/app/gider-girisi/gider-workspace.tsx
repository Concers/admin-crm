"use client";

import { useState } from "react";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { GiderTable } from "./gider-table";
import { GiderModal } from "./gider-modal";
import type { GiderTableRow } from "./gider-rows";

export function GiderWorkspace({
  rows,
  genelGiderTurleri,
  urunGiderTurleri,
  urunler,
  tedarikciler,
}: {
  rows: GiderTableRow[];
  genelGiderTurleri: string[];
  urunGiderTurleri: string[];
  urunler: string[];
  tedarikciler: string[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<GiderTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Gider Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni gider ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />

      <GiderTable
        rows={rows}
        onEdit={setEditing}
      />

      {createOpen && (
        <GiderModal
          mode="create"
          genelGiderTurleri={genelGiderTurleri}
          urunGiderTurleri={urunGiderTurleri}
          urunler={urunler}
          tedarikciler={tedarikciler}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {editing && (
        <GiderModal
          mode="edit"
          row={editing}
          genelGiderTurleri={genelGiderTurleri}
          urunGiderTurleri={urunGiderTurleri}
          urunler={urunler}
          tedarikciler={tedarikciler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
