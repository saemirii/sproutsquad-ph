-- ===================================================================
-- Migration 11: BES key privacy fix.
--
-- The `businesses` table's "Anyone can discover businesses" select policy
-- (schema.sql) is `using (true)` — necessary so the marketplace can show
-- every shop's name/logo/tagline to browsing customers, but it also let
-- bes_key (the shared "Business Entry & Sharing" key that grants a
-- teammate manager access) be read in plaintext by anyone: the app's own
-- businesses query included the column, and since RLS is row-level (not
-- column-level), any signed-in user could also query it directly via the
-- browser console for any business, then legitimately call
-- join_business_with_bes_key with it to self-grant real management access.
--
-- Fix: revoke SELECT on just the bes_key column for client roles.
-- Verifying/joining still works because both RPCs below compare the
-- entered key against the real column from inside a security-definer
-- function, which runs with the function owner's privileges and is
-- unaffected by this column-level revoke.
--
-- Safe to run standalone / re-run (idempotent) — revoke is a no-op if
-- already revoked, and both functions use create or replace.
-- ===================================================================

revoke select (bes_key) on public.businesses from anon, authenticated;

-- Lets an owner/member view their OWN shop's key (e.g. to share it with a
-- new teammate) without bes_key being broadly selectable for every business.
create or replace function public.get_my_business_bes_key(target_business_id text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_key text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select bes_key into v_key
  from public.businesses
  where id = target_business_id
    and (
      seller_id = v_user_id
      or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = v_user_id)
    );

  return v_key;
end;
$$;

-- Lets a teammate join a business using only its BES key — the server
-- resolves which business the key belongs to, so the client never needs
-- to browse/see every business in the app just to find the right row to
-- attach a key to (the old client UI listed every business for this).
create or replace function public.join_business_by_bes_key_only(entered_bes_key text)
returns table(business_id text, business_name text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_business_id text;
  v_business_name text;
begin
  select id, name into v_business_id, v_business_name
  from public.businesses
  where bes_key = trim(entered_bes_key)
  limit 1;

  if v_business_id is null then
    return;
  end if;

  insert into public.business_members (business_id, user_id)
  values (v_business_id, auth.uid())
  on conflict do nothing;

  return query select v_business_id, v_business_name;
end;
$$;
