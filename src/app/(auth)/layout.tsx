"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          {pathname === "/register" ? (
            <Link
              href="/login"
              className="text-sm font-medium text-teal-200 underline"
            >
              Accedi
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
