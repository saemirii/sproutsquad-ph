import { getSupabaseAdmin } from "./supabaseAdmin";

// Apple App Store Guideline 5.1.1(v) requires apps that support account
// creation to also offer in-app account deletion. This must run server-side
// with the service-role key (supabaseAdmin.auth.admin.deleteUser) — deleting
// another auth.users row is not something the anon/client key can ever do.
// Every table with a user_id/seller_id/customer_id foreign key to auth.users
// is declared `on delete cascade` (see supabase/schema.sql and the later
// migrations), so this one call is enough to remove all of that user's data.
export async function deleteAccount(
  authHeader: string | null | undefined
): Promise<{ status: number; body: { error?: string } }> {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return { status: 500, body: { error: "Server not configured" } };

  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!token) return { status: 401, body: { error: "Unauthorized" } };

  const { data, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !data.user) return { status: 401, body: { error: "Unauthorized" } };

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(data.user.id);
  if (deleteError) return { status: 500, body: { error: deleteError.message } };

  return { status: 200, body: {} };
}
