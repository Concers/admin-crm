"use server";

import { revalidatePath } from "next/cache";
import { createPaymentInstrument, deletePaymentInstrument, updatePaymentInstrument } from "@/lib/api";
import { dateInputToApi } from "@/lib/dates";

function buildPayload(formData: FormData) {
  const partnerName = String(formData.get("partnerName") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const issueDate = String(formData.get("issueDate") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  if (!partnerName || amount <= 0 || !issueDate || !dueDate) {
    return { error: "Cari, tutar ve tarihler zorunludur." as const };
  }
  const accountRaw = Number(formData.get("accountId"));
  return {
    body: {
      type: String(formData.get("type") ?? "CHEQUE"),
      direction: String(formData.get("direction") ?? "RECEIVABLE"),
      partnerName,
      accountId: accountRaw > 0 ? accountRaw : null,
      number: String(formData.get("number") ?? "").trim() || null,
      amount,
      currency: String(formData.get("currency") ?? "TRY").trim().toUpperCase() || "TRY",
      issueDate: dateInputToApi(issueDate),
      dueDate: dateInputToApi(dueDate),
      status: String(formData.get("status") ?? "PORTFOLIO"),
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  };
}

export async function saveInstrument(formData: FormData, id?: number) {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;
  try {
    if (id) await updatePaymentInstrument(id, payload.body);
    else await createPaymentInstrument(payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt başarısız." };
  }
  revalidatePath("/finans/cek-senet");
}

export async function removeInstrument(id: number) {
  await deletePaymentInstrument(id);
  revalidatePath("/finans/cek-senet");
}
