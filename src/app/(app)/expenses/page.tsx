"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Category, Expense, Wallet } from "@/lib/types";

type ExpenseWithRelations = Expense & {
  category?: { name: string | null };
  wallet?: { name: string | null };
};

const today = new Date().toISOString().slice(0, 10);

const formatCurrency = (value: number) =>
  value.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export default function ExpensesPage() {
  const { supabase, session, profile } = useSupabase();
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    wallet: "",
    search: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
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
    if (!profile?.household_id) return;
    setLoading(true);
    const { data } = await supabase
      .from("expenses")
      .select("*, category:categories(name), wallet:wallets(name)")
      .order("date", { ascending: false })
      .limit(100);

    setExpenses((data as ExpenseWithRelations[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadLookups();
    loadExpenses();
  }, [profile?.household_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesCategory = filters.category
        ? exp.category_id === filters.category
        : true;
      const matchesWallet = filters.wallet ? exp.wallet_id === filters.wallet : true;
      const matchesSearch = filters.search
        ? (exp.description || "").toLowerCase().includes(filters.search.toLowerCase())
        : true;
      return matchesCategory && matchesWallet && matchesSearch;
    });
  }, [expenses, filters]);

  const resetForm = () => {
    setForm({
      amount: "",
      category_id: categories[0]?.id ?? "",
      wallet_id: wallets[0]?.id ?? "",
      date: today,
      description: "",
    });
    setEditingId(null);
  };

  useEffect(() => {
    if (categories.length && !form.category_id) {
      setForm((prev) => ({ ...prev, category_id: categories[0].id }));
    }
    if (wallets.length && !form.wallet_id) {
      setForm((prev) => ({ ...prev, wallet_id: wallets[0].id }));
    }
  }, [categories, wallets]); // eslint-disable-line react-hooks/exhaustive-deps

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

    if (editingId) {
      await supabase.from("expenses").update(payload).eq("id", editingId);
    } else {
      await supabase.from("expenses").insert(payload);
    }

    await loadExpenses();
    resetForm();
    setSaving(false);
  };

  if (!profile?.household_id) {
    return (
      <div className="text-sm text-gray-200">
        Profilo in caricamento... riprova tra un attimo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-teal-100">
              Aggiungi spesa
            </p>
            <p className="text-lg font-semibold text-white">
              Inserimento rapido in pochi tap
            </p>
          </div>
          {editingId ? (
            <button
              onClick={resetForm}
              className="text-sm text-teal-100 underline"
            >
              Nuova spesa
            </button>
          ) : null}
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
              rows={2}
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
              {saving ? "Salvo..." : editingId ? "Aggiorna" : "Aggiungi"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-teal-100">
              Storico spese
            </p>
            <p className="text-lg font-semibold text-white">Filtra e cerca</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <select
              className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-teal-400"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">Tutte le categorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-teal-400"
              value={filters.wallet}
              onChange={(e) => setFilters((f) => ({ ...f, wallet: e.target.value }))}
            >
              <option value="">Tutti i portafogli</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            <input
              type="search"
              className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-white outline-none placeholder:text-gray-500 focus:border-teal-400"
              placeholder="Cerca descrizione"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-300">Carico le spese...</p>
        ) : filteredExpenses.length === 0 ? (
          <p className="text-sm text-gray-300">Nessuna spesa trovata.</p>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {exp.description || "Spesa"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {exp.category?.name ?? "Categoria"} · {exp.wallet?.name ?? "Portafoglio"} ·{" "}
                    {format(new Date(exp.date), "d MMM yyyy", { locale: it })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(Number(exp.amount))}
                  </p>
                  <button
                    className="text-xs text-teal-100 underline"
                    onClick={() => {
                      setEditingId(exp.id);
                      setForm({
                        amount: String(exp.amount),
                        category_id: exp.category_id,
                        wallet_id: exp.wallet_id,
                        date: exp.date.slice(0, 10),
                        description: exp.description || "",
                      });
                    }}
                  >
                    Modifica
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
