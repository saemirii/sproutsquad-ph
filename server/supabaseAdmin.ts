import { createClient } from "@supabase/supabase-js";

// Server-side only Supabase client using the service-role key, which bypasses
// RLS. Never import this from client (src/) code — it must only run in a
// server process (Express locally, a Netlify Function in production), and
// the key must never be sent to the browser.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;
