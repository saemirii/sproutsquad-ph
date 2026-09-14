-- ===================================================================
-- Migration 34: Academy curriculum rebuild — the final Business Challenge.
--
-- The capstone (21 sequential decisions spanning all 8 modules) is scored
-- dynamically like every other case-study checkpoint, so it's capped
-- rather than fixed — but at a distinctly higher ceiling (450 XP / 300
-- Seeds) than a normal module checkpoint's 150/100, since this is
-- deliberately the single largest reward in the app. See
-- src/data/academy/finalChallenge.ts for the scoring logic that produces
-- these numbers client-side; this just bounds what the server will honor.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

insert into public.academy_activity_catalog (activity_type, ref_id, xp, seeds, is_capped) values
  ('simulation_complete', 'final-business-challenge', 450, 300, true),
  ('challenge_complete', 'final-business-challenge', 0, 0, false)
on conflict (activity_type, ref_id) do nothing;
