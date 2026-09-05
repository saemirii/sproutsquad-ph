<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/43cc515a-c570-4d41-98d2-7af94c447d9c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Create a Supabase project, then copy its project URL and anon key into `.env.local`:
   `VITE_SUPABASE_URL=https://your-project.supabase.co`
   `VITE_SUPABASE_ANON_KEY=your-anon-key`
4. In the Supabase SQL Editor, run [supabase/schema.sql](supabase/schema.sql) to create profiles, shops, ownership policies, and the new-user profile trigger.
5. In Supabase Authentication settings, choose whether email confirmation is required for new accounts.
6. Run the app:
   `npm run dev`

The app now opens on a Supabase email login/sign-up screen. Authenticated users can use the existing marketplace and seller OS, and newly created storefronts are also written to the `businesses` table with the signed-in user as `seller_id`.

## Deploying to Netlify

This app's backend (`/api/health`, `/api/ai-coach`, `/api/revenuecat-webhook`) is an Express server (`server.ts`) for local dev and any Node host (Cloud Run, Render, Railway, etc.) — but Netlify's standard hosting doesn't run a persistent Node server like that. For Netlify, the same backend logic (shared from `server/aiCoach.ts` and `server/revenuecatWebhook.ts`, so the two never drift apart) is exposed instead as three Netlify Functions in [`netlify/functions/`](netlify/functions/), wired up by [`netlify.toml`](netlify.toml).

