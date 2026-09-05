-- ===================================================================
-- Migration 7: Coupons (Sprout+ Discount & Coupon Generator) and order
-- discount tracking (for Sprout+ Order Export).
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

create table if not exists public.coupons (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  code text not null,
  discount_type text not null default 'percentage', -- 'percentage' | 'fixed'
  discount_value numeric not null default 0,
  is_active boolean not null default true,
  max_redemptions integer,
  redemption_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, code)
);

alter table public.coupons enable row level security;

-- Any shopper needs to be able to look up a coupon by code at checkout, so
-- select is open — same "discoverable, not sensitive" model as products.
drop policy if exists "Anyone can look up coupons" on public.coupons;
create policy "Anyone can look up coupons"
  on public.coupons for select using (true);

drop policy if exists "Owners can add coupons" on public.coupons;
create policy "Owners can add coupons"
  on public.coupons for insert with check (
    exists (
      select 1 from public.businesses
      where businesses.id = coupons.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
  );

drop policy if exists "Owners can update coupons" on public.coupons;
create policy "Owners can update coupons"
  on public.coupons for update using (
    exists (
      select 1 from public.businesses
      where businesses.id = coupons.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
  );

drop policy if exists "Owners can delete coupons" on public.coupons;
create policy "Owners can delete coupons"
  on public.coupons for delete using (
    exists (select 1 from public.businesses where businesses.id = coupons.business_id and businesses.seller_id = auth.uid())
  );

-- Lets a customer's checkout record a coupon redemption without granting
-- customers direct UPDATE rights on coupons they don't own (same pattern as
-- decrement_product_stock for inventory).
create or replace function public.redeem_coupon(target_coupon_id text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.coupons
  set redemption_count = redemption_count + 1
  where id = target_coupon_id;
end;
$$;

alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount_amount numeric not null default 0;
