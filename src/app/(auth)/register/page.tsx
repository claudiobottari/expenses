"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { defaultCategories, defaultWallets } from "@/lib/seeds";

export default function RegisterPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [fullName, setFullName] = useState("");
  const [householdName, setHouseholdName] = useState("Casa");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Registrazione non riuscita");
      setLoading(false);
      return;
    }

    const { data: householdRow, error: householdError } = await supabase
      .from("households")
      .insert({ name: householdName || "Famiglia" })
      .select("id")
      .single();

    if (householdError || !householdRow) {
      setError(householdError?.message ?? "Errore creazione nucleo");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      household_id: householdRow.id,
      full_name: fullName,
      email,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // seed defaults, errors are non-blocking
    await supabase.from("wallets").insert(
      defaultWallets.map((w) => ({ ...w, household_id: householdRow.id })),
    );
    await supabase.from("categories").insert(
      defaultCategories.map((c) => ({ ...c, household_id: householdRow.id })),
    );

    router.replace("/dashboard");
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.16em] text-teal-200">
          Nuovo account
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          Registra la tua casa
        </h1>
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Nome completo</span>
          <input
            type="text"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-gray-500 focus:border-teal-400"
            placeholder="Claudio Bottari"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Nome nucleo familiare</span>
          <input
            type="text"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-gray-500 focus:border-teal-400"
            placeholder="Casa Bottari"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Email</span>
          <input
            type="email"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-gray-500 focus:border-teal-400"
            placeholder="tuo@email.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Password</span>
          <input
            type="password"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-gray-500 focus:border-teal-400"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-teal-500 px-4 py-3 text-center font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400 disabled:opacity-60"
        >
          {loading ? "Creazione..." : "Crea account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-300">
        Hai già un account?{" "}
        <Link href="/login" className="text-teal-200 underline">
          Accedi
        </Link>
      </p>
    </div>
  );
}
