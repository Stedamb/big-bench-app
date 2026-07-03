import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — copy .env.example to .env and fill in the values."
  );
}

// Same project as the web app (BigBenchApp/src/integrations/supabase/client.ts).
// Untyped client: the web app's checked-in database.types.ts is stale — it's
// missing the `benches`/`bench_colors` tables entirely (confirmed by
// `npx tsc --noEmit` failing against it here). Regenerating types from the
// live schema is a roadmap prerequisite; see the roadmap doc.
// AsyncStorage replaces localStorage as the session persistence layer; a real
// build should upgrade this to expo-secure-store for at-rest token encryption.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
