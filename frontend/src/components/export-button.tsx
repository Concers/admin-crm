"use client";

import {
  ChevronDown,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileType,
  FileDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ExportType = "sales" | "purchases" | "expenses";

const FORMATS: {
  format: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { format: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet },
  { format: "pdf", label: "PDF (.pdf)", icon: FileDown },
  { format: "csv", label: "CSV (.csv)", icon: FileText },
  { format: "xml", label: "XML (.xml)", icon: FileCode },
  { format: "doc", label: "Word (.doc)", icon: FileType },
];

/**
 * Download menu for a list export. Each item links to the format-aware export
 * proxy route (which carries the session token). Anchors let the browser handle
 * the download natively.
 */
export function ExportButton({ type, label = "Dışa Aktar" }: { type: ExportType; label?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          <Download className="h-4 w-4" />
          {label}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {FORMATS.map((f) => (
          <DropdownMenuItem key={f.format} asChild>
            <a href={`/export/${type}?format=${f.format}`} download>
              <f.icon className="h-4 w-4 text-[var(--muted-foreground)]" />
              {f.label}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
