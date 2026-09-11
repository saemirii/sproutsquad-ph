-- ============================================================
-- SproutUp! Phase 1 — automated, non-AI business discovery.
--
-- Hidden Gems + Rising Sprouts are computed deterministically from real
-- business/order/review/favorite data — no AI calls, no scheduled job
-- (this project has no cron runner anywhere; server.ts/Netlify functions
-- are request-driven only). Instead, recompute_sproutup_features() is a
-- cheap, idempotent RPC any authenticated client can call on every
-- SproutUp tab open — the first caller of a new ISO week does the real
-- work once, every later call that week is a single existence check.
-- This mirrors migration_9's drop_date design ("hidden until that moment
-- passes, then shows up automatically next load — no cron job needed").
--
-- order_count_* signals require aggregating across every business's
-- orders, which orders' own RLS blocks a normal client from doing (a
-- business can only ever see its own orders) — hence the scoring
-- functions below are `security definer`, the same idiom this project
-- already uses for submit_review/place_order/redeem_coupon to safely
-- cross that boundary while only ever exposing aggregate counts, never
-- raw order or customer rows.
-- ============================================================

-- Generic, append-only recognition ledger. The feature_type check
-- constraint pre-declares every eventual SproutUp feature type (including
-- the human-moderated ones planned for a later phase), so that phase
-- needs zero schema migration to start writing into this same table.
create table if not exists public.business_feature_history (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  feature_type text not null check (feature_type in (
    'hidden_gem', 'rising_sprout',
    'ambassador_pick', 'community_pick', 'featured_sprout', 'collab_corner'
  )),
  period_start date not null,
  period_end date not null,
  rank integer,
  score numeric,
  score_breakdown jsonb not null default '{}',
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  created_by uuid references auth.users(id),
  notified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (business_id, feature_type, period_start)
);

create index if not exists business_feature_history_business_id_idx on public.business_feature_history(business_id);
create index if not exists business_feature_history_type_period_idx on public.business_feature_history(feature_type, period_start desc);

alter table public.business_feature_history enable row level security;

drop policy if exists "Feature history is publicly readable" on public.business_feature_history;
create policy "Feature history is publicly readable"
  on public.business_feature_history for select using (true);

-- No insert/update/delete policy — default-deny RLS, same posture as
-- business_reviews. Only recompute_sproutup_features() below ever writes
-- into this table.

-- ------------------------------------------------------------
-- Scoring
-- ------------------------------------------------------------

