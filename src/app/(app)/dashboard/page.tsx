"use client";

import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight, Flame } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Expense } from "@/lib/types";

type ExpenseWithRelations = Expense & {
  category?: { name: string | null; color: string | null };
  wallet?: { name: string | null };
};

const formatCurrency = (value: number) =>
  value.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export default function DashboardPage() {
  const { supabase, profile } = useSupabase();
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    if (!profile?.household_id) return;
    setLoading(true);
    const start = startOfMonth(new Date()).toISOString().slice(0, 10);
    const end = endOfMonth(new Date()).toISOString().slice(0, 10);

    const { data } = await supabase
      .from("expenses")
      .select(
        "id, amount, date, description, category:categories(name, color), wallet:wallets(name)",
      )
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false })
      .limit(50);

    setExpenses((data as ExpenseWithRelations[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadExpenses();
  }, [profile?.household_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const monthlyTotal = useMemo(
    () => expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0),
    [expenses],
  );

  const groupedByCategory = useMemo(() => {
    return expenses.reduce<Record<string, { total: number; color: string | null }>>(
      (acc, exp) => {
        const key = exp.category?.name ?? "Altro";
        const prev = acc[key]?.total ?? 0;
        acc[key] = { total: prev + Number(exp.amount || 0), color: exp.category?.color ?? null };
        return acc;
      },
      {},
    );
  }, [expenses]);

  if (!profile?.household_id) {
    return (
      <div className="text-sm text-gray-200">
        Profilo in caricamento... riprova tra un istante.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-teal-100">
              Totale mese
            </p>
            <p className="text-3xl font-semibold text-white">
              {loading ? "—" : formatCurrency(monthlyTotal)}
            </p>
            <p className="text-sm text-gray-300">
              {format(new Date(), "MMMM yyyy", { locale: it })}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-2 text-sm text-teal-100">
            <Flame size={16} />
            Rapido da telefono
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Categorie del mese</p>
            <ArrowDownRight size={16} className="text-gray-300" />
          </div>
          {Object.keys(groupedByCategory).length === 0 ? (
            <p className="text-sm text-gray-300">Nessuna spesa registrata.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(groupedByCategory).map(([name, info]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: info.color ?? "#0ea5e9" }}
                    />
                    <p className="text-sm text-white">{name}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(info.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Ultime spese</p>
            <ArrowUpRight size={16} className="text-gray-300" />
          </div>
          {expenses.length === 0 ? (
            <p className="text-sm text-gray-300">Aggiungi la prima spesa.</p>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 6).map((exp) => (
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
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(Number(exp.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}
