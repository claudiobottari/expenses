"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Palette } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const { supabase, profile } = useSupabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    type: "expense",
    color: "#0ea5e9",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!profile?.household_id) return;
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("is_active", { ascending: false })
      .order("name");
    setCategories((data as Category[]) ?? []);
  };

  useEffect(() => {
    load();
  }, [profile?.household_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile?.household_id) return;
    setSaving(true);
    await supabase.from("categories").insert({
      ...form,
      is_default: false,
      is_active: true,
      household_id: profile.household_id,
    });
    setForm({ name: "", type: "expense", color: "#0ea5e9" });
    await load();
    setSaving(false);
  };

  const toggle = async (cat: Category) => {
    if (!profile?.household_id) return;
    await supabase
      .from("categories")
      .update({ is_active: !cat.is_active })
      .eq("id", cat.id);
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
          Nuova categoria
        </p>
        <form onSubmit={handleSave} className="mt-3 grid gap-3 md:grid-cols-4">
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-gray-200">Nome</span>
            <input
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-teal-400"
              placeholder="Es. Utenze"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <label className="space-y-1 md:col-span-1">
            <span className="text-sm text-gray-200">Tipo</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-teal-400"
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="expense">Spesa</option>
              <option value="income">Entrata</option>
            </select>
          </label>
          <label className="space-y-1 md:col-span-1">
            <span className="text-sm text-gray-200 flex items-center gap-2">
              Colore <Palette size={16} />
            </span>
            <input
              type="color"
              className="h-[42px] w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-teal-400"
              value={form.color}
              onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
            />
          </label>
          <div className="md:col-span-4 md:flex md:justify-end">
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
        <p className="mb-3 text-sm font-semibold text-white">Categorie</p>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-300">Nessuna categoria.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.color ?? "#0ea5e9" }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{cat.name}</p>
                    <p className="text-xs text-gray-400">
                      {cat.type === "income" ? "Entrata" : "Spesa"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(cat)}
                  className={`text-xs font-semibold ${
                    cat.is_active ? "text-teal-100" : "text-gray-400"
                  }`}
                >
                  {cat.is_active ? "Attiva" : "Disattiva"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
