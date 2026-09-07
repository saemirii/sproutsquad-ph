import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side only Supabase client using the service-role key, which bypasses
// RLS. Never import this from client (src/) code — it must only run in a
// server process (Express locally, a Netlify Function in production), and
// the key must never be sent to the browser.
//
// Built lazily (on first call), not at module load. ES module imports are
// hoisted and always execute before any of the importing file's own
// top-level statements — so in server.ts's local Express entrypoint, this
// module's env var reads used to run *before* its dotenv.config() call,
// silently resolving to null every time regardless of what's actually in
// .env.local. Netlify's deployed functions never hit this: the platform
// injects env vars before the function code runs at all, no dotenv call
// involved. Reading process.env inside a function instead of at module
// scope defers it until something actually calls this, by which point
// dotenv has long since run.
let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  cached = supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

  return cached;
}