-- The single source of truth for every raw signal and every scoring
-- weight — tune by editing the `k` CTE below. Nothing else redefines
-- these constants.
create or replace function public.compute_sproutup_signals()
returns table (
  business_id text,
  follower_count integer,
  order_count_total integer,
  order_count_recent_14d integer,
  order_count_prior_14d integer,
  available_product_count integer,
  quality_score numeric,
  visibility_score numeric
)
language sql
stable
security definer set search_path = public
as $$
  with k as (
    select
      3::int      as min_review_count_for_full_rating_credit,
      20::numeric as follower_visibility_cap,
      15::numeric as order_visibility_cap,
      5::numeric  as review_volume_cap,
      3::numeric  as product_readiness_cap,
      90::numeric as recency_horizon_days
  ),
  fav as (
    select business_id, count(*)::int as follower_count
    from public.business_favorites
    group by business_id
  ),
  ord as (
    select
      business_id,
      count(*) filter (where order_status <> 'Cancelled')::int as order_count_total,
      count(*) filter (
        where order_status <> 'Cancelled' and created_at >= now() - interval '14 days'
      )::int as order_count_recent_14d,
      count(*) filter (
        where order_status <> 'Cancelled'
          and created_at < now() - interval '14 days'
          and created_at >= now() - interval '28 days'
      )::int as order_count_prior_14d
    from public.orders
    group by business_id
  ),
  prod as (
    select
      business_id,
      count(*) filter (where is_available)::int as available_product_count,
      max(created_at) as last_product_created_at
    from public.products
    group by business_id
  ),
  base as (
    select
      b.id as business_id,
      b.rating,
      b.review_count,
      coalesce(fav.follower_count, 0) as follower_count,
      coalesce(ord.order_count_total, 0) as order_count_total,
      coalesce(ord.order_count_recent_14d, 0) as order_count_recent_14d,
      coalesce(ord.order_count_prior_14d, 0) as order_count_prior_14d,
      coalesce(prod.available_product_count, 0) as available_product_count,
      (
        (case when trim(b.tagline) <> '' then 0.2 else 0 end) +
        (case when length(trim(b.description)) >= 40 then 0.2 else 0 end) +
        (case when trim(b.logo) <> '' then 0.2 else 0 end) +
        (case when trim(b.banner) <> '' then 0.2 else 0 end) +
        (case when cardinality(b.campus_pickup_spots) >= 1 then 0.2 else 0 end)
      ) as profile_completeness,
      extract(day from now() - coalesce(prod.last_product_created_at, b.created_at))::numeric as days_since_last_activity
    from public.businesses b
    left join fav on fav.business_id = b.id
    left join ord on ord.business_id = b.id
    left join prod on prod.business_id = b.id
  )
  select
    base.business_id,
    base.follower_count,
    base.order_count_total,
    base.order_count_recent_14d,
    base.order_count_prior_14d,
    base.available_product_count,
    -- quality_score (0-100): 40% rating (with a minimum-review floor so a
    -- single 5-star review doesn't dominate), 20% profile completeness,
    -- 20% available-product readiness, 10% recency, 10% review volume.
    round(
      40 * (case when base.review_count >= k.min_review_count_for_full_rating_credit then (base.rating / 5.0) else 0.5 end) +
      20 * base.profile_completeness +
      20 * least(base.available_product_count / k.product_readiness_cap, 1) +
      10 * greatest(0, 1 - (base.days_since_last_activity / k.recency_horizon_days)) +
      10 * least(base.review_count / k.review_volume_cap, 1)
    , 1) as quality_score,
    -- visibility_score (0-100): 60% follower count (capped), 40% total
    -- order count (capped).
    round(
      60 * least(base.follower_count / k.follower_visibility_cap, 1) +
      40 * least(base.order_count_total / k.order_visibility_cap, 1)
    , 1) as visibility_score
  from base cross join k;
$$;

-- Eligibility gate FIRST, ranking SECOND — this is what prevents "just
-- pick the least popular shop" (the spec's explicit requirement).
-- Visibility is only ever a ceiling filter here, never part of the sort —
-- a shop only qualifies by being genuinely good AND under-exposed, and
-- wins by being the best of that set, not the smallest.
create or replace function public.hidden_gems_candidates()
returns table (business_id text, quality_score numeric, visibility_score numeric, rank integer)
language sql
stable
as $$
  with k as (
    select
      55::numeric as quality_floor,
      35::numeric as visibility_ceiling,
      3::int      as min_order_count,
      6::int      as top_n,
      28::int     as cooldown_days
  ),
  s as (select * from public.compute_sproutup_signals()),
  eligible as (
    select s.business_id, s.quality_score, s.visibility_score
    from s, k
    where s.available_product_count >= 1
      and s.order_count_total >= k.min_order_count
      and s.quality_score >= k.quality_floor
      and s.visibility_score <= k.visibility_ceiling
      and not exists (
        select 1 from public.business_feature_history h, k
        where h.business_id = s.business_id
          and h.feature_type = 'hidden_gem'
          and h.status = 'active'
          and h.period_start >= current_date - k.cooldown_days
      )
  )
  select
    business_id, quality_score, visibility_score,
    row_number() over (order by quality_score desc, visibility_score asc, business_id asc)::int as rank
  from eligible
  order by quality_score desc, visibility_score asc, business_id asc
  limit (select top_n from k);
$$;

-- Sample-size floors FIRST (this is what stops a 1->2-order shop from
-- ever outranking a 50->75 one — it fails the floor outright regardless
-- of its 100% growth rate), percentage growth among survivors SECOND.
create or replace function public.rising_sprouts_candidates()
returns table (business_id text, order_count_recent_14d integer, order_count_prior_14d integer, growth_pct numeric, rank integer)
language sql
stable
as $$
  with k as (
    select
      5::int      as min_prior_orders,
      8::int      as min_recent_orders,
      3::int      as min_absolute_delta,
      25::numeric as min_growth_pct,
      6::int      as top_n,
      14::int     as cooldown_days
  ),
  s as (select * from public.compute_sproutup_signals()),
  eligible as (
    select
      s.business_id, s.order_count_recent_14d, s.order_count_prior_14d,
      round(
        ((s.order_count_recent_14d - s.order_count_prior_14d)::numeric / nullif(s.order_count_prior_14d, 0)) * 100
      , 1) as growth_pct
    from s, k
    where s.order_count_prior_14d >= k.min_prior_orders
      and s.order_count_recent_14d >= k.min_recent_orders
      and (s.order_count_recent_14d - s.order_count_prior_14d) >= k.min_absolute_delta
      and ((s.order_count_recent_14d - s.order_count_prior_14d)::numeric / nullif(s.order_count_prior_14d, 0)) * 100 >= k.min_growth_pct
      and not exists (
        select 1 from public.business_feature_history h, k
        where h.business_id = s.business_id
          and h.feature_type = 'rising_sprout'
          and h.status = 'active'
          and h.period_start >= current_date - k.cooldown_days
      )
  )
  select
    business_id, order_count_recent_14d, order_count_prior_14d, growth_pct,
    row_number() over (order by growth_pct desc, business_id asc)::int as rank
  from eligible
  order by growth_pct desc, business_id asc
  limit (select top_n from k);
$$;

-- Idempotent per ISO week: the first caller of a new week locks in that
-- week's winners (on conflict do nothing + returning ensures only the
-- row that actually got inserted triggers a notification, so two users
-- opening the SproutUp tab in the same instant can't double-notify);
-- every later call that week is a single cheap existence check. Reads
-- always go against these locked-in rows, not the live candidate
-- functions directly, so a business's badge never flaps mid-week.
create or replace function public.recompute_sproutup_features()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_period_start date := date_trunc('week', now())::date;
  v_period_end date := date_trunc('week', now())::date + 6;
  v_row record;
  v_business_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.business_feature_history
    where feature_type = 'hidden_gem' and period_start = v_period_start
  ) then
    for v_row in
      insert into public.business_feature_history (business_id, feature_type, period_start, period_end, rank, score, score_breakdown, notified)
      select business_id, 'hidden_gem', v_period_start, v_period_end, rank, quality_score,
             jsonb_build_object('visibility_score', visibility_score), true
      from public.hidden_gems_candidates()
      on conflict (business_id, feature_type, period_start) do nothing
      returning business_id
    loop
      select name into v_business_name from public.businesses where id = v_row.business_id;
      perform public.notify_business_team(
        v_row.business_id, 'sproutup_hidden_gem', '💎 You got SproutedUp!',
        coalesce(v_business_name, 'Your shop') || ' was picked as a Hidden Gem this week — a curated boost for great shops flying under the radar.',
        v_row.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_row.business_id)
      );
      perform public.notify_business_favoriters(
        v_row.business_id, 'sproutup', 'sproutup_shop_featured', '✨ A shop you follow got SproutedUp!',
        coalesce(v_business_name, 'A shop you follow') || ' was just featured as a Hidden Gem this week.',
        v_row.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_row.business_id)
      );
    end loop;
  end if;

  if not exists (
    select 1 from public.business_feature_history
    where feature_type = 'rising_sprout' and period_start = v_period_start
  ) then
    for v_row in
      insert into public.business_feature_history (business_id, feature_type, period_start, period_end, rank, score, score_breakdown, notified)
      select business_id, 'rising_sprout', v_period_start, v_period_end, rank, growth_pct,
             jsonb_build_object('order_count_recent_14d', order_count_recent_14d, 'order_count_prior_14d', order_count_prior_14d), true
      from public.rising_sprouts_candidates()
      on conflict (business_id, feature_type, period_start) do nothing
      returning business_id
    loop
      select name into v_business_name from public.businesses where id = v_row.business_id;
      perform public.notify_business_team(
        v_row.business_id, 'sproutup_rising_sprout', '📈 You got SproutedUp!',
        coalesce(v_business_name, 'Your shop') || ' is this week''s Rising Sprout — your orders are taking off!',
        v_row.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_row.business_id)
      );
      perform public.notify_business_favoriters(
        v_row.business_id, 'sproutup', 'sproutup_shop_featured', '✨ A shop you follow got SproutedUp!',
        coalesce(v_business_name, 'A shop you follow') || ' is this week''s Rising Sprout.',
        v_row.business_id, 'business', jsonb_build_object('view', 'sproutup', 'businessId', v_row.business_id)
      );
    end loop;
  end if;
