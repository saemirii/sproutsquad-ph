-- ===================================================================
-- Migration 10: Sprout Academy Gamification System.
--
-- Adds XP/Seeds progression, a reward ledger with an anti-double-claim
-- constraint, achievements, garden items + purchases, daily/weekly
-- quests, and squad (business-team) challenges.
--
-- Anti-cheat design: every reward-granting mutation goes through a
-- security-definer RPC that inserts into learning_activities FIRST — a
-- unique constraint on (user_id, activity_type, ref_id) makes a repeat
-- claim a silent no-op (zero XP/Seeds returned), the same idempotency-
-- ledger pattern already used for the RevenueCat webhook (migration_5).
-- Clients never write xp/seeds/streak_count directly; academy_profiles
-- has no client-facing insert/update policy at all.
--
-- Level/title are derived from xp client-side (src/data/academyLevels.ts)
-- and mirrored here only as academy_level_number()/academy_level_seed_reward()
-- so the level-up seed bonus can be computed server-side too. xp itself
-- is the only stored progression number — level is never stored.
--
-- "Business challenge" and "business simulation" are the same student
-- action (completing a BusinessSimulation scenario) tagged with two
-- ledger activity_types (simulation_complete + challenge_complete) so it
-- satisfies both the Fruitful Founder achievement/Business Builder
-- leaderboard AND the "complete a business challenge" quests/First Bloom
-- achievement, without needing two separate mini-features. Only the
-- simulation_complete entry carries the actual XP/Seeds payout — the
-- challenge_complete entry is reward_xp/reward_seeds = 0, it exists
-- purely for quest/achievement counting.
--
-- Squads are existing business teams (business_members) — no new
-- "squad" concept is introduced.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

-- ---------------------------------------------------------------
-- Core profile: XP, Seeds, streak.
-- ---------------------------------------------------------------
create table if not exists public.academy_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  seeds integer not null default 0,
  streak_count integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  leaderboard_opt_in boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.academy_profiles enable row level security;

drop policy if exists "Users can view their own academy profile" on public.academy_profiles;
create policy "Users can view their own academy profile"
  on public.academy_profiles for select using (auth.uid() = user_id);

-- Deliberately no insert/update policy for authenticated users — rows are
-- created lazily and mutated exclusively by the RPCs below (all
-- security definer), so a client can never write xp/seeds/streak_count
-- directly. Leaderboard opt-in is toggled via set_leaderboard_opt_in().

-- ---------------------------------------------------------------
-- Reward ledger — the anti-cheat mechanism. unique(user_id, activity_type,
-- ref_id) means a repeat award_learning_activity() call for the same
-- completion is a no-op insert, so the caller can safely retry/replay
-- without ever being paid twice.
-- ---------------------------------------------------------------
create table if not exists public.learning_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null, -- lesson_complete | quiz_pass | quiz_perfect | simulation_complete | challenge_complete | path_complete
  ref_id text not null,
  xp_earned integer not null default 0,
  seeds_earned integer not null default 0,
  completed_at timestamptz not null default now(),
  unique (user_id, activity_type, ref_id)
);

alter table public.learning_activities enable row level security;

drop policy if exists "Users can view their own learning activities" on public.learning_activities;
create policy "Users can view their own learning activities"
  on public.learning_activities for select using (auth.uid() = user_id);

-- No client insert/update/delete policy — only award_learning_activity()
-- (security definer) writes here.

-- ---------------------------------------------------------------
-- Achievements catalog + unlocks.
-- ---------------------------------------------------------------
create table if not exists public.academy_achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null default '🌱',
  category text not null default 'growth',
  requirement_type text not null, -- lessons_completed | streak_days | quizzes_passed | perfect_quizzes | challenges_completed | simulations_completed | path_completed
  requirement_value integer not null default 1,
  reward_xp integer not null default 0,
  reward_seeds integer not null default 0,
  sort_order integer not null default 0
);

