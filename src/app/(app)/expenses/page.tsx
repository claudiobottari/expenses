"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Category, Expense, Wallet } from "@/lib/types";

type ExpenseWithRelations = Expense & {
  category?: { name: string | null };
  wallet?: { name: string | null };
};

const formatCurrency = (value: number) =>
  value.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export default function ExpensesPage() {
  const { supabase, session, profile } = useSupabase();
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    wallet: "",
    search: "",
  });
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!profile?.household_id || !session?.user.id) return;
    if (!window.confirm("Eliminare questa spesa?")) return;

    setActionError(null);
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("household_id", profile.household_id)
      .eq("created_by", session.user.id);

    if (error) {
      setActionError(error.message);
      return;
    }

    await loadExpenses();
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

        {actionError ? (
          <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {actionError}
          </p>
        ) : null}

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
                    className="text-xs text-red-300 underline"
                    onClick={() => handleDelete(exp.id)}
                  >
                    Elimina
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
