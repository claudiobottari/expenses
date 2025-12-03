"use client";

import { useEffect, useMemo, useState } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { useSupabase } from "@/components/providers/supabase-provider";

type CategorySummary = {
  category_id: string;
  categories: { name: string | null; color: string | null } | null;
  total: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export default function SummaryPage() {
  const { supabase, profile } = useSupabase();
  const [startDate, setStartDate] = useState(
    startOfMonth(new Date()).toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(
    endOfMonth(new Date()).toISOString().slice(0, 10),
  );
  const [rows, setRows] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!profile?.household_id) return;
    setLoading(true);
    const { data } = await supabase
      .from("expenses")
      .select("category_id, categories(name, color), total:amount.sum()")
      .gte("date", startDate)
      .lte("date", endDate)
      .group("category_id, categories(name), categories(color)")
      .order("total", { ascending: false });

    setRows((data as CategorySummary[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [profile?.household_id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = useMemo(
    () => rows.reduce((acc, r) => acc + Number(r.total || 0), 0),
    [rows],
  );

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-teal-100">
              Riepilogo
            </p>
            <p className="text-lg font-semibold text-white">
              Totale: {loading ? "—" : formatCurrency(total)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-gray-200">
              Dal
              <input
                type="date"
                className="bg-transparent outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-gray-200">
              Al
              <input
                type="date"
                className="bg-transparent outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
        <p className="mb-3 text-sm font-semibold text-white">Per categoria</p>
        {loading ? (
          <p className="text-sm text-gray-300">Carico i dati...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-300">Nessuna spesa nel periodo.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.category_id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: row.categories?.color ?? "#0ea5e9" }}
                  />
                  <p className="text-sm text-white">
                    {row.categories?.name ?? "Categoria"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {formatCurrency(Number(row.total))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
