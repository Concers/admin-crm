import { Download } from "lucide-react";

/** Download link to the CSV export proxy route (carries the session token). */
export function ExportButton({ type, label = "CSV İndir" }: { type: "sales" | "purchases" | "expenses"; label?: string }) {
  return (
    <a
      href={`/export/${type}`}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
    >
      <Download className="h-4 w-4" />
      {label}
    </a>
  );
}
