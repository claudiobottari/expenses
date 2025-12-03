"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";

export default function LoginPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.16em] text-teal-200">
          Bentornato
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          Accedi al tuo bilancio
        </h1>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
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
          {loading ? "Accesso in corso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}
