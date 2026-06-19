import type { DashboardHorizon } from "@/lib/api";

export function resolveDashboardHorizon(ay?: string): DashboardHorizon {
  switch (ay) {
    case "3":
      return 3;
    case "9":
      return 9;
    case "12":
      return 12;
    default:
      return 6;
  }
}
