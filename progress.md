# SproutSquad — Project Progress (RevenueCat Shipaton)

> Context file for writing SproutSquad's RevenueCat Shipaton app description.
> Everything below reflects what is actually built in the codebase as of 2026-09-27.
> Fields marked **[TODO]** are not known yet — ask me rather than inventing them.

---

## 1. One-liner

SproutSquad is an iOS app that gives Filipino student-run businesses everything they need to sell, manage, grow, and learn — a campus marketplace, seller shop tools, merit-based discovery, and a gamified business academy — with a **Sprout+ / Bloom+ subscription powered by RevenueCat**.

## 2. The problem

- Thousands of students in the Philippines run real businesses on campus (baked goods, merch, prints, services).
- They run them through group chats, GCash screenshots, and notebooks: orders get lost, payments can't be verified, and profit is guesswork.
- New shops have no fair way to be discovered, and nobody teaches student founders practical business skills.

## 3. Who it's for

- **Student sellers** — run their shop, track money, and grow.
- **Student buyers** — discover and buy from campus businesses with clear payment and delivery.
- **Campus ambassadors / admins** — curate discovery and keep the marketplace safe.

## 4. Tech stack

- React 19 + TypeScript + Vite + Tailwind, wrapped as a native **iOS app with Capacitor 8**
- **Supabase** (Postgres, Auth, Row Level Security, Realtime, RPCs) — 37 SQL migrations
- **RevenueCat** — `@revenuecat/purchases-capacitor` (native StoreKit on iOS) and `@revenuecat/purchases-js` (Web Billing)
- Backend: Express (local/Node) and Netlify Functions (production), sharing the same server logic

## 5. Features (all built)

### Campus Marketplace (buyers)
- Browse campus shops by category; Campus Stories
- Product and business detail pages
- Multi-shop cart with a **per-shop checkout breakdown**
- Checkout: **GCash or Maya**, **mandatory proof-of-payment upload**; Lalamove, J&T Express, Cash on Delivery, or campus pickup spot; delivery date and notes
- **Real-time order tracking** stepper (placed → accepted → ready/out for delivery → completed)
- Report order issues
- Star reviews with photos; review reporting
- Safeguard: sellers can't buy from their own shop

### Shop (sellers)
- **Overview & Business Health Score**
- Products & margins
- Campus Orders: verify payment proof, update status, sort orders
- Delivery Dispatch
- **Expense Tracker with FIFO cost-of-goods tracking** (real profit, not just revenue)
- Shop settings and campus pickup spots
- **Start-Up Key (BES key) team access** — invite teammates to co-manage a shop
- Shop creation through an application form reviewed by admins

### SproutUp! — discovery with no AI and no paid ads
- Featured Sprouts, Hidden Gems, Rising Sprouts, Ambassador Picks, Community Picks
- Nomination form, ambassador pick form, "Sprouted Up!" badge
- Admin curation tools

