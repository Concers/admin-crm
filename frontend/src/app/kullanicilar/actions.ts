"use server";

import { revalidatePath } from "next/cache";
import { createUser, deleteUser } from "@/lib/api";

function trim(val: FormDataEntryValue | null) {
  return typeof val === "string" ? val.trim() : "";
}

export async function createUserAction(formData: FormData) {
  const name = trim(formData.get("name"));
  const email = trim(formData.get("email"));
  const password = trim(formData.get("password"));
  const role = trim(formData.get("role")) || "SALES_REP";
  if (!name || !email || !password) return;

  await createUser({ name, email, password, role });
  revalidatePath("/kullanicilar");
}

export async function deleteUserAction(id: number) {
  await deleteUser(id);
  revalidatePath("/kullanicilar");
}
