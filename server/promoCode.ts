import crypto from "crypto";
import { getSupabaseAdmin } from "./supabaseAdmin";

// Shared promo-code redemption logic, used by both the local Express server
// (server.ts) and the Netlify Function (netlify/functions/redeem-promo-code.mts)
// so the two runtimes never drift out of sync with each other.
//
// Grants a real RevenueCat promotional entitlement (server-side, via the
// account's Secret API key — never exposed to the client) to whichever
// account redeems the shared code. Built for giving reviewers/judges free
// Sprout+ access without a real purchase; the code is a single shared
// value, not tracked per-redemption, since the intended audience is small.

// Must exactly match the entitlement identifier configured in the RevenueCat
// dashboard (Project > Entitlements) — same constant kept in sync with
// src/lib/revenuecatConstants.ts and server/revenuecatWebhook.ts.
const SPROUT_PLUS_ENTITLEMENT = "sproutsquad_membership";

// One month is comfortably longer than any judging window, while bounding
// exposure if the shared code ever leaks past its intended audience. V2's
// grant_entitlement action wants an absolute expiry, not a duration enum.
const GRANT_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// Read lazily (inside the function), not at module scope — ES module imports
// are hoisted and execute before the importing file's own top-level code, so
// in server.ts's local Express entrypoint a module-scope read here would run
// *before* its dotenv.config() call and always see undefined. Netlify's
// deployed functions don't have this problem (env vars are injected before
// any code runs), but reading lazily costs nothing there either. Mirrors
// getSupabaseAdmin()'s same fix for the same underlying issue.
function isCorrectCode(submitted: string): boolean {
  const judgePromoCode = process.env.JUDGE_PROMO_CODE;
  if (!judgePromoCode) return false;
  const expected = Buffer.from(judgePromoCode.trim().toUpperCase());
  const actual = Buffer.from(submitted.trim().toUpperCase());
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

export async function redeemPromoCode(
  authHeader: string | null | undefined,
  code: string | null | undefined
): Promise<{ status: number; body: { success: boolean; message?: string } }> {
  const revenueCatSecretApiKey = process.env.REVENUECAT_SECRET_API_KEY;
  const revenueCatProjectId = process.env.REVENUECAT_PROJECT_ID;
  if (!revenueCatSecretApiKey || !revenueCatProjectId || !process.env.JUDGE_PROMO_CODE) {
    return { status: 500, body: { success: false, message: "Promo codes aren't configured on the server yet." } };
  }
  if (!code || !isCorrectCode(code)) {
    return { status: 400, body: { success: false, message: "That code isn't valid." } };
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return { status: 500, body: { success: false, message: "Server not configured" } };

  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!token) return { status: 401, body: { success: false, message: "Unauthorized" } };

  const { data, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !data.user) return { status: 401, body: { success: false, message: "Unauthorized" } };

  // V2 API (matches "V2" secret keys, created under Project Settings > API
  // Keys > V2 — incompatible with the older V1 "subscribers/.../promotional"
  // endpoint, which only accepts V1-generation keys).
  const response = await fetch(
    `https://api.revenuecat.com/v2/projects/${encodeURIComponent(revenueCatProjectId)}/customers/${encodeURIComponent(data.user.id)}/actions/grant_entitlement`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${revenueCatSecretApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entitlement_id: SPROUT_PLUS_ENTITLEMENT,
        expires_at: Date.now() + GRANT_DURATION_MS,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("Failed to grant promotional entitlement", response.status, errorBody);
    return { status: 502, body: { success: false, message: "Couldn't activate Sprout+ right now — please try again shortly." } };
  }

  return { status: 200, body: { success: true, message: "Sprout+ unlocked! Enjoy full access." } };
}
