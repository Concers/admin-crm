"use client";

import { Compass } from "lucide-react";
import { useTour } from "./tour-provider";

/**
 * Sol menüde yer alan "Tanıtım Turu" tetikleyicisi. NavLink ile aynı görünümde.
 * `data-tour="tour-button"` turun son adımının hedefidir.
 */
export function TourButton() {
  const { startTour } = useTour();
  return (
    <button
      type="button"
      data-tour="tour-button"
      onClick={startTour}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
    >
      <Compass className="h-4 w-4 shrink-0" />
      <span className="truncate">Tanıtım Turu</span>
    </button>
  );
}
