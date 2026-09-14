-- ===================================================================
-- Migration 33: Academy curriculum rebuild — reward catalog, part 2.
--
-- Completes the reward catalog started in migration_32 (Modules 1-2) by
-- covering the remaining 6 modules: 3 "Know Your Money" (7 lessons), 4
-- "Grow Your Brand", 5 "Turn Browsers into Buyers", 6 "Plan Your Growth",
-- 7 "Read Your Numbers", and 8 "Fuel Your Business" (bonus). Same reward
-- sizing convention as migration_32 — see that file's header comment for
-- the full reasoning (flat lesson/quiz/path rewards, checkpoints capped at
-- the same 150 XP / 100 Seeds ceiling as the existing practice
-- simulations). The final Business Challenge capstone will arrive in its
-- own later migration with a distinctly higher ceiling.
--
-- Safe to run standalone / re-run (idempotent) — same as migration_32.
-- ===================================================================

insert into public.academy_activity_catalog (activity_type, ref_id, xp, seeds, is_capped) values
  -- Module 3 lessons (7 — the longest module)
  ('lesson_complete', 'lesson-3-1', 50, 25, false),
  ('lesson_complete', 'lesson-3-2', 50, 25, false),
  ('lesson_complete', 'lesson-3-3', 50, 25, false),
  ('lesson_complete', 'lesson-3-4', 50, 25, false),
  ('lesson_complete', 'lesson-3-5', 50, 25, false),
  ('lesson_complete', 'lesson-3-6', 50, 25, false),
  ('lesson_complete', 'lesson-3-7', 50, 25, false),
  ('quiz_pass', 'lesson-3-1', 30, 20, false),
  ('quiz_pass', 'lesson-3-2', 30, 20, false),
  ('quiz_pass', 'lesson-3-3', 30, 20, false),
  ('quiz_pass', 'lesson-3-4', 30, 20, false),
  ('quiz_pass', 'lesson-3-5', 30, 20, false),
  ('quiz_pass', 'lesson-3-6', 30, 20, false),
  ('quiz_pass', 'lesson-3-7', 30, 20, false),
  ('quiz_perfect', 'lesson-3-1', 20, 15, false),
  ('quiz_perfect', 'lesson-3-2', 20, 15, false),
  ('quiz_perfect', 'lesson-3-3', 20, 15, false),
  ('quiz_perfect', 'lesson-3-4', 20, 15, false),
  ('quiz_perfect', 'lesson-3-5', 20, 15, false),
  ('quiz_perfect', 'lesson-3-6', 20, 15, false),
  ('quiz_perfect', 'lesson-3-7', 20, 15, false),
  ('path_complete', 'module-3', 100, 50, false),
  ('simulation_complete', 'checkpoint-3', 150, 100, true),
  ('challenge_complete', 'checkpoint-3', 0, 0, false),

  -- Module 4 lessons
  ('lesson_complete', 'lesson-4-1', 50, 25, false),
  ('lesson_complete', 'lesson-4-2', 50, 25, false),
  ('lesson_complete', 'lesson-4-3', 50, 25, false),
  ('lesson_complete', 'lesson-4-4', 50, 25, false),
  ('lesson_complete', 'lesson-4-5', 50, 25, false),
  ('quiz_pass', 'lesson-4-1', 30, 20, false),
  ('quiz_pass', 'lesson-4-2', 30, 20, false),
  ('quiz_pass', 'lesson-4-3', 30, 20, false),
  ('quiz_pass', 'lesson-4-4', 30, 20, false),
  ('quiz_pass', 'lesson-4-5', 30, 20, false),
  ('quiz_perfect', 'lesson-4-1', 20, 15, false),
  ('quiz_perfect', 'lesson-4-2', 20, 15, false),
  ('quiz_perfect', 'lesson-4-3', 20, 15, false),
  ('quiz_perfect', 'lesson-4-4', 20, 15, false),
  ('quiz_perfect', 'lesson-4-5', 20, 15, false),
  ('path_complete', 'module-4', 100, 50, false),
  ('simulation_complete', 'checkpoint-4', 150, 100, true),
  ('challenge_complete', 'checkpoint-4', 0, 0, false),

  -- Module 5 lessons
  ('lesson_complete', 'lesson-5-1', 50, 25, false),
  ('lesson_complete', 'lesson-5-2', 50, 25, false),
  ('lesson_complete', 'lesson-5-3', 50, 25, false),
  ('lesson_complete', 'lesson-5-4', 50, 25, false),
  ('lesson_complete', 'lesson-5-5', 50, 25, false),
  ('quiz_pass', 'lesson-5-1', 30, 20, false),
  ('quiz_pass', 'lesson-5-2', 30, 20, false),
  ('quiz_pass', 'lesson-5-3', 30, 20, false),
  ('quiz_pass', 'lesson-5-4', 30, 20, false),
  ('quiz_pass', 'lesson-5-5', 30, 20, false),
  ('quiz_perfect', 'lesson-5-1', 20, 15, false),
  ('quiz_perfect', 'lesson-5-2', 20, 15, false),
  ('quiz_perfect', 'lesson-5-3', 20, 15, false),
  ('quiz_perfect', 'lesson-5-4', 20, 15, false),
  ('quiz_perfect', 'lesson-5-5', 20, 15, false),
  ('path_complete', 'module-5', 100, 50, false),
  ('simulation_complete', 'checkpoint-5', 150, 100, true),
  ('challenge_complete', 'checkpoint-5', 0, 0, false),

  -- Module 6 lessons
  ('lesson_complete', 'lesson-6-1', 50, 25, false),
  ('lesson_complete', 'lesson-6-2', 50, 25, false),
  ('lesson_complete', 'lesson-6-3', 50, 25, false),
  ('lesson_complete', 'lesson-6-4', 50, 25, false),
  ('lesson_complete', 'lesson-6-5', 50, 25, false),
  ('quiz_pass', 'lesson-6-1', 30, 20, false),
  ('quiz_pass', 'lesson-6-2', 30, 20, false),
  ('quiz_pass', 'lesson-6-3', 30, 20, false),
  ('quiz_pass', 'lesson-6-4', 30, 20, false),
  ('quiz_pass', 'lesson-6-5', 30, 20, false),
  ('quiz_perfect', 'lesson-6-1', 20, 15, false),
  ('quiz_perfect', 'lesson-6-2', 20, 15, false),
  ('quiz_perfect', 'lesson-6-3', 20, 15, false),
  ('quiz_perfect', 'lesson-6-4', 20, 15, false),
  ('quiz_perfect', 'lesson-6-5', 20, 15, false),
  ('path_complete', 'module-6', 100, 50, false),
  ('simulation_complete', 'checkpoint-6', 150, 100, true),
  ('challenge_complete', 'checkpoint-6', 0, 0, false),

  -- Module 7 lessons
  ('lesson_complete', 'lesson-7-1', 50, 25, false),
  ('lesson_complete', 'lesson-7-2', 50, 25, false),
  ('lesson_complete', 'lesson-7-3', 50, 25, false),
  ('lesson_complete', 'lesson-7-4', 50, 25, false),
  ('lesson_complete', 'lesson-7-5', 50, 25, false),
  ('quiz_pass', 'lesson-7-1', 30, 20, false),
  ('quiz_pass', 'lesson-7-2', 30, 20, false),
  ('quiz_pass', 'lesson-7-3', 30, 20, false),
  ('quiz_pass', 'lesson-7-4', 30, 20, false),
  ('quiz_pass', 'lesson-7-5', 30, 20, false),
  ('quiz_perfect', 'lesson-7-1', 20, 15, false),
  ('quiz_perfect', 'lesson-7-2', 20, 15, false),
  ('quiz_perfect', 'lesson-7-3', 20, 15, false),
  ('quiz_perfect', 'lesson-7-4', 20, 15, false),
  ('quiz_perfect', 'lesson-7-5', 20, 15, false),
  ('path_complete', 'module-7', 100, 50, false),
  ('simulation_complete', 'checkpoint-7', 150, 100, true),
  ('challenge_complete', 'checkpoint-7', 0, 0, false),

  -- Module 8 lessons (bonus)
  ('lesson_complete', 'lesson-8-1', 50, 25, false),
  ('lesson_complete', 'lesson-8-2', 50, 25, false),
  ('lesson_complete', 'lesson-8-3', 50, 25, false),
  ('lesson_complete', 'lesson-8-4', 50, 25, false),
  ('lesson_complete', 'lesson-8-5', 50, 25, false),
  ('quiz_pass', 'lesson-8-1', 30, 20, false),
  ('quiz_pass', 'lesson-8-2', 30, 20, false),
  ('quiz_pass', 'lesson-8-3', 30, 20, false),
  ('quiz_pass', 'lesson-8-4', 30, 20, false),
  ('quiz_pass', 'lesson-8-5', 30, 20, false),
  ('quiz_perfect', 'lesson-8-1', 20, 15, false),
  ('quiz_perfect', 'lesson-8-2', 20, 15, false),
  ('quiz_perfect', 'lesson-8-3', 20, 15, false),
  ('quiz_perfect', 'lesson-8-4', 20, 15, false),
  ('quiz_perfect', 'lesson-8-5', 20, 15, false),
  ('path_complete', 'module-8', 100, 50, false),
  ('simulation_complete', 'checkpoint-8', 150, 100, true),
  ('challenge_complete', 'checkpoint-8', 0, 0, false)
on conflict (activity_type, ref_id) do nothing;
