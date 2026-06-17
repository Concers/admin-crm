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
import { SimpleAdList, TedarikciList } from "./tanimlama-lists";

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

export function UrunListClient({ rows }: { rows: { id: number; ad: string }[] }) {
  return (
    <SimpleAdList
      rows={rows}
      label="Ürün Adı"
      onUpdate={updateUrun}
      onDelete={deleteUrun}
      searchPlaceholder="Ürün ara..."
      emptyEntity="ürün"
      emptyIcon={Package}
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
