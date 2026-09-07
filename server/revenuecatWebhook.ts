import crypto from "crypto";
import { getSupabaseAdmin } from "./supabaseAdmin";

// Shared RevenueCat webhook processing logic, used by both the local Express
// server (server.ts) and the Netlify Function (netlify/functions/revenuecat-webhook.mts)
// so the two runtimes never drift out of sync with each other.

const REVENUECAT_WEBHOOK_AUTHORIZATION = process.env.REVENUECAT_WEBHOOK_AUTHORIZATION;
// Must exactly match the entitlement identifier configured in the RevenueCat
// dashboard (Project > Entitlements) — confirmed live against the actual
// configured name, same constant kept in sync with src/lib/revenuecat.ts.
const SPROUT_PLUS_ENTITLEMENT = "sproutsquad_membership";

// Timing-safe comparison so a malformed/short guess can't be distinguished
// from a correct-length wrong guess via response timing.
export function isAuthorizedWebhookRequest(header: string | null | undefined): boolean {
  if (!REVENUECAT_WEBHOOK_AUTHORIZATION || !header) return false;
  const expected = Buffer.from(REVENUECAT_WEBHOOK_AUTHORIZATION);
  const actual = Buffer.from(header);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

type RevenueCatWebhookEvent = {
  id?: string;
  type?: string;
  app_user_id?: string;
  product_id?: string;
  entitlement_ids?: string[];
  purchased_at_ms?: number;
  expiration_at_ms?: number;
  environment?: string;
};

// Maps a RevenueCat event type to the lightweight status mirrored in Supabase.
// RevenueCat itself remains the source of truth for entitlement state — this
// only drives what SproutSquad's own UI can query without calling RevenueCat.
function statusForEventType(type: string | undefined): { status: string; willRenew: boolean } {
  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "PRODUCT_CHANGE":
      return { status: "active", willRenew: true };
    case "CANCELLATION":
      return { status: "cancelling", willRenew: false };
    case "EXPIRATION":
    case "REFUND":
      return { status: "inactive", willRenew: false };
    case "BILLING_ISSUE":
      // Entitlement commonly stays active during a billing grace period —
      // don't flip it inactive purely from this event.
      return { status: "active", willRenew: true };
    default:
      return { status: "active", willRenew: true };
  }
}

export interface WebhookResult {
  status: number;
  body: Record<string, unknown>;
}

// Friendly copy for the account notification created alongside the
// subscription sync below — null means "don't bother notifying" (e.g. a
// PRODUCT_CHANGE swap between two active tiers isn't worth surfacing).
function notificationCopyForEvent(type: string | undefined): { title: string; message: string } | null {
  switch (type) {
    case "INITIAL_PURCHASE":
      return { title: "✨ Welcome to Sprout+!", message: "Your subscription is active — enjoy coupons, bundles, scheduling, and more." };
    case "RENEWAL":
      return { title: "✨ Sprout+ renewed", message: "Your subscription has renewed." };
    case "UNCANCELLATION":
      return { title: "✨ Subscription reactivated", message: "Your Sprout+ subscription is active again." };
    case "CANCELLATION":
      return { title: "Subscription set to cancel", message: "Your Sprout+ subscription won't renew after the current period ends." };
    case "EXPIRATION":
      return { title: "Subscription ended", message: "Your Sprout+ subscription is no longer active." };
    case "REFUND":
      return { title: "Subscription refunded", message: "Your Sprout+ purchase was refunded and access has been removed." };
    case "BILLING_ISSUE":
      return { title: "⚠️ Billing issue", message: "We couldn't process your Sprout+ payment — please update your billing details to avoid losing access." };
    default:
      return null;
  }
}

