-- ===================================================================
-- Migration 35: Two new capstone achievements for the rebuilt 8-module
-- Academy curriculum — both use existing, already-generic requirement
-- types (path_completed, challenges_completed), so no new plumbing is
-- needed beyond the catalog row itself.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

insert into public.academy_achievements (id, name, description, icon, category, requirement_type, requirement_value, reward_xp, reward_seeds, sort_order) values
  ('academy-graduate', 'Academy Graduate', 'Complete all 8 Academy modules.', 'level-rooted-founder', 'growth', 'path_completed', 8, 200, 150, 10),
  ('master-entrepreneur', 'Master Entrepreneur', 'Complete every module checkpoint and the final Business Challenge.', 'medal-2nd', 'business', 'challenges_completed', 9, 300, 200, 11)
on conflict (id) do nothing;
