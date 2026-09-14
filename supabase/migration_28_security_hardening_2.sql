-- ===================================================================
-- Closes two privilege-escalation / sabotage holes found in a security
-- audit:
--
-- 1. profiles' UPDATE policy ("Users can update their profile", from
--    schema.sql) is `using (auth.uid() = id)` with no WITH CHECK and no
--    column restriction. Since is_admin/is_ambassador were added later
--    (migration_23) as plain columns on the same row, any authenticated
--    user can currently do:
--      supabase.from('profiles').update({ is_admin: true }).eq('id', me)
--    and it passes RLS, self-granting full admin (SproutUp moderation,
--    admin_set_sproutup_role, order_issues resolution, ...). This adds a
--    trigger that blocks changes to is_admin/is_ambassador unless the
--    caller is already an admin (or the change comes from direct
--    SQL/service-role, e.g. the manual first-admin grant documented in
--    migration_23).
--
-- 2. decrement_product_stock (migration_2_products_expenses.sql) predates
--    place_order and is no longer called anywhere in the client — but was
--    never execute-revoked like create_notification/notify_business_team
--    were in migration_13. It has no ownership check and no bound on qty,
--    so any authenticated user can currently zero out a competitor's
--    inventory or inflate sold_count via a direct RPC call. Locking it
--    down the same way migration_13 locked down the notification RPCs.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

-- ---------------------------------------------------------------
-- 1. Prevent self-granted admin/ambassador via direct profiles update.
-- ---------------------------------------------------------------
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (new.is_admin is distinct from old.is_admin or new.is_ambassador is distinct from old.is_ambassador)
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an existing admin can change is_admin or is_ambassador.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_privilege_escalation on public.profiles;
create trigger prevent_profile_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

-- ---------------------------------------------------------------
-- 2. Lock down the orphaned decrement_product_stock RPC.
-- ---------------------------------------------------------------
revoke execute on function public.decrement_product_stock(text, integer) from public, anon, authenticated;
