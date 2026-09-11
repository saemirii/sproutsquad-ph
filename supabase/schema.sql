create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  university text not null default 'All Campuses',
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id text primary key,
  seller_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  handle text not null unique,
  tagline text not null default '',
  description text not null default '',
  logo text not null default '',
  banner text not null default '',
  university text not null default 'All Campuses',
  campus_pickup_spots text[] not null default '{}',
  category text not null default 'Lifestyle & Gifts',
  gcash_number text not null default '',
  maya_number text,
  instagram_handle text,
  tiktok_handle text,
  rating numeric not null default 5,
  review_count integer not null default 0,
  established_date date not null default current_date,
  badges text[] not null default '{}',
  bes_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  order_number text not null,
  customer_id uuid not null references auth.users(id) on delete cascade,
  business_id text not null,
  business_name text not null,
  items jsonb not null default '[]',
  total_amount numeric not null default 0,
  total_cost numeric not null default 0,
  payment_method text not null,
  payment_status text not null,
  fulfillment_type text not null,
  delivery_method text not null,
  delivery_date date,
  meetup_location text not null default '',
  order_status text not null default 'Pending',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id text not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.orders enable row level security;
alter table public.business_members enable row level security;

create policy "Users can view their profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can create their profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Anyone can discover businesses"
  on public.businesses for select using (true);
create policy "Users can create their own businesses"
  on public.businesses for insert with check (auth.uid() = seller_id);
create policy "Owners can update their businesses"
  on public.businesses for update using (
    auth.uid() = seller_id
    or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
  );
create policy "Owners can delete their businesses"
  on public.businesses for delete using (auth.uid() = seller_id);

create policy "Members can view their business membership"
  on public.business_members for select using (auth.uid() = user_id);

create or replace function public.join_business_with_bes_key(target_business_id text, entered_bes_key text)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  matched boolean;
begin
  select exists (
    select 1 from public.businesses
    where id = target_business_id and bes_key = trim(entered_bes_key)
  ) into matched;

  if matched then
    insert into public.business_members (business_id, user_id)
    values (target_business_id, auth.uid())
    on conflict do nothing;
  end if;

  return matched;
end;
$$;

create policy "Customers and shop owners can view orders"
  on public.orders for select using (
    auth.uid() = customer_id
    or exists (select 1 from public.businesses where businesses.id = orders.business_id and businesses.seller_id = auth.uid())
  );
create policy "Customers can create their own orders"
  on public.orders for insert with check (auth.uid() = customer_id);
create policy "Shop owners can update their orders"
  on public.orders for update using (
    exists (select 1 from public.businesses where businesses.id = orders.business_id and businesses.seller_id = auth.uid())
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

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
  category text not null default 'Lifestyle & Gifts',
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

-- ===================================================================
-- Migration 3: delivery_method doesn't apply to Campus Meetup / Locker
-- pickup orders (only Dorm Delivery), so it must be nullable.
-- ===================================================================
alter table public.orders alter column delivery_method drop not null;
