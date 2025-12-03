import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { PWARegister } from "@/components/pwa-register";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Family Expenses",
  description:
    "PWA minimale per tracciare le spese familiari con Supabase + Next.js",
  metadataBase: new URL("https://expenses.vercel.app"),
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <SupabaseProvider>
          <PWARegister />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
