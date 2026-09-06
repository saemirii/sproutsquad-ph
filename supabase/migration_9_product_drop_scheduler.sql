-- ===================================================================
-- Migration 9: Product Drop Scheduler (Sprout+ feature).
--
-- A product with a future drop_date is hidden from the marketplace (the
-- client filters it out) until that moment passes, then it shows up
-- automatically the next time anyone loads/refreshes the marketplace — no
-- server-side cron job needed. Safe to run standalone / re-run (idempotent).
-- ===================================================================

alter table public.products add column if not exists drop_date timestamptz;
