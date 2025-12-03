"use client";

import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Household } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const { supabase, profile } = useSupabase();
  const [household, setHousehold] = useState<Household | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!profile?.household_id) return;
      const { data } = await supabase
        .from("households")
        .select("*")
        .eq("id", profile.household_id)
        .single();
      setHousehold((data as Household) ?? null);
    };
    load();
  }, [profile, supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
        <p className="text-sm uppercase tracking-[0.12em] text-teal-100">
          Profilo
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/20 text-teal-100">
            <User />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              {profile?.full_name || "Utente"}
            </p>
            <p className="text-sm text-gray-300">{profile?.email}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
        <p className="text-sm font-semibold text-white">Casa</p>
        <p className="text-sm text-gray-300">
          {household?.name ?? "Non definita"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Tutti i dati sono isolati per nucleo familiare con RLS.
        </p>
      </div>

      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-400"
      >
        <LogOut size={16} />
        Esci
      </button>
    </div>
  );
}
