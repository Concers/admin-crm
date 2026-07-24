"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { AMBALAJ_ALT_TURLERI, MATERYAL_KATEGORILERI, MATERYAL_SCOPE } from "@/lib/materyal-fields";
import { createMaterialAction } from "./actions";

export function YeniMateryalForm() {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [category, setCategory] = useState("AMBALAJ");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setPending(true);
        (async () => {
          const res = await createMaterialAction(fd);
          setPending(false);
          if (res.error) {
            toast.error(res.error);
            return;
          }
          toast.success("Materyal kartı oluşturuldu.");
          if (res.id) router.push(`/materyal/${res.id}`);
        })();
      }}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="lg:col-span-2">
        <Label htmlFor="m-name">Materyal Adı *</Label>
        <Input id="m-name" name="name" required placeholder="ör. Doypack 500ml Kraft" />
      </div>
      <div>
        <Label htmlFor="m-category">Kategori *</Label>
        <Select
          id="m-category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {MATERYAL_KATEGORILERI.map((k) => (
            <option key={k.code} value={k.code}>
              {k.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="m-subType">Alt Tür</Label>
        <Input
          id="m-subType"
          name="subType"
          list="ambalaj-alt-tur"
          placeholder={category === "AMBALAJ" ? "ör. Doypack" : "opsiyonel"}
        />
        <datalist id="ambalaj-alt-tur">
          {AMBALAJ_ALT_TURLERI.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>
      <div>
        <Label htmlFor="m-scope">Kullanım</Label>
        <Select id="m-scope" name="scope" defaultValue="OWN">
          {MATERYAL_SCOPE.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex items-end lg:col-span-5">
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          {pending ? "Oluşturuluyor…" : "Materyal Kartı Aç"}
        </Button>
      </div>
    </form>
  );
}