export async function processRevenueCatWebhookPayload(payload: unknown): Promise<WebhookResult> {
  const event: RevenueCatWebhookEvent | undefined = (payload as { event?: RevenueCatWebhookEvent })?.event;
  if (!event?.id || !event.type || !event.app_user_id) {
    // Malformed payload — ack it anyway so RevenueCat doesn't retry forever,
    // but don't attempt to process it.
    console.error("RevenueCat webhook: malformed event payload", payload);
    return { status: 200, body: { received: true, processed: false } };
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    console.error("RevenueCat webhook received but SUPABASE_SERVICE_ROLE_KEY is not configured — cannot sync.");
    return { status: 200, body: { received: true, processed: false } };
  }

  // Idempotency: if we've already recorded this event id, this is a
  // RevenueCat retry/redelivery of an event we already handled. Insert acts
  // as a claim — a unique-violation means another delivery already won.
  //
  // We also record the raw app_user_id/entitlement_ids RevenueCat actually
  // sent, and (below) why an event was skipped if it was — queryable
  // directly in Supabase so diagnosing a "why didn't this sync" question
  // never requires server log access.
  const { error: dedupeError } = await supabaseAdmin
    .from("revenuecat_webhook_events")
    .insert({
      event_id: event.id,
      event_type: event.type,
      app_user_id: event.app_user_id,
      entitlement_ids: event.entitlement_ids ?? null,
    });

  if (dedupeError) {
    if (dedupeError.code === "23505") {
      // Duplicate delivery of an event we've already processed — ack and stop.
      return { status: 200, body: { received: true, processed: false, duplicate: true } };
    }
    console.error("RevenueCat webhook: failed to record event for idempotency", dedupeError);
    return { status: 500, body: { error: "Failed to process webhook" } };
  }

  const recordSkipReason = (reason: string) =>
    supabaseAdmin.from("revenuecat_webhook_events").update({ skip_reason: reason }).eq("event_id", event.id!);

  // Only sync events for our Sprout+ entitlement.
  if (event.entitlement_ids && !event.entitlement_ids.includes(SPROUT_PLUS_ENTITLEMENT)) {
    await recordSkipReason("unrelated_entitlement");
    return { status: 200, body: { received: true, processed: false, reason: "unrelated entitlement" } };
  }

  // The RevenueCat app_user_id should be the Supabase auth user's UUID (that's
  // what SproutSquad identifies with) — guard against anonymous/malformed ids.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.app_user_id);
  if (!isUuid) {
    console.error(`RevenueCat webhook: app_user_id "${event.app_user_id}" is not a SproutSquad user id — skipping DB sync.`);
    await recordSkipReason("non_user_app_user_id");
    return { status: 200, body: { received: true, processed: false, reason: "non-user app_user_id" } };
  }

  const { status, willRenew } = statusForEventType(event.type);

  const { error: upsertError } = await supabaseAdmin
    .from("sprout_plus_subscriptions")
    .upsert({
      user_id: event.app_user_id,
      rc_app_user_id: event.app_user_id,
      product_id: event.product_id ?? null,
      entitlement: SPROUT_PLUS_ENTITLEMENT,
      status,
      will_renew: willRenew,
      current_period_start: event.purchased_at_ms ? new Date(event.purchased_at_ms).toISOString() : null,
      current_period_end: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
      last_event_type: event.type,
      last_event_id: event.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (upsertError) {
    console.error("RevenueCat webhook: failed to upsert subscription record", upsertError);
    await recordSkipReason(`upsert_failed: ${upsertError.message}`);
    return { status: 500, body: { error: "Failed to process webhook" } };
  }

  // Account notification — not gated by any notification_preferences category
  // (subscription changes are the kind of thing a user shouldn't be able to
  // silently miss). Best-effort: a failure here shouldn't fail the whole
  // webhook, since the subscription sync above already succeeded.
  const copy = notificationCopyForEvent(event.type);
  if (copy) {
    const { error: notifyError } = await supabaseAdmin.from("notifications").insert({
      user_id: event.app_user_id,
      type: "subscription_update",
      title: copy.title,
      message: copy.message,
      related_type: "subscription",
      action: { view: "subscription" },
    });
    if (notifyError) console.error("RevenueCat webhook: failed to create subscription notification", notifyError);
  }

  await recordSkipReason(""); // cleared — fully processed, nothing to explain
  return { status: 200, body: { received: true, processed: true } };
}
