-- ============================================================
-- SproutUp! Phase 2 — human-curated recognition: Ambassador Picks,
-- Community Picks (nominations), Featured Sprouts.
--
-- Reuses Phase 1's (migration_22) business_feature_history ledger — its
-- feature_type check constraint already allows 'ambassador_pick',
-- 'community_pick', and 'featured_sprout', so no change is needed there —
-- and its sproutup notification-preference column / notify_business_team /
-- notify_business_favoriters calls.
--
-- No admin/moderator concept exists anywhere in this project before this
-- migration. This introduces the minimum viable primitive: two booleans
-- on profiles, checked server-side by every privileged RPC below (never
-- trusted from the client alone). After this runs, grant yourself the
-- first admin once via the Supabase SQL editor:
--   update public.profiles set is_admin = true where id = '<your user id>';
-- Every other admin/ambassador grant after that can happen in-app.
-- ============================================================

alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists is_ambassador boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- An admin can always do everything an ambassador can — a strict
-- superset, never the reverse.
create or replace function public.is_sproutup_ambassador()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin or is_ambassador from public.profiles where id = auth.uid()), false);
$$;

-- Lets an existing admin grant/revoke is_admin or is_ambassador on any
-- profile without needing the Supabase dashboard for anything past the
-- very first bootstrap grant above.
create or replace function public.admin_set_sproutup_role(p_user_id uuid, p_is_admin boolean, p_is_ambassador boolean)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change SproutUp roles';
  end if;
  update public.profiles set is_admin = p_is_admin, is_ambassador = p_is_ambassador where id = p_user_id;
end;
$$;

-- ------------------------------------------------------------
-- Community Picks (nominations)
-- ------------------------------------------------------------

