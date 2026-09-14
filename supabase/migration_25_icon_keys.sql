-- Academy catalogs (garden_items, academy_achievements, academy_quests)
-- were seeded with raw emoji characters in migration_10. The app now
-- renders illustrated icons via <Icon name={...} /> (src/components/Icon.tsx,
-- src/assets/icons/*.png) instead of emoji, so these stored values are
-- swapped for the matching icon-name keys. Column names are unchanged
-- (garden_items keeps its `emoji` column; academyMappers.ts maps it to the
-- app's `icon` field) to avoid a schema change for a value-only update.

update public.garden_items set emoji = case id
  when 'plant-tulip' then 'level-bloom'
  when 'plant-sunflower' then 'shop-plant-sunflower'
  when 'plant-strawberry' then 'shop-plant-strawberry'
  when 'plant-small-tree' then 'level-grove'
  when 'plant-cactus' then 'shop-plant-cactus'
  when 'plant-mushroom' then 'shop-plant-mushroom'
  when 'deco-butterfly' then 'shop-deco-butterfly'
  when 'deco-bee' then 'shop-deco-bee'
  when 'deco-rocks' then 'shop-deco-rocks'
  when 'deco-sign' then 'shop-deco-garden-sign'
  when 'deco-lantern' then 'shop-deco-lantern'
  when 'deco-bench' then 'shop-deco-small-bench'
  when 'struct-greenhouse' then 'shop-struct-greenhouse'
  when 'struct-house' then 'shop-struct-garden-house'
  when 'struct-stand' then 'shop-plant-stand'
  when 'struct-watering' then 'shop-struct-watering-station'
  when 'profile-frame-gold' then 'shop-frame-golden'
  when 'profile-frame-mint' then 'shop-frame-mint'
  when 'profile-badge-sprout' then 'level-sprout'
  when 'profile-name-sparkle' then 'celebration-burst'
  when 'season-halloween' then 'seasonal-pumpkin'
  when 'season-christmas' then 'seasonal-christmas-parol'
  when 'season-newyear' then 'seasonal-new-year-fireworks'
  when 'season-valentine' then 'seasonal-valentine-roses'
  when 'season-spring' then 'level-bloom'
  when 'season-ph-sampaguita' then 'seasonal-sampaguita-garland'
  when 'season-ph-buntings' then 'seasonal-fiesta-buntings'
  else emoji
end
where id in (
  'plant-tulip','plant-sunflower','plant-strawberry','plant-small-tree','plant-cactus','plant-mushroom',
  'deco-butterfly','deco-bee','deco-rocks','deco-sign','deco-lantern','deco-bench',
  'struct-greenhouse','struct-house','struct-stand','struct-watering',
  'profile-frame-gold','profile-frame-mint','profile-badge-sprout','profile-name-sparkle',
  'season-halloween','season-christmas','season-newyear','season-valentine','season-spring',
  'season-ph-sampaguita','season-ph-buntings'
);

update public.academy_achievements set icon = case id
  when 'first-sprout' then 'level-sprout'
  when 'watered-roots' then 'achievement-watered-roots'
  when 'growing-strong' then 'level-grower'
  when 'first-bloom' then 'level-bloom'
  when 'deep-roots' then 'level-grove'
  when 'fruitful-founder' then 'achievement-fruitful-founder'
  when 'evergreen-entrepreneur' then 'level-cultivator'
  when 'quiz-whiz' then 'lesson-tip-insight'
  when 'sharp-shooter' then 'medal-1st'
  else icon
end
where id in (
  'first-sprout','watered-roots','growing-strong','first-bloom','deep-roots',
  'fruitful-founder','evergreen-entrepreneur','quiz-whiz','sharp-shooter'
);

update public.academy_quests set icon = case id
  when 'daily-lesson' then 'lesson-continue-learning'
  when 'daily-quiz' then 'lesson-tip-insight'
  when 'daily-challenge' then 'simulation-retail'
  when 'daily-streak' then 'streak-warning'
  when 'weekly-lessons' then 'lesson-formula'
  when 'weekly-quizzes' then 'lesson-tip-insight'
  when 'weekly-challenge' then 'simulation-retail'
  when 'weekly-perfect' then 'medal-1st'
  else icon
end
where id in (
  'daily-lesson','daily-quiz','daily-challenge','daily-streak',
  'weekly-lessons','weekly-quizzes','weekly-challenge','weekly-perfect'
);

-- squad_challenges rows are generated on demand by
-- get_or_create_active_squad_challenge() (migration_10), which always
-- inserts the icon literal '🌱' — update the function in place so future
-- rows get the icon key instead. Existing rows are backfilled too since
-- the icon is generic (not tied to which weekly template was picked). The
-- template names themselves keep their embedded emoji (e.g. '🌱 Marketing
-- Challenge') — that's stored display text, same as notification titles,
-- out of scope for this icon-key pass.
update public.squad_challenges set icon = 'level-sprout' where icon = '🌱';

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
    p_business_id, template_names[v_idx], template_descs[v_idx], 'level-sprout', 5, 3, 2, 250, 100, v_week_start, v_week_end
  )
  returning * into v_challenge;

  return v_challenge;
end;
$$;
