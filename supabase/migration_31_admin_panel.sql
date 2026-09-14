-- Admin panel: grants permanent admin access to two named accounts, and
-- adds the two RPCs the new in-app Admin Panel needs that nothing existing
-- covered:
--
-- 1. admin_create_business() — lets an admin manually create a business
--    for an applicant who already has a SproutSquad account (reviewed
--    outside the app, e.g. via the Google Form CreateShopButton.tsx links
--    to), generating a fresh Start-Up Key (bes_key) the same way
--    createBusiness() already does client-side for the offline demo path.
--    Assigns the real applicant as seller_id (immediate owner access, no
--    key needed on their end) — the generated key is for THEM to later
--    invite teammates via business_members, same as any other shop.
--
-- 2. admin_lookup_user_by_email() — lets an admin find a user by email
--    (profiles.email isn't otherwise queryable by non-admins) as the first
--    step of granting/revoking is_admin/is_ambassador via the existing
--    admin_set_sproutup_role() (migration_23), which had a function but no
--    UI anywhere in the app until now.
--
-- Safe to run standalone / re-run (idempotent).

-- ---------------------------------------------------------------
-- 1. Permanent admins, by email — both at signup (future re-signups,
--    e.g. after an account deletion) and right now (both already have
--    accounts).
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    lower(coalesce(new.email, '')) in ('safina.ng@mgcnewlife.ph', 'faith.caitlin.ng@gmail.com')
  );
  return new;
end;
$$;

update public.profiles set is_admin = true
where id in (
  select id from auth.users where lower(email) in ('safina.ng@mgcnewlife.ph', 'faith.caitlin.ng@gmail.com')
);

-- ---------------------------------------------------------------
-- 2. Admin-created businesses, with a generated Start-Up Key.
-- ---------------------------------------------------------------
create or replace function public.admin_create_business(
  p_owner_email text,
  p_name text,
  p_handle text,
  p_university text,
  p_category text,
  p_tagline text default '',
  p_description text default '',
  p_campus_pickup_spots text[] default '{}',
  p_gcash_number text default ''
)
returns table (business_id text, bes_key text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner_id uuid;
  v_business_id text;
  v_bes_key text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can create a business this way';
  end if;
  if trim(coalesce(p_owner_email, '')) = '' then
    raise exception 'Owner email is required';
  end if;
  if trim(coalesce(p_name, '')) = '' then
    raise exception 'Business name is required';
  end if;
  if trim(coalesce(p_handle, '')) = '' then
    raise exception 'Handle is required';
  end if;

  select id into v_owner_id from auth.users where lower(email) = lower(trim(p_owner_email));
  if v_owner_id is null then
    raise exception 'No SproutSquad account found for that email — the owner needs to sign up first';
  end if;

  if exists (select 1 from public.businesses where lower(handle) = lower(trim(p_handle))) then
    raise exception 'That handle is already taken';
  end if;

  v_business_id := 'biz-' || replace(gen_random_uuid()::text, '-', '');
  select 'BES-' || string_agg(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ceil(random() * 36)::int, 1), '')
    into v_bes_key
    from generate_series(1, 6);

  insert into public.businesses (
    id, seller_id, name, handle, tagline, description, logo, banner,
    university, campus_pickup_spots, category, gcash_number, bes_key,
    rating, review_count, established_date, badges
  ) values (
    v_business_id, v_owner_id, trim(p_name), trim(p_handle), coalesce(p_tagline, ''), coalesce(p_description, ''),
    '', '', p_university, coalesce(p_campus_pickup_spots, '{}'), p_category, coalesce(p_gcash_number, ''),
    v_bes_key, 5, 0, current_date, array['New Sprout 🌱', 'Campus Verified']
  );

  return query select v_business_id, v_bes_key;
end;
$$;

-- ---------------------------------------------------------------
-- 3. Look up a user by email, to grant/revoke admin/ambassador via the
--    existing admin_set_sproutup_role() RPC.
-- ---------------------------------------------------------------
create or replace function public.admin_lookup_user_by_email(p_email text)
returns table (user_id uuid, full_name text, email text, is_admin boolean, is_ambassador boolean)
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can look up users';
  end if;

  return query
    select p.id, p.full_name, p.email, p.is_admin, p.is_ambassador
    from public.profiles p
    where lower(p.email) = lower(trim(p_email));
end;
$$;