create table if not exists public.sproutup_nominations (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  nominated_by uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  status text not null default 'pending', -- pending | approved | rejected | published | expired
  moderator_id uuid references auth.users(id),
  moderator_note text,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sproutup_nominations_business_id_idx on public.sproutup_nominations(business_id);
create index if not exists sproutup_nominations_status_idx on public.sproutup_nominations(status);

-- Enforces "one live nomination per user per business" — a rejected or
-- expired nomination doesn't block renominating later.
create unique index if not exists sproutup_nominations_one_live_per_user_business
  on public.sproutup_nominations (nominated_by, business_id)
  where status in ('pending', 'approved', 'published');

alter table public.sproutup_nominations enable row level security;

drop policy if exists "Published nominations are publicly readable, admins see everything" on public.sproutup_nominations;
create policy "Published nominations are publicly readable, admins see everything"
  on public.sproutup_nominations for select using (status = 'published' or public.is_admin());

-- No client insert/update policy — every write goes through the
-- security-definer RPCs below, same default-deny posture as
-- business_reviews.

create or replace function public.sync_sproutup_nomination_expirations()
returns void
language sql
security definer set search_path = public
as $$
  update public.sproutup_nominations set status = 'expired', updated_at = now()
  where status = 'published' and expires_at < now();
$$;

create or replace function public.submit_sproutup_nomination(p_business_id text, p_reason text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
  v_recent_count int;
  v_max_recent_nominations constant int := 3;
  v_recent_window constant interval := interval '7 days';
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  if trim(coalesce(p_reason, '')) = '' then
    raise exception 'Please share a reason for this nomination';
  end if;
  if not exists (select 1 from public.businesses where id = p_business_id) then
    raise exception 'Business not found';
  end if;

  if exists (
    select 1 from public.sproutup_nominations
    where business_id = p_business_id and nominated_by = v_user_id
      and status in ('pending', 'approved', 'published')
  ) then
    raise exception 'You already have an active nomination for this shop';
  end if;

  select count(*) into v_recent_count
  from public.sproutup_nominations
  where nominated_by = v_user_id and created_at > now() - v_recent_window;
  if v_recent_count >= v_max_recent_nominations then
    raise exception 'You have reached the nomination limit for this week — try again soon';
  end if;

  insert into public.sproutup_nominations (business_id, nominated_by, reason)
  values (p_business_id, v_user_id, trim(p_reason))
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.moderate_sproutup_nomination(p_id uuid, p_decision text, p_note text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can moderate nominations';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Invalid decision';
  end if;

  update public.sproutup_nominations
  set status = p_decision, moderator_id = auth.uid(), moderator_note = p_note, updated_at = now()
  where id = p_id and status = 'pending';

  if not found then
    raise exception 'Nomination not found or not pending';
  end if;
end;
$$;

create or replace function public.publish_sproutup_nomination(p_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_nom record;
  v_business_name text;
  v_period_start date := current_date;
  v_period_end date;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can publish nominations';
  end if;

  select * into v_nom from public.sproutup_nominations where id = p_id and status = 'approved';
  if not found then
    raise exception 'Nomination not found or not approved';
  end if;

  v_period_end := v_period_start + 28; -- 4 weeks

  update public.sproutup_nominations
  set status = 'published', published_at = now(), expires_at = now() + interval '4 weeks', updated_at = now()
  where id = p_id;

  select name into v_business_name from public.businesses where id = v_nom.business_id;

  insert into public.business_feature_history (business_id, feature_type, period_start, period_end, score_breakdown, status, created_by, notified)
  values (v_nom.business_id, 'community_pick', v_period_start, v_period_end, jsonb_build_object('nomination_id', p_id), 'active', auth.uid(), true)
  on conflict (business_id, feature_type, period_start) do nothing;

  perform public.notify_business_team(
    v_nom.business_id, 'sproutup_nomination_published', '💌 You got SproutedUp!',
    coalesce(v_business_name, 'Your shop') || ' was picked as a Community Pick by a fellow student!',
    v_nom.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_nom.business_id)
  );
  perform public.notify_business_favoriters(
    v_nom.business_id, 'sproutup', 'sproutup_shop_featured', '✨ A shop you follow got SproutedUp!',
    coalesce(v_business_name, 'A shop you follow') || ' was just featured as a Community Pick.',
    v_nom.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_nom.business_id)
  );
  perform public.create_notification(
    v_nom.nominated_by, 'sproutup_nomination_published', '🎉 Your pick just got SproutedUp!',
    'Your nomination for ' || coalesce(v_business_name, 'a shop') || ' was published on SproutUp!',
    v_nom.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_nom.business_id)
  );
end;
$$;

-- ------------------------------------------------------------
-- Ambassador Picks
-- ------------------------------------------------------------

create table if not exists public.sproutup_ambassador_picks (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  ambassador_id uuid not null references auth.users(id) on delete cascade,
  headline text not null,
  description text not null,
  status text not null default 'pending', -- pending | approved | rejected | published | expired
  moderator_id uuid references auth.users(id),
  moderator_note text,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sproutup_ambassador_picks_business_id_idx on public.sproutup_ambassador_picks(business_id);

alter table public.sproutup_ambassador_picks enable row level security;

drop policy if exists "Published picks are public, admins and the author see everything" on public.sproutup_ambassador_picks;
create policy "Published picks are public, admins and the author see everything"
  on public.sproutup_ambassador_picks for select
  using (status = 'published' or public.is_admin() or ambassador_id = auth.uid());

create or replace function public.sync_sproutup_ambassador_pick_expirations()
returns void
language sql
security definer set search_path = public
as $$
  update public.sproutup_ambassador_picks set status = 'expired', updated_at = now()
  where status = 'published' and expires_at < now();
$$;

create or replace function public.submit_ambassador_pick(p_business_id text, p_headline text, p_description text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_sproutup_ambassador() then
    raise exception 'Only a Sprout Ambassador can submit a pick';
  end if;
  if trim(coalesce(p_headline, '')) = '' or trim(coalesce(p_description, '')) = '' then
    raise exception 'Please fill in both a headline and a description';
  end if;
  if not exists (select 1 from public.businesses where id = p_business_id) then
    raise exception 'Business not found';
  end if;

  insert into public.sproutup_ambassador_picks (business_id, ambassador_id, headline, description)
  values (p_business_id, auth.uid(), trim(p_headline), trim(p_description))
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.moderate_ambassador_pick(p_id uuid, p_decision text, p_note text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can moderate ambassador picks';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Invalid decision';
  end if;

  update public.sproutup_ambassador_picks
  set status = p_decision, moderator_id = auth.uid(), moderator_note = p_note, updated_at = now()
  where id = p_id and status = 'pending';

  if not found then
    raise exception 'Ambassador pick not found or not pending';
  end if;
end;
$$;

create or replace function public.publish_ambassador_pick(p_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_pick record;
  v_business_name text;
  v_period_start date := current_date;
  v_period_end date;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can publish ambassador picks';
  end if;

  select * into v_pick from public.sproutup_ambassador_picks where id = p_id and status = 'approved';
  if not found then
    raise exception 'Ambassador pick not found or not approved';
  end if;

  v_period_end := v_period_start + 28;

  update public.sproutup_ambassador_picks
  set status = 'published', published_at = now(), expires_at = now() + interval '4 weeks', updated_at = now()
  where id = p_id;

  select name into v_business_name from public.businesses where id = v_pick.business_id;

  insert into public.business_feature_history (business_id, feature_type, period_start, period_end, score_breakdown, status, created_by, notified)
  values (v_pick.business_id, 'ambassador_pick', v_period_start, v_period_end, jsonb_build_object('ambassador_pick_id', p_id), 'active', auth.uid(), true)
  on conflict (business_id, feature_type, period_start) do nothing;

  perform public.notify_business_team(
    v_pick.business_id, 'sproutup_ambassador_pick_published', '🌟 You got SproutedUp!',
    coalesce(v_business_name, 'Your shop') || ' was selected by a Sprout Ambassador!',
    v_pick.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_pick.business_id)
  );
  perform public.notify_business_favoriters(
    v_pick.business_id, 'sproutup', 'sproutup_shop_featured', '✨ A shop you follow got SproutedUp!',
    coalesce(v_business_name, 'A shop you follow') || ' was just selected as an Ambassador Pick.',
    v_pick.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_pick.business_id)
  );
  perform public.create_notification(
    v_pick.ambassador_id, 'sproutup_ambassador_pick_published', '🌟 Your Ambassador Pick is live!',
    'Your pick for ' || coalesce(v_business_name, 'a shop') || ' was published on SproutUp!',
    v_pick.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_pick.business_id)
  );
end;
$$;

-- ------------------------------------------------------------
-- Featured Sprouts (admin-authored only, no approval step)
-- ------------------------------------------------------------

create table if not exists public.sproutup_featured_sprouts (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  title text not null,
  description text not null default '',
  image_url text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sproutup_featured_sprouts_business_id_idx on public.sproutup_featured_sprouts(business_id);

alter table public.sproutup_featured_sprouts enable row level security;

drop policy if exists "Currently-live featured sprouts are public, admins see everything" on public.sproutup_featured_sprouts;
create policy "Currently-live featured sprouts are public, admins see everything"
  on public.sproutup_featured_sprouts for select
  using ((is_published and now() between starts_at and ends_at) or public.is_admin());

create or replace function public.create_featured_sprout(
  p_business_id text, p_title text, p_description text, p_image_url text,
  p_starts_at timestamptz, p_ends_at timestamptz
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can create a Featured Sprout';
  end if;
  if trim(coalesce(p_title, '')) = '' then
    raise exception 'Please give this Featured Sprout a title';
  end if;
  if p_ends_at <= p_starts_at then
    raise exception 'End date must be after the start date';
  end if;
  if not exists (select 1 from public.businesses where id = p_business_id) then
    raise exception 'Business not found';
  end if;

  insert into public.sproutup_featured_sprouts (business_id, title, description, image_url, starts_at, ends_at, created_by)
  values (p_business_id, trim(p_title), coalesce(p_description, ''), p_image_url, coalesce(p_starts_at, now()), p_ends_at, auth.uid())
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.update_featured_sprout(
  p_id uuid, p_title text, p_description text, p_image_url text,
  p_starts_at timestamptz, p_ends_at timestamptz, p_sort_order integer
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can edit a Featured Sprout';
  end if;
  if p_ends_at <= p_starts_at then
    raise exception 'End date must be after the start date';
  end if;

  update public.sproutup_featured_sprouts
  set title = trim(p_title), description = coalesce(p_description, ''), image_url = p_image_url,
      starts_at = p_starts_at, ends_at = p_ends_at, sort_order = coalesce(p_sort_order, sort_order),
      updated_at = now()
  where id = p_id;

  if not found then
    raise exception 'Featured Sprout not found';
  end if;
end;
$$;

-- Shared by publish/unpublish — the only state that changes is
-- is_published, but publishing is also the moment a ledger row +
-- notifications should fire (mirrors moderate vs publish being separate
-- steps for nominations/ambassador picks above).
create or replace function public.publish_featured_sprout(p_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_feat record;
  v_business_name text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can publish a Featured Sprout';
  end if;

  select * into v_feat from public.sproutup_featured_sprouts where id = p_id;
  if not found then
    raise exception 'Featured Sprout not found';
  end if;

  update public.sproutup_featured_sprouts set is_published = true, updated_at = now() where id = p_id;

  select name into v_business_name from public.businesses where id = v_feat.business_id;

  insert into public.business_feature_history (business_id, feature_type, period_start, period_end, score_breakdown, status, created_by, notified)
  values (v_feat.business_id, 'featured_sprout', v_feat.starts_at::date, v_feat.ends_at::date, jsonb_build_object('featured_sprout_id', p_id), 'active', auth.uid(), true)
  on conflict (business_id, feature_type, period_start) do nothing;

  perform public.notify_business_team(
    v_feat.business_id, 'sproutup_featured_sprout_live', '✨ You got SproutedUp!',
    coalesce(v_business_name, 'Your shop') || ' is now a Featured Sprout on SproutUp!',
    v_feat.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_feat.business_id)
  );
  perform public.notify_business_favoriters(
    v_feat.business_id, 'sproutup', 'sproutup_shop_featured', '✨ A shop you follow got SproutedUp!',
    coalesce(v_business_name, 'A shop you follow') || ' is now a Featured Sprout.',
    v_feat.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_feat.business_id)
  );
end;
$$;

create or replace function public.unpublish_featured_sprout(p_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can unpublish a Featured Sprout';
  end if;
  update public.sproutup_featured_sprouts set is_published = false, updated_at = now() where id = p_id;
  if not found then
    raise exception 'Featured Sprout not found';
  end if;
end;
$$;

create or replace function public.delete_featured_sprout(p_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can delete a Featured Sprout';
  end if;
  delete from public.sproutup_featured_sprouts where id = p_id;
  if not found then
    raise exception 'Featured Sprout not found';
  end if;
end;
$$;

-- ------------------------------------------------------------
-- Notification preference wiring — reuses Phase 1's `sproutup` column;
-- nothing new needed there. The internal notification primitives called
-- above (create_notification, notify_business_team,
-- notify_business_favoriters) already have EXECUTE revoked from
-- public/anon/authenticated per migration_13 — calling them from these
-- new security-definer functions works the same way it already does from
-- recompute_sproutup_features() in migration_22.
-- ------------------------------------------------------------
