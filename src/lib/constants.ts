export const CUSTOMER_STATUSES = [
  "Yeni",
  "Görüşülüyor",
  "Müşteri",
  "Kaybedildi",
] as const;

export const DEAL_STAGES = [
  "Teklif",
  "Görüşme",
  "Kazanıldı",
  "Kaybedildi",
] as const;

export function statusTone(status: string) {
  switch (status) {
    case "Müşteri":
    case "Kazanıldı":
      return "green";
    case "Görüşülüyor":
    case "Görüşme":
      return "amber";
    case "Kaybedildi":
      return "red";
    case "Teklif":
      return "blue";
    default:
      return "indigo";
  }
}
