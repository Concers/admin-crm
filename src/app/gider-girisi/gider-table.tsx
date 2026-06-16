"use client";

import { DataTable } from "@/components/data-table";
import { DeleteGiderButton } from "./gider-form";
import type { GiderTableRow } from "./gider-rows";

export function GiderTable({ rows }: { rows: GiderTableRow[] }) {
  return (
    <DataTable
      rows={rows}
      searchKeys={[
        "giderTuru",
        "urunAdi",
        "tedarikciAdi",
        "notlar",
        "ay",
        "giderKategori",
      ]}
      columns={[
        { key: "gun", label: "Gün" },
        { key: "ay", label: "Ay" },
        { key: "yil", label: "Yıl" },
        { key: "giderKategori", label: "Genel / Ürün" },
        { key: "giderTuru", label: "Gider Türü" },
        { key: "periyotAy", label: "Periyot (Ay)" },
        { key: "urunAdi", label: "Ürün Adı" },
        { key: "tedarikciAdi", label: "Tedarikçi / Hizmet" },
        { key: "toplamTutar", label: "Toplam Tutar" },
        { key: "pesinOdenen", label: "Peşin Ödenen" },
        {
          key: "notlar",
          label: "Notlar",
          render: (row) => (
            <span className="block max-w-[200px] truncate" title={row.notlar || undefined}>
              {row.notlar || "-"}
            </span>
          ),
        },
        { key: "aylikGiderPayi", label: "Aylık Gider Payı" },
        { key: "baslangicDonem", label: "Başlangıç Dönem" },
        { key: "bitisDonem", label: "Bitiş Dönem" },
        { key: "baslangicTarihi", label: "Başlangıç Tarihi" },
        { key: "bitisTarihi", label: "Bitiş Tarihi" },
        {
          key: "id",
          label: "",
          sortable: false,
          render: (row) => <DeleteGiderButton id={row.id} />,
        },
      ]}
    />
  );
}
