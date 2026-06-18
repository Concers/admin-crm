"use client";

import { Package, Receipt } from "lucide-react";
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
  rows: { id: number; tip: string; ad: string }[];
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
  return <UrunList rows={rows} onUpdate={updateUrun} onDelete={deleteUrun} emptyIcon={Package} />;
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
      onUpdate={updateGenelGider}
      onDelete={deleteGenelGider}
      searchPlaceholder="Gider türü ara..."
      emptyEntity="genel gider türü"
      emptyIcon={Receipt}
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
      onUpdate={updateUrunGider}
      onDelete={deleteUrunGider}
      searchPlaceholder="Ürün gider türü ara..."
      emptyEntity="ürün gider türü"
      emptyIcon={Receipt}
    />
  );
}
