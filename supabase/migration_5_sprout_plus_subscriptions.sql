-- ===================================================================
-- Migration 5: Sprout+ subscription sync (RevenueCat integration).
--
-- RevenueCat remains the authoritative source for entitlement state — these
-- tables are only a lightweight, app-queryable mirror kept in sync by the
-- RevenueCat webhook handler (server.ts), which writes using the Supabase
-- service-role key and therefore bypasses RLS. Regular users can only ever
-- read their own row; nothing here is written by client-side code.
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

create table if not exists public.sprout_plus_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rc_app_user_id text not null,
  product_id text,
  entitlement text not null default 'sprout_plus',
  status text not null default 'inactive', -- 'active' | 'cancelling' | 'inactive'
  will_renew boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  last_event_type text,
  last_event_id text,
  updated_at timestamptz not null default now()
);

alter table public.sprout_plus_subscriptions enable row level security;

drop policy if exists "Users can view their own subscription" on public.sprout_plus_subscriptions;
create policy "Users can view their own subscription"
  on public.sprout_plus_subscriptions for select using (auth.uid() = user_id);

-- Deliberately no insert/update/delete policies for authenticated users —
-- only the webhook handler (service-role key) may write to this table.

-- Idempotency ledger: RevenueCat may redeliver the same webhook event more
-- than once. Recording processed event ids lets the handler detect and skip
-- a redelivery instead of double-applying it.
create table if not exists public.revenuecat_webhook_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now()
);

alter table public.revenuecat_webhook_events enable row level security;
-- No policies: this table is never read or written by client-side code, only
-- by the webhook handler via the service-role key (which bypasses RLS).
