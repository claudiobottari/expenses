import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/../supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createSupabaseBrowserClient = () =>
  createClient<Database>(
    supabaseUrl ?? "http://localhost",
    supabaseKey ?? "missing-key",
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  );
