-- ===================================================================
-- Migration 15: Academy reward integrity (security audit fix #5).
--
-- award_learning_activity (migration_10) trusted the client-supplied
-- xp/seeds amounts outright, and never checked that ref_id corresponded
-- to a real lesson/quiz/simulation/path. The unique ledger constraint on
-- (user_id, activity_type, ref_id) stops REPLAYING the same claim, but
-- nothing stopped minting unlimited XP/Seeds by calling the RPC with a
-- huge amount for a real ref_id, or with an entirely made-up ref_id
-- ("fake-lesson-1", "fake-lesson-2", ...) repeated indefinitely.
--
-- academy_activity_catalog is the server-side source of truth this was
-- missing — every (activity_type, ref_id) this app actually grants XP/
-- Seeds for. Lessons/quizzes/paths have one fixed correct reward, so
-- those are enforced exactly (the client's reported amount is ignored
-- entirely). Business simulations score dynamically from a student's own
-- decisions — the server has no way to re-run that scoring without
-- duplicating the whole engine in SQL — so those are clamped to a known
-- maximum instead: a student can never claim more than the best possible
-- outcome for a real scenario, even if they fabricate the request.
--
-- Any (activity_type, ref_id) not in this catalog is rejected outright.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

create table if not exists public.academy_activity_catalog (
  activity_type text not null,
  ref_id text not null,
  xp integer not null default 0,
  seeds integer not null default 0,
  -- false (lessons/quizzes/paths/challenge-tag): the catalog value is
  -- enforced exactly, the client's reported amount is ignored.
  -- true (simulations): the client's reported amount is honored up to
  -- this value, since real performance legitimately varies below it.
  is_capped boolean not null default false,
  primary key (activity_type, ref_id)
);

alter table public.academy_activity_catalog enable row level security;

drop policy if exists "Anyone can view the academy activity catalog" on public.academy_activity_catalog;
create policy "Anyone can view the academy activity catalog"
  on public.academy_activity_catalog for select using (true);

-- No client insert/update/delete — this is server-authored reward truth,
-- mirroring src/data/seedData.ts (lessons), simulationScenarios.ts, and
-- the LESSON_XP/QUIZ_PASS_XP/etc. constants in AppContext.tsx. Keep all
-- of these in sync if lesson/scenario content ever changes.
insert into public.academy_activity_catalog (activity_type, ref_id, xp, seeds, is_capped) values
  ('lesson_complete', 'lesson-1', 50, 25, false),
  ('lesson_complete', 'lesson-2', 50, 25, false),
  ('lesson_complete', 'lesson-3', 50, 25, false),
  ('lesson_complete', 'lesson-4', 50, 25, false),
  ('quiz_pass', 'lesson-1', 30, 20, false),
  ('quiz_pass', 'lesson-2', 30, 20, false),
  ('quiz_pass', 'lesson-3', 30, 20, false),
  ('quiz_pass', 'lesson-4', 30, 20, false),
  ('quiz_perfect', 'lesson-1', 20, 15, false),
  ('quiz_perfect', 'lesson-2', 20, 15, false),
  ('quiz_perfect', 'lesson-3', 20, 15, false),
  ('quiz_perfect', 'lesson-4', 20, 15, false),
  -- One path per lesson category — each category currently has exactly
  -- one lesson, so "completing the path" and "completing that lesson"
  -- are the same event (see AppContext.tsx's completeLessonWithQuiz).
  ('path_complete', 'Pricing & Profit', 100, 50, false),
  ('path_complete', 'Sourcing & COGS', 100, 50, false),
  ('path_complete', 'Campus Marketing', 100, 50, false),
  ('path_complete', 'Cashflow & Allowances', 100, 50, false),
  -- Simulations: clamped to the best possible tier (healthScore >= 80)
  -- from src/data/simulationScenarios.ts' computeSimulationResult.
  ('simulation_complete', 'sim-cookie-shop', 150, 100, true),
  ('simulation_complete', 'sim-handmade-bracelets', 150, 100, true),
  ('simulation_complete', 'sim-campus-online-shop', 150, 100, true),
  -- The "business challenge" tag on the same simulation event always
  -- pays zero — it exists purely so it counts toward challenge_complete
  -- quests/achievements without double-paying (see migration_10).
  ('challenge_complete', 'sim-cookie-shop', 0, 0, false),
  ('challenge_complete', 'sim-handmade-bracelets', 0, 0, false),
  ('challenge_complete', 'sim-campus-online-shop', 0, 0, false)
on conflict (activity_type, ref_id) do nothing;

create or replace function public.award_learning_activity(
  p_activity_type text,
  p_ref_id text,
  p_xp integer,
  p_seeds integer
)
returns table(
  xp_awarded integer,
  seeds_awarded integer,
  new_streak integer,
  leveled_up boolean,
  new_level integer,
  level_seed_bonus integer
)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_activity_id uuid;
  v_last_date date;
  v_streak integer;
  v_longest integer;
  v_today date := current_date;
  v_xp_before integer;
  v_level_before integer;
  v_level_after integer;
  v_seed_bonus integer := 0;
  v_catalog record;
  v_xp_gain integer;
  v_seeds_gain integer;
  lvl integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_catalog from public.academy_activity_catalog
    where activity_type = p_activity_type and ref_id = p_ref_id;

  if not found then
    raise exception 'Unknown learning activity: % / %', p_activity_type, p_ref_id;
  end if;

  if v_catalog.is_capped then
    v_xp_gain := least(greatest(coalesce(p_xp, 0), 0), v_catalog.xp);
    v_seeds_gain := least(greatest(coalesce(p_seeds, 0), 0), v_catalog.seeds);
  else
    v_xp_gain := v_catalog.xp;
    v_seeds_gain := v_catalog.seeds;
  end if;

  insert into public.academy_profiles (user_id) values (v_user_id) on conflict (user_id) do nothing;

  insert into public.learning_activities (user_id, activity_type, ref_id, xp_earned, seeds_earned)
  values (v_user_id, p_activity_type, p_ref_id, v_xp_gain, v_seeds_gain)
  on conflict (user_id, activity_type, ref_id) do nothing
  returning id into v_activity_id;

  select xp, streak_count into v_xp_before, v_streak from public.academy_profiles where user_id = v_user_id;

  if v_activity_id is null then
    -- Already claimed before — report a no-op, don't pay out again.
    return query select 0, 0, coalesce(v_streak, 0), false, public.academy_level_number(coalesce(v_xp_before, 0)), 0;
    return;
  end if;

  select last_activity_date, longest_streak into v_last_date, v_longest from public.academy_profiles where user_id = v_user_id;

  if v_last_date is null or v_last_date < v_today - 1 then
    v_streak := 1;
  elsif v_last_date = v_today - 1 then
    v_streak := v_streak + 1;
  end if; -- v_last_date = v_today: same-day activity, streak unchanged

  v_longest := greatest(v_longest, v_streak);

  v_level_before := public.academy_level_number(v_xp_before);
  v_level_after := public.academy_level_number(v_xp_before + v_xp_gain);

  if v_level_after > v_level_before then
    for lvl in (v_level_before + 1)..v_level_after loop
      v_seed_bonus := v_seed_bonus + public.academy_level_seed_reward(lvl);
    end loop;
  end if;

  update public.academy_profiles
  set xp = xp + v_xp_gain,
      seeds = seeds + v_seeds_gain + v_seed_bonus,
      streak_count = v_streak,
      longest_streak = v_longest,
      last_activity_date = v_today,
      updated_at = now()
  where user_id = v_user_id;

  perform public.bump_quest_progress(v_user_id, p_activity_type);
  perform public.bump_quest_progress(v_user_id, 'streak_maintain');
  perform public.check_and_unlock_achievements(v_user_id);

  return query select v_xp_gain, (v_seeds_gain + v_seed_bonus), v_streak, (v_level_after > v_level_before), v_level_after, v_seed_bonus;
end;
$$;
