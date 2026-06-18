"use client";

import { createContext, useContext } from "react";
import type { UserRole } from "@/lib/roles";

type LayoutContextValue = {
  role: UserRole | null;
  userName: string | null;
};

const LayoutContext = createContext<LayoutContextValue>({
  role: null,
  userName: null,
});

export function LayoutProvider({
  role,
  userName,
  children,
}: LayoutContextValue & { children: React.ReactNode }) {
  return (
    <LayoutContext.Provider value={{ role, userName }}>{children}</LayoutContext.Provider>
  );
}

export function useLayoutSession() {
  return useContext(LayoutContext);
}
