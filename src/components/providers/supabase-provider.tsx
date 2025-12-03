"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/../supabase/types";
import { defaultCategories, defaultWallets } from "@/lib/seeds";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type SupabaseContextValue = {
  supabase: SupabaseClient<Database>;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined,
);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!session) {
      setProfile(null);
      return;
    }
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, full_name, email, household_id, created_at")
      .eq("id", session.user.id)
      .maybeSingle();

    if (existing) {
      if (!existing.household_id) {
        const { data: newHouse } = await supabase
          .from("households")
          .insert({ name: existing.full_name ?? existing.email ?? "Casa" })
          .select("id")
          .single();

        if (newHouse?.id) {
          await supabase
            .from("profiles")
            .update({ household_id: newHouse.id })
            .eq("id", existing.id);

          await supabase
            .from("wallets")
            .insert(defaultWallets.map((w) => ({ ...w, household_id: newHouse.id })));
          await supabase
            .from("categories")
            .insert(defaultCategories.map((c) => ({ ...c, household_id: newHouse.id })));

          const { data: refreshed } = await supabase
            .from("profiles")
            .select("id, full_name, email, household_id, created_at")
            .eq("id", session.user.id)
            .single();
          setProfile((refreshed as Profile) ?? null);
          return;
        }
      } else {
        setProfile(existing as Profile);
        return;
      }
    }

    // Autocreazione profilo/household se mancante
    const { data: household } = await supabase
      .from("households")
      .insert({ name: session.user.user_metadata?.household_name ?? "Casa" })
      .select("id")
      .single();

    if (!household) {
      setProfile(null);
      return;
    }

    await supabase.from("profiles").upsert({
      id: session.user.id,
      household_id: household.id,
      full_name: session.user.user_metadata?.full_name ?? session.user.email,
      email: session.user.email,
    });

    await supabase
      .from("wallets")
      .insert(defaultWallets.map((w) => ({ ...w, household_id: household.id })));
    await supabase
      .from("categories")
      .insert(defaultCategories.map((c) => ({ ...c, household_id: household.id })));

    const { data: fresh } = await supabase
      .from("profiles")
      .select("id, full_name, email, household_id, created_at")
      .eq("id", session.user.id)
      .single();

    setProfile((fresh as Profile) ?? null);
  }, [session, supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const value: SupabaseContextValue = {
    supabase,
    session,
    profile,
    loading,
    refreshProfile: loadProfile,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error("useSupabase deve essere usato dentro SupabaseProvider");
  }
  return ctx;
};
