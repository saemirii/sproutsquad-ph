-- ===================================================================
-- Migration 2: products, expenses, and profile avatar
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

alter table public.profiles add column if not exists avatar text;

alter table public.orders add column if not exists customer_name text not null default '';
alter table public.orders add column if not exists customer_contact text not null default '';
alter table public.orders add column if not exists customer_university text not null default 'All Campuses';

create table if not exists public.products (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  business_name text not null,
  university text not null default 'All Campuses',
  name text not null,
  description text not null default '',
  price numeric not null default 0,
  cost_price numeric not null default 0,
  category text not null default 'School Supplies',
  inventory_count integer not null default 0,
  image_url text not null default '',
  tags text[] not null default '{}',
  is_available boolean not null default true,
  unit text not null default 'piece',
  sku text,
  sold_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  date date not null default current_date,
  description text not null default '',
  amount numeric not null default 0,
  category text not null default 'Other Expenses',
  supplier_or_store text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "Anyone can discover products" on public.products;
create policy "Anyone can discover products"
  on public.products for select using (true);

drop policy if exists "Owners can add products" on public.products;
create policy "Owners can add products"
  on public.products for insert with check (
    exists (select 1 from public.businesses where businesses.id = products.business_id and businesses.seller_id = auth.uid())
  );

drop policy if exists "Owners can update their products" on public.products;
create policy "Owners can update their products"
  on public.products for update using (
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
    exists (select 1 from public.businesses where businesses.id = products.business_id and businesses.seller_id = auth.uid())
  );

drop policy if exists "Owners can view their expenses" on public.expenses;
create policy "Owners can view their expenses"
  on public.expenses for select using (
    exists (
      select 1 from public.businesses
      where businesses.id = expenses.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
  );

drop policy if exists "Owners can add expenses" on public.expenses;
create policy "Owners can add expenses"
  on public.expenses for insert with check (
    exists (select 1 from public.businesses where businesses.id = expenses.business_id and businesses.seller_id = auth.uid())
  );

drop policy if exists "Owners can delete their expenses" on public.expenses;
create policy "Owners can delete their expenses"
  on public.expenses for delete using (
    exists (select 1 from public.businesses where businesses.id = expenses.business_id and businesses.seller_id = auth.uid())
  );

-- Lets a customer's checkout decrement a seller's product stock without
-- granting customers direct UPDATE rights on products they don't own.
create or replace function public.decrement_product_stock(target_product_id text, qty integer)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.products
  set inventory_count = greatest(0, inventory_count - qty),
      sold_count = sold_count + qty
  where id = target_product_id;
end;
$$;
