-- ===================================================================
-- Migration 32: Academy curriculum rebuild — reward catalog, part 1.
--
-- The Academy is being rebuilt from 4 flat lessons into 8 real modules
-- (42 lessons + 8 module checkpoints + a final Business Challenge). Every
-- new lesson/checkpoint needs a matching row here or award_learning_
-- activity() (migration_15) rejects it outright — that's by design (see
-- migration_15's own comment), not a bug to work around.
--
-- This migration covers Module 1 ("Find Your Roots") and Module 2 ("Build
-- Your Shop") — the two modules authored so far. Modules 3-8 and the final
-- Business Challenge will each arrive in their own follow-up migration as
-- they're authored, appending to this same catalog (all inserts here are
-- `on conflict do nothing`, so re-running this file is always safe).
--
-- Reward sizing: lesson/quiz/path rewards stay flat across every module
-- (50/25 per lesson, 30/20 quiz pass, 20/15 quiz perfect first-try, 100/50
-- per completed module) — matching the flat convention the original 4
-- lessons already used. Module checkpoints are capped (real score varies,
-- like the existing practice simulations) at the same 150 XP / 100 Seeds
-- ceiling as those — so every checkpoint's maximum payout matches an
-- exceptional practice-simulation run. The once-per-account final Business
-- Challenge (added in its own later migration) will get a distinctly
-- higher ceiling, since it's meant to be the single largest reward in the
-- app.
-- ===================================================================

insert into public.academy_activity_catalog (activity_type, ref_id, xp, seeds, is_capped) values
  -- Module 1 lessons
  ('lesson_complete', 'lesson-1-1', 50, 25, false),
  ('lesson_complete', 'lesson-1-2', 50, 25, false),
  ('lesson_complete', 'lesson-1-3', 50, 25, false),
  ('lesson_complete', 'lesson-1-4', 50, 25, false),
  ('lesson_complete', 'lesson-1-5', 50, 25, false),
  ('quiz_pass', 'lesson-1-1', 30, 20, false),
  ('quiz_pass', 'lesson-1-2', 30, 20, false),
  ('quiz_pass', 'lesson-1-3', 30, 20, false),
  ('quiz_pass', 'lesson-1-4', 30, 20, false),
  ('quiz_pass', 'lesson-1-5', 30, 20, false),
  ('quiz_perfect', 'lesson-1-1', 20, 15, false),
  ('quiz_perfect', 'lesson-1-2', 20, 15, false),
  ('quiz_perfect', 'lesson-1-3', 20, 15, false),
  ('quiz_perfect', 'lesson-1-4', 20, 15, false),
  ('quiz_perfect', 'lesson-1-5', 20, 15, false),
  ('path_complete', 'module-1', 100, 50, false),
  ('simulation_complete', 'checkpoint-1', 150, 100, true),
  ('challenge_complete', 'checkpoint-1', 0, 0, false),

  -- Module 2 lessons
  ('lesson_complete', 'lesson-2-1', 50, 25, false),
  ('lesson_complete', 'lesson-2-2', 50, 25, false),
  ('lesson_complete', 'lesson-2-3', 50, 25, false),
  ('lesson_complete', 'lesson-2-4', 50, 25, false),
  ('lesson_complete', 'lesson-2-5', 50, 25, false),
  ('quiz_pass', 'lesson-2-1', 30, 20, false),
  ('quiz_pass', 'lesson-2-2', 30, 20, false),
  ('quiz_pass', 'lesson-2-3', 30, 20, false),
  ('quiz_pass', 'lesson-2-4', 30, 20, false),
  ('quiz_pass', 'lesson-2-5', 30, 20, false),
  ('quiz_perfect', 'lesson-2-1', 20, 15, false),
  ('quiz_perfect', 'lesson-2-2', 20, 15, false),
  ('quiz_perfect', 'lesson-2-3', 20, 15, false),
  ('quiz_perfect', 'lesson-2-4', 20, 15, false),
  ('quiz_perfect', 'lesson-2-5', 20, 15, false),
  ('path_complete', 'module-2', 100, 50, false),
  ('simulation_complete', 'checkpoint-2', 150, 100, true),
  ('challenge_complete', 'checkpoint-2', 0, 0, false)
on conflict (activity_type, ref_id) do nothing;
