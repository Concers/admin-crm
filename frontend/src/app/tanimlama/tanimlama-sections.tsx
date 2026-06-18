"use client";

import type { PartnerType } from "@/lib/api";
import {
  deleteGenelGider,
  deleteTedarikci,
  deleteUrun,
  deleteUrunGider,
  updateGenelGider,
  updateTedarikci,
  updateUrun,
  updateUrunGider,
} from "./actions";
import { SimpleAdList, TedarikciList, UrunList } from "./tanimlama-lists";

export function TedarikciListClient({
  rows,
}: {
  rows: { id: number; tip: PartnerType; ad: string }[];
}) {
  return (
    <TedarikciList
      rows={rows}
      onUpdate={updateTedarikci}
      onDelete={deleteTedarikci}
    />
  );
}

export function UrunListClient({ rows }: { rows: { id: number; ad: string; raf: string }[] }) {
  return (
    <UrunList
      rows={rows}
      onUpdate={updateUrun}
      onDelete={deleteUrun}
    />
  );
}

export function GenelGiderListClient({
  rows,
}: {
  rows: { id: number; ad: string }[];
}) {
  return (
    <SimpleAdList
      rows={rows}
      label="Gider Türü"
      editTitle="Genel Gider Türünü Düzenle"
      onUpdate={updateGenelGider}
      onDelete={deleteGenelGider}
      searchPlaceholder="Gider türü ara…"
      emptyText="Henüz genel gider türü eklenmemiş"
    />
  );
}

export function UrunGiderListClient({
  rows,
}: {
  rows: { id: number; ad: string }[];
}) {
  return (
    <SimpleAdList
      rows={rows}
      label="Gider Türü"
      editTitle="Ürün Gider Türünü Düzenle"
      onUpdate={updateUrunGider}
      onDelete={deleteUrunGider}
      searchPlaceholder="Ürün gider türü ara…"
      emptyText="Henüz ürün gider türü eklenmemiş"
    />
  );
}
