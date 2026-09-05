-- ===================================================================
-- Migration 6: add diagnostic visibility to the RevenueCat webhook ledger.
--
-- Debugging why a webhook event didn't produce a sprout_plus_subscriptions
-- row previously required reading server logs (not always accessible).
-- This records, per event, the raw app_user_id / entitlement_ids RevenueCat
-- sent and why an event was skipped (if it was) — queryable directly in
-- Supabase, no server log access needed.
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

alter table public.revenuecat_webhook_events add column if not exists app_user_id text;
alter table public.revenuecat_webhook_events add column if not exists entitlement_ids text[];
alter table public.revenuecat_webhook_events add column if not exists skip_reason text;