alter table public.academy_achievements enable row level security;

drop policy if exists "Anyone can view the achievement catalog" on public.academy_achievements;
create policy "Anyone can view the achievement catalog"
  on public.academy_achievements for select using (true);

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.academy_achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

drop policy if exists "Users can view their own achievements" on public.user_achievements;
create policy "Users can view their own achievements"
  on public.user_achievements for select using (auth.uid() = user_id);

-- RPC-only insert (check_and_unlock_achievements).

-- ---------------------------------------------------------------
-- Garden shop catalog + ownership.
-- ---------------------------------------------------------------
create table if not exists public.garden_items (
  id text primary key,
  name text not null,
  category text not null, -- plants | decorations | structures | profile | seasonal
  emoji text not null default '🌱',
  price_seeds integer not null default 0,
  rarity text not null default 'common', -- common | rare | epic
  seasonal_tag text,
  available_from date,
  available_until date,
  sort_order integer not null default 0
);

alter table public.garden_items enable row level security;

drop policy if exists "Anyone can view the garden shop catalog" on public.garden_items;
create policy "Anyone can view the garden shop catalog"
  on public.garden_items for select using (true);

create table if not exists public.user_garden_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.garden_items(id) on delete cascade,
  equipped boolean not null default false,
  purchased_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.user_garden_items enable row level security;

drop policy if exists "Users can view their own garden items" on public.user_garden_items;
create policy "Users can view their own garden items"
  on public.user_garden_items for select using (auth.uid() = user_id);

-- Purchases go through purchase_garden_item() (checks + deducts Seeds
-- atomically) and equip toggles through equip_garden_item() — kept
-- RPC-only so every gamification-table write follows the same rule.

-- ---------------------------------------------------------------
-- Quest catalog + per-period progress.
-- ---------------------------------------------------------------
create table if not exists public.academy_quests (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null default '🎯',
  quest_type text not null default 'daily', -- daily | weekly
  activity_type text not null, -- matches learning_activities.activity_type, or 'streak_maintain'
  requirement_value integer not null default 1,
  reward_xp integer not null default 0,
  reward_seeds integer not null default 0,
  active boolean not null default true,
  sort_order integer not null default 0
);

alter table public.academy_quests enable row level security;

drop policy if exists "Anyone can view the quest catalog" on public.academy_quests;
create policy "Anyone can view the quest catalog"
  on public.academy_quests for select using (true);

create table if not exists public.user_quest_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id text not null references public.academy_quests(id) on delete cascade,
  period_key text not null, -- 'YYYY-MM-DD' for daily quests, ISO 'YYYY-Www' for weekly
  progress integer not null default 0,
  completed boolean not null default false,
  claimed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, quest_id, period_key)
);

alter table public.user_quest_progress enable row level security;

drop policy if exists "Users can view their own quest progress" on public.user_quest_progress;
create policy "Users can view their own quest progress"
  on public.user_quest_progress for select using (auth.uid() = user_id);

-- RPC-only write — progress is bumped inside award_learning_activity()
-- and paid out by claim_quest_reward(). Quests "refresh" for free: a new
-- period_key simply has no row yet, no cron job needed.

