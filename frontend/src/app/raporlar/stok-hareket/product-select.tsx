"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";

export function ProductSelect({
  products,
  selected,
}: {
  products: string[];
  selected: string;
}) {
  const router = useRouter();
  return (
    <Select
      className="max-w-md"
      value={selected}
      onChange={(e) =>
        router.push(`/raporlar/stok-hareket?name=${encodeURIComponent(e.target.value)}`)
      }
    >
      {products.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </Select>
  );
}
