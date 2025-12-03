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
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, household_id")
      .eq("id", session.user.id)
      .single();
    setProfile(data ?? null);
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
