"use client";

import "shepherd.js/dist/css/shepherd.css";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Tour } from "shepherd.js";
import type { UserRole } from "@/lib/roles";
import {
  buildSteps,
  TOUR_PENDING_KEY,
  TOUR_STORAGE_KEY,
  type TourStepDef,
} from "./tour-config";

type TourContextValue = {
  /** Turu başlatır. Anasayfada değilsek önce oraya yönlendirir. */
  startTour: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}

const sel = (id: string) => `[data-tour="${id}"]`;

export function TourProvider({
  role,
  children,
}: {
  role: UserRole | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const tourRef = useRef<Tour | null>(null);

  const runTour = useCallback(async () => {
    if (typeof window === "undefined") return;
    // Önceki tur kalıntısını temizle.
    tourRef.current?.complete();

    const Shepherd = (await import("shepherd.js")).default;
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      exitOnEsc: true,
      keyboardNavigation: true,
      defaultStepOptions: {
        scrollTo: { behavior: "smooth", block: "center" },
        cancelIcon: { enabled: true },
        classes: "kadim-tour",
        modalOverlayOpeningPadding: 4,
        modalOverlayOpeningRadius: 8,
      },
    });

    const allSteps = buildSteps(role);
    // Hedefi DOM'da bulunmayan adımları (role göre gizli menüler) ele.
    const steps = allSteps.filter(
      (s) => !s.attach || document.querySelector(sel(s.attach)),
    );

    steps.forEach((s: TourStepDef, i: number) => {
      const isFirst = i === 0;
      const isLast = i === steps.length - 1;
      tour.addStep({
        id: s.id,
        title: s.title,
        text: s.text,
        attachTo: s.attach ? { element: sel(s.attach), on: s.on ?? "bottom" } : undefined,
        buttons: [
          ...(isFirst
            ? []
            : [{ text: "Geri", action: () => tour.back(), secondary: true }]),
          {
            text: isLast ? "Bitir" : "İleri",
            action: () => (isLast ? tour.complete() : tour.next()),
          },
        ],
      });
    });

    const markDone = () => {
      try {
        window.localStorage.setItem(TOUR_STORAGE_KEY, "1");
      } catch {
        /* localStorage erişilemiyorsa sessizce geç */
      }
    };
    tour.on("complete", markDone);
    tour.on("cancel", markDone);

    tourRef.current = tour;
    tour.start();
  }, [role]);

  const startTour = useCallback(() => {
    if (pathname === "/") {
      runTour();
      return;
    }
    // Tur anasayfadaki kartlara da değiniyor; oraya gidip orada başlat.
    try {
      window.sessionStorage.setItem(TOUR_PENDING_KEY, "1");
    } catch {
      /* yoksay */
    }
    router.push("/");
  }, [pathname, runTour, router]);

  // Anasayfaya gelindiğinde: bekleyen tetikleme ya da ilk ziyaret ise turu başlat.
  useEffect(() => {
    if (pathname !== "/") return;
    let pending = false;
    let firstVisit = false;
    try {
      pending = window.sessionStorage.getItem(TOUR_PENDING_KEY) === "1";
      firstVisit = !window.localStorage.getItem(TOUR_STORAGE_KEY);
    } catch {
      /* yoksay */
    }
    if (!pending && !firstVisit) return;
    if (pending) {
      try {
        window.sessionStorage.removeItem(TOUR_PENDING_KEY);
      } catch {
        /* yoksay */
      }
    }
    // DOM ve grafiklerin yerleşmesi için kısa gecikme.
    const t = setTimeout(() => runTour(), 600);
    return () => clearTimeout(t);
  }, [pathname, runTour]);

  // Sayfa değişiminde / unmount'ta aktif turu kapat.
  useEffect(() => {
    return () => {
      tourRef.current?.complete();
      tourRef.current = null;
    };
  }, []);

  const value = useMemo(() => ({ startTour }), [startTour]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
