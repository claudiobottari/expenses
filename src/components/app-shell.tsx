"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  ListChecks,
  Menu,
  PlusCircle,
  Settings,
  Wallet,
} from "lucide-react";
import { Logo } from "./ui/logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/expenses", label: "Spese", icon: PlusCircle },
  { href: "/summary", label: "Riepilogo", icon: BarChart3 },
  { href: "/categories", label: "Categorie", icon: ListChecks },
  { href: "/wallets", label: "Portafogli", icon: Wallet },
  { href: "/settings", label: "Profilo", icon: Settings },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-20 pt-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 sm:block">
            PWA familiare
          </div>
        </div>
        <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 shadow-sm sm:flex">
          <Menu size={16} />
          Navigazione rapida
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="fixed bottom-4 left-1/2 flex w-[96%] max-w-4xl -translate-x-1/2 items-center justify-between rounded-2xl border border-white/10 bg-black/50 px-3 py-3 backdrop-blur">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium transition ${
                active ? "bg-white/10 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
