// Formlar (§6) kataloğu. Teklif ve Talep ayrı modüllerde — hub'dan link verilir.
import type { FormKind } from "@/lib/api";

export const FORM_KIND_LABEL: Record<FormKind, string> = {
  SERVICE_CONTRACT: "Hizmet Sözleşmesi",
  TERMIN: "Termin Formu",
  JOB_APPLICATION: "İş Başvuru Formu",
  COOKIE_CONSENT: "Çerezler İçin Form",
  ECATALOG: "E-Katalog / Tanıtım Formu",
  OTHER: "Diğer Form",
};

/** Hub'da "yeni oluştur" kartı gösterilen genel form tipleri (Teklif/Talep hariç). */
export const FORM_KINDS: { kind: FormKind; label: string; hint: string }[] = [
  { kind: "SERVICE_CONTRACT", label: "Hizmet Sözleşmesi", hint: "Karma nitelikli / vekâlet / eser sözleşmesi" },
  { kind: "TERMIN", label: "Termin Formu", hint: "Teslim/üretim termin planı" },
  { kind: "JOB_APPLICATION", label: "İş Başvuru Formu", hint: "Aday başvuru bilgileri" },
  { kind: "COOKIE_CONSENT", label: "Çerezler İçin Form", hint: "Çerez aydınlatma/onay metni" },
  { kind: "ECATALOG", label: "E-Katalog / Tanıtım", hint: "Tanıtım / katalog metni" },
  { kind: "OTHER", label: "Diğer Form", hint: "Serbest belge" },
];

/** Hizmet Sözleşmesi alt türleri. */
export const CONTRACT_SUBTYPES = ["Karma nitelikli", "Vekâlet usulü ile", "Eser sözleşmesi"];

export const FORM_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Taslak",
  ACTIVE: "Aktif",
  ARCHIVED: "Arşiv",
};
