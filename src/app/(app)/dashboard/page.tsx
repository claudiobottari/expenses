"use client";

import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ArrowUpRight } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Expense, Category, Wallet } from "@/lib/types";

type ExpenseWithRelations = Expense & {
  category?: { name: string | null; color: string | null };
  wallet?: { name: string | null };
};

const formatCurrency = (value: number) =>
  value.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

const today = new Date().toISOString().slice(0, 10);

export default function DashboardPage() {
  const { supabase, session, profile } = useSupabase();
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    category_id: "",
    wallet_id: "",
    date: today,
    description: "",
  });

  const loadLookups = async () => {
    if (!profile?.household_id) return;
    const [{ data: cats }, { data: walls }] = await Promise.all([
      supabase.from("categories").select("*").eq("is_active", true).order("name"),
      supabase.from("wallets").select("*").eq("is_active", true).order("name"),
    ]);
    setCategories((cats as Category[]) ?? []);
    setWallets((walls as Wallet[]) ?? []);
  };

  const loadExpenses = async () => {
    if (!profile?.household_id || !session?.user.id) return;
    setLoading(true);

    const { data } = await supabase
      .from("expenses")
      .select(
        "id, amount, date, description, category:categories(name, color), wallet:wallets(name)",
      )
      .eq("household_id", profile.household_id)
      .eq("created_by", session.user.id)
      .order("date", { ascending: false })
      .limit(5);

    setExpenses((data as ExpenseWithRelations[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadLookups();
    loadExpenses();
  }, [profile?.household_id, session?.user.id]);

  useEffect(() => {
    if (categories.length && !form.category_id) {
      setForm((prev) => ({ ...prev, category_id: categories[0].id }));
    }
    if (wallets.length && !form.wallet_id) {
      setForm((prev) => ({ ...prev, wallet_id: wallets[0].id }));
    }
  }, [categories, wallets]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile?.household_id || !session?.user.id) return;
    setSaving(true);

    const payload = {
      amount: Number(form.amount),
      category_id: form.category_id,
      wallet_id: form.wallet_id,
      date: form.date,
      description: form.description,
      currency: "EUR",
      created_by: session.user.id,
      household_id: profile.household_id,
    };

    await supabase.from("expenses").insert(payload);

    setForm({
      amount: "",
      category_id: categories[0]?.id ?? "",
      wallet_id: wallets[0]?.id ?? "",
      date: today,
      description: "",
    });

    await loadExpenses();
    setSaving(false);
  };

  if (!profile?.household_id) {
    return (
      <div className="text-sm text-gray-200">
        Profilo in caricamento... riprova tra un istante.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-teal-600/20 to-white/5 p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-teal-100">
              Benvenuto
            </p>
            <p className="text-xl font-semibold text-white">
              {profile?.full_name || "Membro della casa"}
            </p>
          </div>
          <p className="text-sm text-gray-200">
            Salva le spese appena le pensi: il flusso è ottimizzato per 3 tap.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.12em] text-teal-100">
            Aggiungi spesa
          </p>
        </div>
        <form onSubmit={handleSave} className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 md:col-span-1">
            <span className="text-sm text-gray-200">Importo (€)</span>
            <input
              type="number"
              required
              inputMode="decimal"
              step="0.01"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none placeholder:text-gray-500 focus:border-teal-400"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
          </label>
          <label className="space-y-1 md:col-span-1">
            <span className="text-sm text-gray-200">Categoria</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-teal-400"
              value={form.category_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category_id: e.target.value }))
              }
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 md:col-span-1">
            <span className="text-sm text-gray-200">Portafoglio</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-teal-400"
              value={form.wallet_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, wallet_id: e.target.value }))
              }
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 md:col-span-1">
            <span className="text-sm text-gray-200">Data</span>
            <input
              type="date"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-teal-400"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </label>
          <label className="md:col-span-3">
            <span className="text-sm text-gray-200">Nota</span>
            <textarea
              rows={1}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none placeholder:text-gray-500 focus:border-teal-400"
              placeholder="Descrizione breve"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </label>
          <div className="md:col-span-1 md:flex md:flex-col md:justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-teal-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400 disabled:opacity-60"
            >
              {saving ? "Salvo..." : "Aggiungi"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Ultime spese (tue)</p>
          <ArrowUpRight size={16} className="text-gray-300" />
        </div>
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-300">Aggiungi la prima spesa.</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {exp.description || exp.category?.name || "Spesa"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {exp.wallet?.name ?? "Portafoglio"} ·{" "}
                    {format(new Date(exp.date), "d MMM", { locale: it })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {exp.category?.color && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: exp.category.color }}
                    />
                  )}
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(Number(exp.amount))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
