"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Wallet2 } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Wallet } from "@/lib/types";

export default function WalletsPage() {
  const { supabase, profile } = useSupabase();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [form, setForm] = useState({
    name: "",
    currency: "EUR",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!profile?.household_id) return;
    const { data } = await supabase
      .from("wallets")
      .select("*")
      .order("is_active", { ascending: false })
      .order("name");
    setWallets((data as Wallet[]) ?? []);
  };

  useEffect(() => {
    load();
  }, [profile?.household_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile?.household_id) return;
    setSaving(true);
    await supabase.from("wallets").insert({
      ...form,
      is_active: true,
      household_id: profile.household_id,
    });
    setForm({ name: "", currency: "EUR" });
    await load();
    setSaving(false);
  };

  const toggle = async (wallet: Wallet) => {
    if (!profile?.household_id) return;
    await supabase
      .from("wallets")
      .update({ is_active: !wallet.is_active })
      .eq("id", wallet.id);
    await load();
  };

  if (!profile?.household_id) {
    return (
      <div className="text-sm text-gray-200">
        Profilo in caricamento... riprova tra poco.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
        <p className="text-sm uppercase tracking-[0.12em] text-teal-100">
          Nuovo portafoglio
        </p>
        <form onSubmit={handleSave} className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-gray-200">Nome</span>
            <input
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-teal-400"
              placeholder="Carta partner, Contanti..."
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <label className="space-y-1 md:col-span-1">
            <span className="text-sm text-gray-200">Valuta</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-teal-400"
              value={form.currency}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))
              }
            />
          </label>
          <div className="md:col-span-3 md:flex md:justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-teal-500 px-4 py-2 font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400 disabled:opacity-60"
            >
              {saving ? "Salvo..." : "Aggiungi"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
        <p className="mb-3 text-sm font-semibold text-white">Portafogli</p>
        {wallets.length === 0 ? (
          <p className="text-sm text-gray-300">Nessun portafoglio.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/20 text-teal-100">
                    <Wallet2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{wallet.name}</p>
                    <p className="text-xs text-gray-400">{wallet.currency}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(wallet)}
                  className={`text-xs font-semibold ${
                    wallet.is_active ? "text-teal-100" : "text-gray-400"
                  }`}
                >
                  {wallet.is_active ? "Attivo" : "Disattivato"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