1. Connect the repo to Netlify (or `netlify deploy`). `netlify.toml` already sets the build command (`npm run build:netlify`, which is just `vite build` — the client bundle only, since Netlify builds the functions separately) and the functions directory.
2. In Netlify → Site configuration → Environment variables, set the **same 3 vars** described above (`VITE_REVENUECAT_PUBLIC_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `REVENUECAT_WEBHOOK_AUTHORIZATION`) plus `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `GEMINI_API_KEY`. **Local `.env.local` is never read by Netlify** — it's gitignored and machine-local only.
3. Trigger a deploy (adding/changing env vars doesn't take effect until the next build — `VITE_*` vars are baked into the static bundle at build time).
4. Point the RevenueCat webhook URL at `https://<your-site>.netlify.app/api/revenuecat-webhook`.
5. Verify: `https://<your-site>.netlify.app/api/health` should return `{"status":"ok","app":"SproutSquad"}`. If it doesn't, the functions aren't deployed/wired correctly — check the Netlify deploy log's Functions section.

To test Netlify Functions locally before deploying: `npx netlify-cli dev` (uses `[dev]` in `netlify.toml`, which serves the pre-built `dist/` + functions directly rather than trying to proxy this project's custom Express dev server).

## Sprout+ Subscriptions (RevenueCat)

Sprout+ (the paid tier) is powered by RevenueCat's Web Billing SDK. This section is the map for how it fits together.

**SDK installed:** [`@revenuecat/purchases-js`](https://www.npmjs.com/package/@revenuecat/purchases-js) (Web/JavaScript SDK — this is a browser app, not React Native/iOS/Android). All calls to it are confined to [`src/lib/revenuecat.ts`](src/lib/revenuecat.ts); nothing else imports the SDK directly.

**Environment variables** (see [.env.example](.env.example)):
| Variable | Where it's used | Secret? |
|---|---|---|
| `VITE_REVENUECAT_PUBLIC_KEY` | Client (`src/lib/revenuecat.ts`) | No — public key, safe in the bundle |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (`server.ts` webhook handler) | **Yes** — never expose to the browser |
| `REVENUECAT_WEBHOOK_AUTHORIZATION` | Server only (`server.ts` webhook handler) | **Yes** — shared secret, must match the RevenueCat dashboard's webhook Authorization header |

**Products & entitlement:** two products, one entitlement — feature access is always checked via the entitlement, never the product id:
- `sprout_plus_monthly`, `sprout_plus_yearly` → both grant → `sproutsquad_membership`

The entitlement identifier is **not** `sprout_plus` despite the constant's name (`SPROUT_PLUS_ENTITLEMENT` in `src/lib/revenuecat.ts` and `server/revenuecatWebhook.ts`) — it was originally spec'd as `sprout_plus`, but the live RevenueCat dashboard actually has it configured as `sproutsquad_membership`. This was a real bug caught live: every purchase event (including a genuine `INITIAL_PURCHASE`) was being silently skipped as "unrelated entitlement" until the constant was corrected to match. **If you ever rename the entitlement in the dashboard, update the constant in both files to match** — a mismatch here breaks `hasSproutPlus` entirely, not just cosmetic labeling.

**User identity:** the Supabase auth user's `id` (same one used everywhere else in the app) is used directly as the RevenueCat App User ID (`identifyRevenueCatUser` in `AppContext.tsx`, on login). On sign-out, RevenueCat is reset to a fresh anonymous identity (`resetRevenueCatUser`) so the next person on the same browser never inherits the previous user's entitlements.

**How purchases work:** `SubscriptionPage.tsx` fetches the current RevenueCat Offering and renders whatever `monthly`/`annual` packages it contains — prices are always read from `package.webBillingProduct.price.formattedPrice`, never hardcoded. Buying calls `purchase({ rcPackage })`; a cancelled checkout is treated as a no-op (not an error), and a real failure shows a friendly message (`describePurchasesError`) without ever surfacing raw SDK/network details.

**How entitlement checks work:** `AppContext` exposes `hasSproutPlus` (boolean) and `subscription` (a `SproutPlusStatus`: status/renewal date/managementURL/etc.), refreshed on login and on window focus (the Web SDK has no push listener for entitlement changes). Wrap any paid feature in `<SproutPlusGate featureName="...">` ([`src/components/SproutPlusGate.tsx`](src/components/SproutPlusGate.tsx)) to show it only when entitled, or a "View Sprout+" upgrade prompt otherwise. **Client-side entitlement checks are a UX convenience only** — see Security below.

**Restore purchases:** the Web SDK ties purchases directly to the identified app user id (there's no separate device receipt to restore, unlike mobile). "Restore Purchases" re-fetches customer info for the current user and updates the UI — this is the web equivalent.

**Cancellation/expiration:** a cancelled subscription keeps the entitlement active (and features unlocked) until its `expirationDate` actually passes — `SubscriptionPage` shows a "Cancelling" badge and end date in the meantime, never revoking access early.

**Webhooks:** `POST /api/revenuecat-webhook` — served by `server.ts` (Express) locally/on a Node host, or by [`netlify/functions/revenuecat-webhook.mts`](netlify/functions/revenuecat-webhook.mts) on Netlify (see "Deploying to Netlify" above); both call the same shared logic in [`server/revenuecatWebhook.ts`](server/revenuecatWebhook.ts). Verifies the `Authorization` header against `REVENUECAT_WEBHOOK_AUTHORIZATION` (timing-safe comparison), then handles `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `UNCANCELLATION`, `EXPIRATION`, `BILLING_ISSUE`, `REFUND`. Idempotent: each event's `id` is recorded in `revenuecat_webhook_events` first, and a duplicate delivery is detected (unique-constraint violation) and skipped — verified live against the real Supabase project, including the update-not-duplicate path (a second event for the same user correctly updates the existing row).

**Supabase sync:** [`supabase/migration_5_sprout_plus_subscriptions.sql`](supabase/migration_5_sprout_plus_subscriptions.sql) adds `sprout_plus_subscriptions` (one row per user, RLS-readable by that user only, written only by the webhook via the service-role key) and `revenuecat_webhook_events` (idempotency ledger, no client access at all). **RevenueCat remains authoritative** for real-time entitlement state (that's what `hasSproutPlus` actually checks) — this table is only a lightweight, queryable mirror for app-side reporting; it does not gate any feature by itself.

**RevenueCat vs. Supabase split:**
- RevenueCat: subscriptions, entitlements, renewals/cancellations/expirations, billing events, purchase/subscription analytics.
- Supabase: everything else (products, inventory, orders, expenses, businesses, profiles) — completely untouched by this integration — plus the lightweight subscription mirror above.

**Security:** never trust a client-provided "I'm subscribed" flag for anything that matters server-side — `hasSproutPlus` in the client is a UI/UX check only. The webhook is the only server-side writer of subscription state, and it authenticates every request before touching the database.

### Testing Sprout+ locally

1. Sign up at [app.revenuecat.com](https://app.revenuecat.com), connect Stripe (or Paddle), and create a Web Billing app.
2. Create products `sprout_plus_monthly` / `sprout_plus_yearly`, an entitlement attached to both (whatever you name it — just make sure it matches `SPROUT_PLUS_ENTITLEMENT` in both `src/lib/revenuecat.ts` and `server/revenuecatWebhook.ts`), and an Offering with a `monthly` and `annual` package.
3. Copy the Web Billing **public** API key into `VITE_REVENUECAT_PUBLIC_KEY` in `.env.local`.
4. Run the app, sign in, open the profile sheet → "Upgrade to Sprout+ or Bloom+" → confirm real prices load and a sandbox purchase completes.
5. For webhooks: set `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API), run the migration above, generate a random string for `REVENUECAT_WEBHOOK_AUTHORIZATION`, set the same value in RevenueCat → Project Settings → Webhooks (URL: `https://<your-deployed-app>/api/revenuecat-webhook`, Authorization header: that value).
6. Trigger a sandbox purchase/cancellation/renewal and confirm a row appears/updates in `sprout_plus_subscriptions`.

### Manual RevenueCat dashboard configuration still required

- [x] RevenueCat project + Web Billing app configured — verified live: a current Offering exists with Monthly/Annual packages and priced products.
- [ ] **Check product identifiers**: they currently come back as `Monthly` / `Yearly`, not the spec'd `sprout_plus_monthly` / `sprout_plus_yearly`. Entitlement-gating (`hasSproutPlus`) works either way, but the "Your current plan" badge and plan-name labels on the pricing cards won't match correctly until either the dashboard products are renamed or [`SPROUT_PLUS_PRODUCTS`](src/lib/revenuecat.ts) is updated to the real IDs.
- [x] Entitlement confirmed — it's actually named `sproutsquad_membership` in the dashboard (not `sprout_plus`, the original spec name). Caught live via the `revenuecat_webhook_events.skip_reason` ledger (every event showed `unrelated_entitlement`); fixed by updating `SPROUT_PLUS_ENTITLEMENT` in both `src/lib/revenuecat.ts` and `server/revenuecatWebhook.ts` to match.
- [x] `VITE_REVENUECAT_PUBLIC_KEY` set locally (`.env.local`) — verified working against the live RevenueCat account.
- [x] `supabase/migration_5_sprout_plus_subscriptions.sql` has been run against the production Supabase project (verified: the table exists and RLS is enforced).
- [x] `SUPABASE_SERVICE_ROLE_KEY` set locally — verified working: a real webhook call correctly wrote/updated a row.
- [x] `REVENUECAT_WEBHOOK_AUTHORIZATION` set locally — verified the auth check, idempotency, and update-path all work end-to-end.
- [ ] **None of the 3 vars above are set in Netlify's own environment variables yet** (Site configuration → Environment variables) — `.env.local` only affects your local machine, Netlify never reads it. This is why the live Netlify site currently shows "Sprout+ purchases are not configured yet."
- [ ] Configure the RevenueCat webhook to point at `https://<your-netlify-site>/api/revenuecat-webhook` (not `localhost`).
- [ ] After setting the Netlify env vars, trigger a new deploy — `VITE_*` vars are baked in at build time, so adding them alone isn't enough.
- [ ] Decide on and test real payment methods for your market (RevenueCat Web Billing routes through Stripe/Paddle — it does not natively process GCash/Maya the way the marketplace's own order checkout does).