### Sprout Academy — gamified business curriculum
- 8 modules: Find Your Roots · Build Your Shop · Know Your Money · Grow Your Brand · Turn Browsers into Buyers · Plan Your Growth · Read Your Numbers · Fuel Your Business
- Capstone: **The SproutSquad Business Challenge** (with capstone achievements)
- Lessons, quizzes, business simulations, case-study challenges
- XP and Seeds, a growing garden (sprout → bud → bloom → grove), quests, achievements, leaderboards, squads, Seed Shop
- Offline-capable Academy engine; server-side reward integrity (can't farm rewards)

### Notifications
- In-app notification bell for order events and subscription events, with per-category preferences

### Accounts, admin & safety
- Email auth, password reset, profile with contact number, account deletion
- Admin panel: create businesses, user roles, SproutUp! tools, reported order issues, reported reviews
- Row Level Security throughout, two rounds of security hardening, drop-scheduler hardening

## 6. Subscription: Sprout+ / Bloom+ (RevenueCat)

### Plans
| Plan | Billing | Product ID | Entitlement |
|---|---|---|---|
| Free | — | — | — |
| **Sprout+** | Monthly | `sprout_plus_monthly` | `sproutsquad_membership` |
| **Bloom+** | Yearly (priced to save vs. monthly) | `sprout_plus_yearly` | `sproutsquad_membership` |

Prices: **[TODO — PHP prices]** (the app reads them live from the RevenueCat Offering; none are hardcoded).

### What's free
Campus Marketplace, Shop, SproutUp!, Sprout Academy, Business Health Score, GCash & Maya payments, Start-Up Key team access.

### What Sprout+ / Bloom+ unlocks (6 seller power tools)
1. Real-time inventory tracking (with CSV export)
2. Pre-order system
3. Discount & coupon generator
4. Bundle Builder (bundles with their own price and inventory)
5. Order export (CSV)
6. Product Drop Scheduler (auto-launch products at a set date/time)

### How RevenueCat is integrated
- **One abstraction, two SDKs.** `src/lib/revenuecat.ts` is the only entry point. It dynamically loads the native Capacitor SDK (StoreKit) on iOS or the Web Billing SDK on web, so each platform only ships the SDK it needs. UI code never imports an SDK directly.
- **Entitlement-first access.** Both products grant one entitlement (`sproutsquad_membership`); features check the entitlement, never product IDs.
- **Dynamic paywall.** The paywall renders the current RevenueCat Offering's monthly/annual packages with live localized prices.
- **Identity.** The Supabase user ID is used as the RevenueCat App User ID on login, so subscriptions follow the user across devices. On sign-out, RevenueCat is reset to anonymous so the next user never inherits access.
- **Feature gating.** A reusable `<SproutPlusGate>` component and `hasSproutPlus` checks show locked features with an upgrade prompt.
- **Live entitlement updates.** A native customer-info listener unlocks features instantly on purchase, renewal, or restore (focus-based refresh on web).
- **Subscription management.** Status card with plan, renewal/end date, manage-subscription link, and **Restore Purchases** (real StoreKit restore on iOS). Cancelled subscriptions keep access until the period ends and show a "Cancelling" badge. Promotional grants show their own status.
- **Graceful errors.** A cancelled checkout is a silent no-op; real failures show friendly messages, never raw SDK errors.
- **Secure, idempotent webhook.** `/api/revenuecat-webhook` (Express and Netlify Function, shared logic) verifies the Authorization header with a timing-safe comparison, records each event ID to skip duplicates, and handles `INITIAL_PURCHASE`, `RENEWAL`, `PRODUCT_CHANGE`, `CANCELLATION`, `UNCANCELLATION`, `EXPIRATION`, `REFUND`, `BILLING_ISSUE`.
- **Supabase mirror + notifications.** The webhook syncs state into `sprout_plus_subscriptions` (user-readable only via RLS) and creates an in-app notification for each subscription event. RevenueCat stays the source of truth for access.
- **Webhook diagnostics.** Skip reasons are recorded in the database so issues can be debugged without server log access.
- **Judge promo code.** A server-side endpoint grants a real 30-day promotional entitlement via the RevenueCat **V2 API** (`grant_entitlement`); the secret key never touches the client.

### A real lesson learned
The first live purchase didn't unlock anything: the code checked for an entitlement named `sprout_plus`, but the dashboard's was `sproutsquad_membership`, so the webhook skipped every event as "unrelated." The webhook diagnostics surfaced it and it was fixed the same day (2026-09-05).

## 7. Build timeline

| Date | Milestone |
|---|---|
| 2026-09-03 | Project started |
| 2026-09-05 | App foundation; **RevenueCat Sprout+ subscriptions + webhook backend**; entitlement bug found and fixed; Coupon Generator and Order Export |
| 2026-09-06 | Bundle Builder, Pre-Orders, Product Drop Scheduler, Inventory Tracking (all 6 Sprout+ tools done); Academy gamification |
| 2026-09-08 | Notifications, order tracking, security hardening; **Capacitor iOS wrap + migration to native StoreKit billing via RevenueCat** |
| 2026-09-11 | Architecture refactor, reviews, App Store submission prep; removed the AI coach; launched **SproutUp!**; proof of payment and per-shop checkout |
| 2026-09-14 | Admin tools, more hardening; Academy rebuilt into the full 8-module curriculum |
| 2026-09-22 | Academy redesigned as a mission experience; FIFO COGS expense tracking; buyer checkout safeguards |

## 8. Positioning notes

- **Not an AI app.** The earlier "Sprout AI" / "Oliver AI co-pilot" was removed. Discovery is human- and merit-based by design. Don't mention AI features.
- **Built for the Philippines:** GCash/Maya, Lalamove/J&T, PHP pricing, campus pickup culture.
- **Fair freemium:** everything a student needs to run a shop is free; Sprout+ adds power tools for growing sellers.

## 9. Unknowns [TODO]

- Sprout+ and Bloom+ prices (PHP)
- Traction: users, shops, orders, Academy completions, subscribers
- Team members and roles
- Schools / campuses currently live
- App Store / TestFlight link, demo video link, judge promo code
- Tagline preference (current working line: "Where student founders grow")

## 10. What I want help with

Write SproutSquad's RevenueCat Shipaton app description: a clear hook, the problem, the solution, standout features, how RevenueCat powers monetization, and what's next. Keep it honest to what's listed here.
