-- ===================================================================
-- Migration 4: business_members were missing from several RLS policies,
-- so a teammate who joined a shop via BES key (a separate account) could
-- not see or manage that shop's orders/products/expenses the same way
-- the original owner could — e.g. past orders wouldn't appear at all.
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

drop policy if exists "Customers and shop owners can view orders" on public.orders;
create policy "Customers and shop owners can view orders"
  on public.orders for select using (
    auth.uid() = customer_id
    or exists (
      select 1 from public.businesses
      where businesses.id = orders.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
  );

drop policy if exists "Shop owners can update their orders" on public.orders;
create policy "Shop owners can update their orders"
  on public.orders for update using (
    exists (
      select 1 from public.businesses
      where businesses.id = orders.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
  );

drop policy if exists "Owners can add products" on public.products;
create policy "Owners can add products"
  on public.products for insert with check (
    exists (
      select 1 from public.businesses
      where businesses.id = products.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
  );

drop policy if exists "Owners can delete their products" on public.products;
create policy "Owners can delete their products"
  on public.products for delete using (
    exists (
      select 1 from public.businesses
      where businesses.id = products.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
  );

drop policy if exists "Owners can add expenses" on public.expenses;
create policy "Owners can add expenses"
  on public.expenses for insert with check (
    exists (
      select 1 from public.businesses
      where businesses.id = expenses.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
  );

drop policy if exists "Owners can delete their expenses" on public.expenses;
create policy "Owners can delete their expenses"
  on public.expenses for delete using (
    exists (
      select 1 from public.businesses
      where businesses.id = expenses.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
  );