end;
$$;

-- ------------------------------------------------------------
-- Notification preference wiring
-- ------------------------------------------------------------

alter table public.notification_preferences add column if not exists sproutup boolean not null default true;

-- Re-defined with one added branch — same idempotent re-`create or
-- replace` pattern migration_13 already used for this exact function.
-- Signature is unchanged, so migration_13's `revoke execute ... from
-- public, anon, authenticated` on this function stays in effect (Postgres
-- privileges are tied to the function's OID, which create or replace
-- preserves as long as the signature doesn't change).
create or replace function public.create_notification_if_enabled(
  p_user_id uuid,
  p_category text,
  p_type text,
  p_title text,
  p_message text,
  p_related_id text default null,
  p_related_type text default null,
  p_action jsonb default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_enabled boolean;
begin
  if p_category = 'orders' then
    select orders into v_enabled from public.notification_preferences where user_id = p_user_id;
  elsif p_category = 'new_products' then
    select new_products into v_enabled from public.notification_preferences where user_id = p_user_id;
  elsif p_category = 'restocks' then
    select restocks into v_enabled from public.notification_preferences where user_id = p_user_id;
  elsif p_category = 'promotions' then
    select promotions into v_enabled from public.notification_preferences where user_id = p_user_id;
  elsif p_category = 'announcements' then
    select announcements into v_enabled from public.notification_preferences where user_id = p_user_id;
  elsif p_category = 'sproutup' then
    select sproutup into v_enabled from public.notification_preferences where user_id = p_user_id;
  end if;

  if coalesce(v_enabled, true) then
    perform public.create_notification(p_user_id, p_type, p_title, p_message, p_related_id, p_related_type, p_action);
  end if;
end;
$$;
