"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    supabase.auth.getSession().finally(() => {
      router.replace("/dashboard");
    });
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center text-gray-100">
      Reindirizzamento...
    </div>
  );
}
