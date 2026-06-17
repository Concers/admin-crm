"use server";

import { revalidatePath } from "next/cache";
import { createWarehouse, deleteWarehouse } from "@/lib/api";

function trim(val: FormDataEntryValue | null) {
  return typeof val === "string" ? val.trim() : "";
}

export async function createWarehouseAction(formData: FormData) {
  const name = trim(formData.get("name"));
  const location = trim(formData.get("location"));
  if (!name) return;

  await createWarehouse({ name, location: location || null });
  revalidatePath("/depolar");
}

export async function deleteWarehouseAction(id: number) {
  await deleteWarehouse(id);
  revalidatePath("/depolar");
}