-- ---------------------------------------------------------------
-- Squad challenges — scoped to an existing business's team
-- (business_members), not a new "squad" concept.
-- ---------------------------------------------------------------
create table if not exists public.squad_challenges (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  name text not null,
  description text not null default '',
  icon text not null default '🌱',
  goal_lessons integer not null default 0,
  goal_quizzes integer not null default 0,
  goal_challenges integer not null default 0,
  reward_xp integer not null default 0,
  reward_seeds integer not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.squad_challenges enable row level security;

drop policy if exists "Squad members can view their challenges" on public.squad_challenges;
create policy "Squad members can view their challenges"
  on public.squad_challenges for select using (
    exists (
      select 1 from public.businesses
      where businesses.id = squad_challenges.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
  );

-- RPC-only insert (get_or_create_active_squad_challenge).

create table if not exists public.squad_challenge_rewards (
  challenge_id uuid not null references public.squad_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rewarded_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

alter table public.squad_challenge_rewards enable row level security;

drop policy if exists "Users can view their own squad challenge rewards" on public.squad_challenge_rewards;
create policy "Users can view their own squad challenge rewards"
  on public.squad_challenge_rewards for select using (auth.uid() = user_id);

-- ===================================================================
-- Helper functions
-- ===================================================================

-- Mirrors src/data/academyLevels.ts — keep the two in sync if levels change.
create or replace function public.academy_level_number(p_xp integer)
returns integer
language sql
immutable
as $$
  select case
    when p_xp >= 15000 then 10
    when p_xp >= 11000 then 9
    when p_xp >= 8000 then 8
    when p_xp >= 5600 then 7
    when p_xp >= 3800 then 6
    when p_xp >= 2450 then 5
    when p_xp >= 1500 then 4
    when p_xp >= 800 then 3
    when p_xp >= 300 then 2
    else 1
  end;
$$;

create or replace function public.academy_level_seed_reward(p_level integer)
returns integer
language sql
immutable
as $$
  select case when p_level <= 1 then 0 else 50 + (p_level - 1) * 25 end;
$$;

create or replace function public.academy_period_key(p_quest_type text, p_at timestamptz default now())
returns text
language sql
stable
as $$
  select case
    when p_quest_type = 'weekly' then to_char(p_at, 'IYYY-"W"IW')
    else to_char(p_at, 'YYYY-MM-DD')
  end;
$$;

-- Bumps progress (capped/stopped once completed) for every active quest
-- whose activity_type matches this event, in both its daily and weekly
-- incarnations (period_key is derived per-quest from its own quest_type).
create or replace function public.bump_quest_progress(p_user_id uuid, p_activity_type text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  q record;
  pk text;
begin
  for q in select * from public.academy_quests where active = true and activity_type = p_activity_type loop
    pk := public.academy_period_key(q.quest_type);

    insert into public.user_quest_progress (user_id, quest_id, period_key, progress, completed, completed_at)
    values (p_user_id, q.id, pk, 1, (1 >= q.requirement_value), case when 1 >= q.requirement_value then now() else null end)
    on conflict (user_id, quest_id, period_key) do update
      set progress = public.user_quest_progress.progress + 1,
          completed = (public.user_quest_progress.progress + 1) >= q.requirement_value,
          completed_at = case
            when (public.user_quest_progress.progress + 1) >= q.requirement_value then now()
            else public.user_quest_progress.completed_at
          end
      where public.user_quest_progress.completed = false;
  end loop;
end;
$$;

create or replace function public.check_and_unlock_achievements(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  a record;
  v_count integer;
  v_streak integer;
  v_longest integer;
begin
  select streak_count, longest_streak into v_streak, v_longest
    from public.academy_profiles where user_id = p_user_id;

  for a in select * from public.academy_achievements loop
    if exists (select 1 from public.user_achievements where user_id = p_user_id and achievement_id = a.id) then
      continue;
    end if;

    v_count := 0;

    if a.requirement_type = 'lessons_completed' then
      select count(*) into v_count from public.learning_activities where user_id = p_user_id and activity_type = 'lesson_complete';
    elsif a.requirement_type = 'quizzes_passed' then
      select count(*) into v_count from public.learning_activities where user_id = p_user_id and activity_type in ('quiz_pass', 'quiz_perfect');
    elsif a.requirement_type = 'perfect_quizzes' then
      select count(*) into v_count from public.learning_activities where user_id = p_user_id and activity_type = 'quiz_perfect';
    elsif a.requirement_type = 'simulations_completed' then
      select count(*) into v_count from public.learning_activities where user_id = p_user_id and activity_type = 'simulation_complete';
    elsif a.requirement_type = 'path_completed' then
      select count(*) into v_count from public.learning_activities where user_id = p_user_id and activity_type = 'path_complete';
    elsif a.requirement_type = 'challenges_completed' then
      select count(*) into v_count from public.learning_activities where user_id = p_user_id and activity_type = 'challenge_complete';
    elsif a.requirement_type = 'streak_days' then
      v_count := greatest(coalesce(v_streak, 0), coalesce(v_longest, 0));
    end if;

    if v_count >= a.requirement_value then
      insert into public.user_achievements (user_id, achievement_id) values (p_user_id, a.id) on conflict do nothing;

      update public.academy_profiles
      set xp = xp + a.reward_xp, seeds = seeds + a.reward_seeds, updated_at = now()
      where user_id = p_user_id;
    end if;
  end loop;
end;
$$;

-- ===================================================================
-- Client-facing RPCs
-- ===================================================================

-- The single core reward primitive. Called for lesson completion, quiz
-- pass/perfect, simulation + business-challenge completion, and learning
-- path completion. Returns the ACTUAL granted deltas (zero on a repeat
-- claim) so the client shows correct reward feedback either way.
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
  v_xp_gain integer := greatest(coalesce(p_xp, 0), 0);
  v_seeds_gain integer := greatest(coalesce(p_seeds, 0), 0);
  lvl integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
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

create or replace function public.purchase_garden_item(p_item_id text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_price integer;
  v_seeds integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select price_seeds into v_price from public.garden_items where id = p_item_id;
  if v_price is null then
    raise exception 'Unknown garden item';
  end if;

  if exists (select 1 from public.user_garden_items where user_id = v_user_id and item_id = p_item_id) then
    raise exception 'Item already owned';
  end if;

  insert into public.academy_profiles (user_id) values (v_user_id) on conflict (user_id) do nothing;

  select seeds into v_seeds from public.academy_profiles where user_id = v_user_id;
  if coalesce(v_seeds, 0) < v_price then
    raise exception 'Not enough Seeds';
  end if;

  update public.academy_profiles set seeds = seeds - v_price, updated_at = now() where user_id = v_user_id;

  insert into public.user_garden_items (user_id, item_id, equipped) values (v_user_id, p_item_id, false) on conflict do nothing;
end;
$$;

create or replace function public.equip_garden_item(p_item_id text, p_equip boolean)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update public.user_garden_items set equipped = p_equip where user_id = v_user_id and item_id = p_item_id;
end;
$$;

create or replace function public.claim_quest_reward(p_quest_id text, p_period_key text)
returns table(xp_awarded integer, seeds_awarded integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_reward_xp integer;
  v_reward_seeds integer;
  v_updated integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select q.reward_xp, q.reward_seeds into v_reward_xp, v_reward_seeds
    from public.user_quest_progress uqp
    join public.academy_quests q on q.id = uqp.quest_id
    where uqp.user_id = v_user_id and uqp.quest_id = p_quest_id and uqp.period_key = p_period_key
      and uqp.completed = true and uqp.claimed = false;

  if v_reward_xp is null then
    return query select 0, 0;
    return;
  end if;

  update public.user_quest_progress set claimed = true
    where user_id = v_user_id and quest_id = p_quest_id and period_key = p_period_key and claimed = false;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return query select 0, 0;
    return;
  end if;

  insert into public.academy_profiles (user_id) values (v_user_id) on conflict (user_id) do nothing;

  update public.academy_profiles
  set xp = xp + v_reward_xp, seeds = seeds + v_reward_seeds, updated_at = now()
  where user_id = v_user_id;

  return query select v_reward_xp, v_reward_seeds;
end;
$$;

create or replace function public.get_or_create_active_squad_challenge(p_business_id text)
returns public.squad_challenges
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.squad_challenges;
  v_week_start timestamptz;
  v_week_end timestamptz;
  v_idx integer;
  template_names text[] := array['🌱 Marketing Challenge', '💰 Cashflow Challenge', '📦 Sourcing Sprint'];
  template_descs text[] := array[
    'Grow together — complete lessons, quizzes, and a business challenge as a squad.',
    'Sharpen your money skills together this week.',
    'Learn smarter sourcing and pricing as a team.'
  ];
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.businesses
    where id = p_business_id
    and (
      seller_id = v_user_id
      or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = v_user_id)
    )
  ) then
    raise exception 'Not a member of this business';
  end if;

  v_week_start := date_trunc('week', now());
  v_week_end := v_week_start + interval '7 days';

  select * into v_challenge from public.squad_challenges where business_id = p_business_id and starts_at = v_week_start limit 1;
  if found then
    return v_challenge;
  end if;

  v_idx := 1 + (extract(week from now())::integer % array_length(template_names, 1));

  insert into public.squad_challenges (
    business_id, name, description, icon, goal_lessons, goal_quizzes, goal_challenges, reward_xp, reward_seeds, starts_at, ends_at
  ) values (
    p_business_id, template_names[v_idx], template_descs[v_idx], '🌱', 5, 3, 2, 250, 100, v_week_start, v_week_end
  )
  returning * into v_challenge;

  return v_challenge;
end;
$$;

create or replace function public.claim_squad_challenge_reward(p_challenge_id uuid)
returns table(xp_awarded integer, seeds_awarded integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.squad_challenges;
  v_lessons integer;
  v_quizzes integer;
  v_challenges integer;
  v_my_contrib integer;
  v_inserted integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_challenge from public.squad_challenges where id = p_challenge_id;
  if not found then
    raise exception 'Unknown squad challenge';
  end if;

  if not exists (
    select 1 from public.businesses
    where id = v_challenge.business_id
    and (
      seller_id = v_user_id
      or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = v_user_id)
    )
  ) then
    raise exception 'Not a member of this business';
  end if;

  select
    count(*) filter (where la.activity_type = 'lesson_complete'),
    count(*) filter (where la.activity_type in ('quiz_pass', 'quiz_perfect')),
    count(*) filter (where la.activity_type = 'challenge_complete')
    into v_lessons, v_quizzes, v_challenges
    from public.learning_activities la
    where la.completed_at >= v_challenge.starts_at and la.completed_at < v_challenge.ends_at
      and la.user_id in (
        select seller_id from public.businesses where id = v_challenge.business_id
        union
        select user_id from public.business_members where business_id = v_challenge.business_id
      );

  if v_lessons < v_challenge.goal_lessons or v_quizzes < v_challenge.goal_quizzes or v_challenges < v_challenge.goal_challenges then
    raise exception 'Squad challenge is not complete yet';
  end if;

  select count(*) into v_my_contrib
    from public.learning_activities la
    where la.user_id = v_user_id
      and la.completed_at >= v_challenge.starts_at and la.completed_at < v_challenge.ends_at
      and la.activity_type in ('lesson_complete', 'quiz_pass', 'quiz_perfect', 'challenge_complete');

  if v_my_contrib < 1 then
    raise exception 'Only participating members can claim this reward';
  end if;

  insert into public.squad_challenge_rewards (challenge_id, user_id) values (p_challenge_id, v_user_id) on conflict do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return query select 0, 0;
    return;
  end if;

  insert into public.academy_profiles (user_id) values (v_user_id) on conflict (user_id) do nothing;

  update public.academy_profiles
  set xp = xp + v_challenge.reward_xp, seeds = seeds + v_challenge.reward_seeds, updated_at = now()
  where user_id = v_user_id;

  return query select v_challenge.reward_xp, v_challenge.reward_seeds;
end;
$$;

-- Read-only counterpart to claim_squad_challenge_reward(): lets a member see
-- live squad progress *before* the goal is met. Security definer because
-- learning_activities' RLS only lets a user see their own rows — a client
-- has no other way to see teammates' aggregate contribution.
create or replace function public.get_squad_challenge_progress(p_challenge_id uuid)
returns table(lessons integer, quizzes integer, challenges integer, my_contribution integer, claimed_by_me boolean)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.squad_challenges;
  v_lessons integer;
  v_quizzes integer;
  v_challenges integer;
  v_my_contrib integer;
  v_claimed boolean;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_challenge from public.squad_challenges where id = p_challenge_id;
  if not found then
    raise exception 'Unknown squad challenge';
  end if;

  if not exists (
    select 1 from public.businesses
    where id = v_challenge.business_id
    and (
      seller_id = v_user_id
      or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = v_user_id)
    )
  ) then
    raise exception 'Not a member of this business';
  end if;

  select
    count(*) filter (where la.activity_type = 'lesson_complete'),
    count(*) filter (where la.activity_type in ('quiz_pass', 'quiz_perfect')),
    count(*) filter (where la.activity_type = 'challenge_complete')
    into v_lessons, v_quizzes, v_challenges
    from public.learning_activities la
    where la.completed_at >= v_challenge.starts_at and la.completed_at < v_challenge.ends_at
      and la.user_id in (
        select seller_id from public.businesses where id = v_challenge.business_id
        union
        select user_id from public.business_members where business_id = v_challenge.business_id
      );

  select count(*) into v_my_contrib
    from public.learning_activities la
    where la.user_id = v_user_id
      and la.completed_at >= v_challenge.starts_at and la.completed_at < v_challenge.ends_at
      and la.activity_type in ('lesson_complete', 'quiz_pass', 'quiz_perfect', 'challenge_complete');

  select exists(select 1 from public.squad_challenge_rewards where challenge_id = p_challenge_id and user_id = v_user_id) into v_claimed;

  return query select v_lessons, v_quizzes, v_challenges, v_my_contrib, v_claimed;
end;
$$;

create or replace function public.set_leaderboard_opt_in(p_opt_in boolean)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.academy_profiles (user_id, leaderboard_opt_in) values (v_user_id, p_opt_in)
  on conflict (user_id) do update set leaderboard_opt_in = p_opt_in, updated_at = now();
end;
$$;

-- ===================================================================
-- Leaderboards — plain SQL views (always live, no refresh job needed).
-- A view runs with its owner's table privileges for RLS purposes, which
-- is the standard Supabase pattern for building a public leaderboard on
-- top of otherwise-private per-user tables; explicit grants below make
-- sure both client roles can read them regardless of project defaults.
-- ===================================================================

create or replace view public.lb_most_active as
select la.user_id, p.full_name, p.university, count(*) as lessons_completed
from public.learning_activities la
join public.profiles p on p.id = la.user_id
join public.academy_profiles ap on ap.user_id = la.user_id and ap.leaderboard_opt_in = true
where la.activity_type = 'lesson_complete'
group by la.user_id, p.full_name, p.university
order by lessons_completed desc;

create or replace view public.lb_knowledge_grower as
select la.user_id, p.full_name, p.university,
  count(*) filter (where la.activity_type = 'quiz_perfect') as perfect_quizzes,
  count(*) filter (where la.activity_type in ('quiz_pass', 'quiz_perfect')) as quizzes_passed
from public.learning_activities la
join public.profiles p on p.id = la.user_id
join public.academy_profiles ap on ap.user_id = la.user_id and ap.leaderboard_opt_in = true
where la.activity_type in ('quiz_pass', 'quiz_perfect')
group by la.user_id, p.full_name, p.university
order by perfect_quizzes desc, quizzes_passed desc;

create or replace view public.lb_consistent_grower as
select ap.user_id, p.full_name, p.university, ap.streak_count, ap.longest_streak
from public.academy_profiles ap
join public.profiles p on p.id = ap.user_id
where ap.leaderboard_opt_in = true
order by ap.streak_count desc, ap.longest_streak desc;

create or replace view public.lb_business_builder as
select la.user_id, p.full_name, p.university, count(*) as challenges_completed
from public.learning_activities la
join public.profiles p on p.id = la.user_id
join public.academy_profiles ap on ap.user_id = la.user_id and ap.leaderboard_opt_in = true
where la.activity_type in ('simulation_complete', 'challenge_complete')
group by la.user_id, p.full_name, p.university
order by challenges_completed desc;

create or replace view public.lb_community_grower as
select scr.user_id, p.full_name, p.university, count(*) as squad_contributions
from public.squad_challenge_rewards scr
join public.profiles p on p.id = scr.user_id
join public.academy_profiles ap on ap.user_id = scr.user_id and ap.leaderboard_opt_in = true
group by scr.user_id, p.full_name, p.university
order by squad_contributions desc;

grant select on public.lb_most_active, public.lb_knowledge_grower, public.lb_consistent_grower, public.lb_business_builder, public.lb_community_grower to authenticated;

-- ===================================================================
-- Seed catalogs (idempotent — re-running won't clobber later edits made
-- directly in Supabase, since it's insert ... on conflict do nothing).
-- ===================================================================

insert into public.academy_achievements (id, name, description, icon, category, requirement_type, requirement_value, reward_xp, reward_seeds, sort_order) values
  ('first-sprout', 'First Sprout', 'Complete your first lesson.', '🌱', 'growth', 'lessons_completed', 1, 20, 10, 1),
  ('watered-roots', 'Watered the Roots', 'Maintain a 7-day learning streak.', '💧', 'consistency', 'streak_days', 7, 30, 20, 2),
  ('growing-strong', 'Growing Strong', 'Complete 10 lessons.', '🌿', 'growth', 'lessons_completed', 10, 50, 30, 3),
  ('first-bloom', 'First Bloom', 'Complete your first business challenge.', '🌸', 'business', 'challenges_completed', 1, 40, 25, 4),
  ('deep-roots', 'Deep Roots', 'Complete an entire learning path.', '🌳', 'growth', 'path_completed', 1, 100, 50, 5),
  ('fruitful-founder', 'Fruitful Founder', 'Successfully complete a business simulation.', '🍎', 'business', 'simulations_completed', 1, 60, 35, 6),
  ('evergreen-entrepreneur', 'Evergreen Entrepreneur', 'Maintain consistent learning for 30 days.', '🌲', 'consistency', 'streak_days', 30, 150, 100, 7),
  ('quiz-whiz', 'Quiz Whiz', 'Ace 5 quizzes with a perfect first-try score.', '🧠', 'knowledge', 'perfect_quizzes', 5, 70, 40, 8),
  ('sharp-shooter', 'Sharp Shooter', 'Pass 20 quizzes.', '🎯', 'knowledge', 'quizzes_passed', 20, 80, 45, 9)
on conflict (id) do nothing;

insert into public.garden_items (id, name, category, emoji, price_seeds, rarity, seasonal_tag, sort_order) values
  ('plant-tulip', 'Tulip', 'plants', '🌷', 60, 'common', null, 1),
  ('plant-sunflower', 'Sunflower', 'plants', '🌻', 90, 'common', null, 2),
  ('plant-strawberry', 'Strawberry Plant', 'plants', '🍓', 120, 'rare', null, 3),
  ('plant-small-tree', 'Small Tree', 'plants', '🌳', 180, 'rare', null, 4),
  ('plant-cactus', 'Cactus', 'plants', '🌵', 70, 'common', null, 5),
  ('plant-mushroom', 'Mushroom', 'plants', '🍄', 50, 'common', null, 6),
  ('deco-butterfly', 'Butterfly', 'decorations', '🦋', 80, 'common', null, 7),
  ('deco-bee', 'Bee', 'decorations', '🐝', 80, 'common', null, 8),
  ('deco-rocks', 'Rocks', 'decorations', '🪨', 40, 'common', null, 9),
  ('deco-sign', 'Garden Sign', 'decorations', '🪧', 60, 'common', null, 10),
  ('deco-lantern', 'Lantern', 'decorations', '🏮', 100, 'rare', null, 11),
  ('deco-bench', 'Small Bench', 'decorations', '🪑', 150, 'rare', null, 12),
  ('struct-greenhouse', 'Tiny Greenhouse', 'structures', '🏡', 300, 'epic', null, 13),
  ('struct-house', 'Garden House', 'structures', '🏠', 400, 'epic', null, 14),
  ('struct-stand', 'Plant Stand', 'structures', '🪴', 220, 'rare', null, 15),
  ('struct-watering', 'Watering Station', 'structures', '🚿', 220, 'rare', null, 16),
  ('profile-frame-gold', 'Golden Frame', 'profile', '🖼️', 250, 'rare', null, 17),
  ('profile-frame-mint', 'Mint Frame', 'profile', '🖼️', 150, 'common', null, 18),
  ('profile-badge-sprout', 'Sprout Badge', 'profile', '🌱', 100, 'common', null, 19),
  ('profile-name-sparkle', 'Sparkle Name', 'profile', '✨', 200, 'rare', null, 20),
  ('season-halloween', 'Pumpkin Patch', 'seasonal', '🎃', 90, 'common', 'halloween', 21),
  ('season-christmas', 'Christmas Parol', 'seasonal', '🎄', 120, 'rare', 'christmas', 22),
  ('season-newyear', 'New Year Fireworks', 'seasonal', '🎆', 100, 'common', 'new_year', 23),
  ('season-valentine', 'Valentine Roses', 'seasonal', '🌹', 90, 'common', 'valentine', 24),
  ('season-spring', 'Cherry Blossom', 'seasonal', '🌸', 100, 'common', 'spring', 25),
  ('season-ph-sampaguita', 'Sampaguita Garland', 'seasonal', '🌼', 130, 'rare', 'ph_fiesta', 26),
  ('season-ph-buntings', 'Fiesta Buntings', 'seasonal', '🎊', 110, 'common', 'ph_fiesta', 27)
on conflict (id) do nothing;

insert into public.academy_quests (id, name, description, icon, quest_type, activity_type, requirement_value, reward_xp, reward_seeds, sort_order) values
  ('daily-lesson', 'Complete 1 lesson', 'Finish any one Academy lesson today.', '📚', 'daily', 'lesson_complete', 1, 30, 20, 1),
  ('daily-quiz', 'Pass a quiz', 'Get a lesson quiz right today.', '🧠', 'daily', 'quiz_pass', 1, 50, 30, 2),
  ('daily-challenge', 'Complete a business challenge', 'Finish a business simulation today.', '💼', 'daily', 'challenge_complete', 1, 100, 50, 3),
  ('daily-streak', 'Maintain your growth streak', 'Do any qualifying activity today.', '🔥', 'daily', 'streak_maintain', 1, 0, 10, 4),
  ('weekly-lessons', 'Complete 5 lessons', 'Finish 5 Academy lessons this week.', '📖', 'weekly', 'lesson_complete', 5, 150, 100, 5),
  ('weekly-quizzes', 'Pass 3 quizzes', 'Get 3 lesson quizzes right this week.', '🧠', 'weekly', 'quiz_pass', 3, 180, 120, 6),
  ('weekly-challenge', 'Complete 2 business challenges', 'Finish 2 business simulations this week.', '💼', 'weekly', 'challenge_complete', 2, 300, 150, 7),
  ('weekly-perfect', 'Get 3 perfect quiz scores', 'Answer 3 quizzes correctly on the first try this week.', '🎯', 'weekly', 'quiz_perfect', 3, 180, 100, 8)
on conflict (id) do nothing;
