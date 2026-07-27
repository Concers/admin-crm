import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { TourProvider } from "@/components/tour/tour-provider";
import { getSession } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quora — İşletme Yönetim Sistemi",
  description: "Quora: depo, kasa, üretim ve cari kayıtlarını tek panelde toplayan yönetim sistemi",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ToastProvider>
          <TourProvider role={session?.role ?? null}>
            <AppShell role={session?.role ?? null} userName={session?.name ?? null}>
              {children}
            </AppShell>
          </TourProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
