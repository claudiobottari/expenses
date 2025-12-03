import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/../supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY sono obbligatori",
  );
}

export const createSupabaseBrowserClient = () =>
  createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
