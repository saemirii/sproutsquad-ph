-- ===================================================================
-- Migration 12: Notification system + atomic, server-validated order
-- placement.
--
-- Notification architecture: every event source (a new order, a status
-- change, stock crossing a threshold, a new favorite-shop product, an
-- account event) funnels through one of two functions —
-- create_notification() (always sent) or create_notification_if_enabled()
-- (checks notification_preferences first) — called from AFTER triggers on
-- the tables that already change for these events. Triggers were chosen
-- over sprinkling notification calls through client code because they
-- fire regardless of which code path mutated the row, can't be bypassed
-- by the client, and require zero changes to already-working UI logic
-- for most of them.
--
-- Also fixes a real bug found while wiring order/inventory notifications:
-- order placement previously decremented inventory purely client-side
-- (see AppContext.tsx's old placeOrder), so two customers could both
-- "successfully" buy the last unit of something. place_order() below
-- validates and decrements stock atomically server-side — if any item in
-- the order doesn't have enough stock, the whole call rolls back (nothing
-- decremented, no order row inserted) and reports which item was short.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

-- ---------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  related_id text,
  related_type text,
  action jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_created_at_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- No client insert/delete policy — every row is written by a trigger or
-- create_notification()/create_notification_if_enabled() (both security
-- definer).

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  orders boolean not null default true,
  new_products boolean not null default true,
  restocks boolean not null default true,
  promotions boolean not null default true,
  announcements boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "Users can view their own notification preferences" on public.notification_preferences;
create policy "Users can view their own notification preferences"
  on public.notification_preferences for select using (auth.uid() = user_id);

drop policy if exists "Users can create their own notification preferences" on public.notification_preferences;
create policy "Users can create their own notification preferences"
  on public.notification_preferences for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own notification preferences" on public.notification_preferences;
create policy "Users can update their own notification preferences"
  on public.notification_preferences for update using (auth.uid() = user_id);

-- Account notifications (welcome, subscription changes) and merchant
-- operational notifications (new order, low/out of stock) are NOT gated
-- by any of the columns above — they're always sent, matching "don't
-- allow disabling critical notifications."

create table if not exists public.business_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

alter table public.business_favorites enable row level security;

drop policy if exists "Anyone can see shop follower relationships" on public.business_favorites;
create policy "Anyone can see shop follower relationships"
  on public.business_favorites for select using (true);

drop policy if exists "Users can favorite a shop" on public.business_favorites;
create policy "Users can favorite a shop"
  on public.business_favorites for insert with check (auth.uid() = user_id);

drop policy if exists "Users can unfavorite a shop" on public.business_favorites;
create policy "Users can unfavorite a shop"
  on public.business_favorites for delete using (auth.uid() = user_id);

-- An admin posts an announcement by inserting a row here directly via the
-- Supabase dashboard/SQL editor — there's no in-app admin UI at this
-- project's scale. No client policies at all (same pattern as
-- revenuecat_webhook_events): never read or written by client-side code.
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- ---------------------------------------------------------------
-- Core notification functions
-- ---------------------------------------------------------------
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_related_id text default null,
  p_related_type text default null,
  p_action jsonb default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.notifications (user_id, type, title, message, related_id, related_type, action)
  values (p_user_id, p_type, p_title, p_message, p_related_id, p_related_type, p_action)
  returning id into v_id;
  return v_id;
end;
$$;

-- Same as above, but checks notification_preferences first (defaulting to
-- enabled if the user has no preferences row yet) and no-ops if the given
-- category is disabled. p_category must be one of the boolean columns on
-- notification_preferences (orders | new_products | restocks | promotions
-- | announcements).
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
  end if;

  if coalesce(v_enabled, true) then
    perform public.create_notification(p_user_id, p_type, p_title, p_message, p_related_id, p_related_type, p_action);
  end if;
end;
$$;

-- Notifies a business's owner + every team member (not preference-gated —
-- these are operational, "run your shop" notifications).
create or replace function public.notify_business_team(
  p_business_id text,
  p_type text,
  p_title text,
  p_message text,
  p_related_id text,
  p_related_type text,
  p_action jsonb
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid;
begin
  for v_user_id in
    select seller_id from public.businesses where id = p_business_id
    union
    select user_id from public.business_members where business_id = p_business_id
  loop
    perform public.create_notification(v_user_id, p_type, p_title, p_message, p_related_id, p_related_type, p_action);
  end loop;
end;
$$;

-- Notifies everyone who has favorited a business, gated by preference category.
create or replace function public.notify_business_favoriters(
  p_business_id text,
  p_category text,
  p_type text,
  p_title text,
  p_message text,
  p_related_id text,
  p_related_type text,
  p_action jsonb
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid;
begin
  for v_user_id in select user_id from public.business_favorites where business_id = p_business_id loop
    perform public.create_notification_if_enabled(v_user_id, p_category, p_type, p_title, p_message, p_related_id, p_related_type, p_action);
  end loop;
end;
$$;

-- ---------------------------------------------------------------
-- Order triggers
-- ---------------------------------------------------------------
create or replace function public.notify_order_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.notify_business_team(
    new.business_id, 'new_order', '🌱 New order!',
    'You have a new order from ' || coalesce(nullif(new.customer_name, ''), 'a customer') || '.',
    new.id, 'order', jsonb_build_object('view', 'seller_order', 'businessId', new.business_id, 'orderId', new.id)
  );

  perform public.create_notification_if_enabled(
    new.customer_id, 'orders', 'order_placed', '🌱 Order placed!',
    'Your order from ' || new.business_name || ' has been placed.',
    new.id, 'order', jsonb_build_object('view', 'customer_order', 'orderId', new.id)
  );
  return new;
end;
$$;

drop trigger if exists on_order_created on public.orders;
create trigger on_order_created
after insert on public.orders
for each row execute procedure public.notify_order_created();

create or replace function public.notify_order_status_changed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_type text;
  v_title text;
  v_message text;
begin
  if new.order_status is not distinct from old.order_status then
    return new;
  end if;

  if new.order_status = 'Preparing' then
    v_type := 'order_accepted'; v_title := '🌿 Order accepted!';
    v_message := 'Your order from ' || new.business_name || ' has been accepted and is being prepared.';
  elsif new.order_status = 'Ready for Pickup' then
    v_type := 'order_ready'; v_title := '🌸 Ready for pickup!';
    v_message := 'Your order from ' || new.business_name || ' is ready for pickup.';
  elsif new.order_status = 'Completed' then
    v_type := 'order_completed'; v_title := 'Order completed';
    v_message := 'Your order from ' || new.business_name || ' is complete. Thanks for supporting a student shop!';
  elsif new.order_status = 'Cancelled' then
    v_type := 'order_cancelled'; v_title := 'Order cancelled';
    v_message := 'Your order from ' || new.business_name || ' was cancelled.';
  else
    return new;
  end if;

  perform public.create_notification_if_enabled(
    new.customer_id, 'orders', v_type, v_title, v_message,
    new.id, 'order', jsonb_build_object('view', 'customer_order', 'orderId', new.id)
  );
  return new;
end;
$$;

drop trigger if exists on_order_status_changed on public.orders;
create trigger on_order_status_changed
after update of order_status on public.orders
for each row execute procedure public.notify_order_status_changed();

-- ---------------------------------------------------------------
-- Product triggers
-- ---------------------------------------------------------------
create or replace function public.notify_product_stock_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.inventory_count is not distinct from old.inventory_count then
    return new;
  end if;

  if new.inventory_count = 0 and old.inventory_count > 0 then
    perform public.notify_business_team(
      new.business_id, 'out_of_stock', '🍃 Out of stock',
      new.name || ' is now out of stock.',
      new.id, 'product', jsonb_build_object('view', 'seller_products', 'businessId', new.business_id)
    );
  elsif new.inventory_count <= 5 and old.inventory_count > 5 then
    perform public.notify_business_team(
      new.business_id, 'low_stock', '🍃 Running low',
      new.name || ' is running low on stock (' || new.inventory_count || ' left).',
      new.id, 'product', jsonb_build_object('view', 'seller_products', 'businessId', new.business_id)
    );
  end if;

  if new.inventory_count > 0 and old.inventory_count = 0 then
    perform public.notify_business_favoriters(
      new.business_id, 'restocks', 'shop_restock', '🌿 Back in stock!',
      new.name || ' is back in stock at ' || new.business_name || '.',
      new.id, 'product', jsonb_build_object('view', 'product', 'businessId', new.business_id, 'productId', new.id)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_product_stock_change on public.products;
create trigger on_product_stock_change
after update of inventory_count on public.products
for each row execute procedure public.notify_product_stock_change();

create or replace function public.notify_new_product()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.notify_business_favoriters(
    new.business_id, 'new_products', 'shop_new_product', '🌱 New product!',
    new.business_name || ' just added ' || new.name || '.',
    new.id, 'product', jsonb_build_object('view', 'product', 'businessId', new.business_id, 'productId', new.id)
  );
  return new;
end;
$$;

-- Note: this fires at creation time regardless of a future drop_date
-- (Sprout+ Product Drop Scheduler) — there's no server-side scheduled job
-- in this project to defer it to the actual drop moment, so favoriters
-- are told about a scheduled drop as soon as it's created, not when it
-- goes live.
drop trigger if exists on_product_created on public.products;
create trigger on_product_created
after insert on public.products
for each row execute procedure public.notify_new_product();

-- ---------------------------------------------------------------
-- Coupon trigger
-- ---------------------------------------------------------------
create or replace function public.notify_new_coupon()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_business_name text;
begin
  select name into v_business_name from public.businesses where id = new.business_id;
  perform public.notify_business_favoriters(
    new.business_id, 'promotions', 'shop_promotion', '🏷️ New promo!',
    coalesce(v_business_name, 'A shop you follow') || ' just released a new discount code.',
    new.id, 'coupon', jsonb_build_object('view', 'business', 'businessId', new.business_id)
  );
  return new;
end;
$$;

drop trigger if exists on_coupon_created on public.coupons;
create trigger on_coupon_created
after insert on public.coupons
for each row execute procedure public.notify_new_coupon();

-- ---------------------------------------------------------------
-- Announcements fan-out
-- ---------------------------------------------------------------
create or replace function public.notify_announcement()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid;
begin
  for v_user_id in select id from public.profiles loop
    perform public.create_notification_if_enabled(
      v_user_id, 'announcements', 'announcement', new.title, new.message,
      new.id, 'announcement', jsonb_build_object('view', 'announcement', 'announcementId', new.id)
    );
  end loop;
  return new;
end;
$$;

drop trigger if exists on_announcement_created on public.announcements;
create trigger on_announcement_created
after insert on public.announcements
for each row execute procedure public.notify_announcement();

-- ---------------------------------------------------------------
-- Welcome notification — extends the existing handle_new_user() trigger
-- from schema.sql rather than adding a second one.
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);

  perform public.create_notification(
    new.id, 'welcome', '🌱 Welcome to SproutSquad!',
    'Explore the marketplace, start your shop, or dive into Sprout Academy. Glad you are here.',
    null, null, jsonb_build_object('view', 'marketplace')
  );

  return new;
end;
$$;

-- ---------------------------------------------------------------
-- Atomic, server-validated order placement (the overselling fix).
--
-- p_order is a JSON object shaped like the client's Order type (camelCase
-- keys, matching how `items` is already stored — see supabaseMappers.ts'
-- orderToRow, which passes order.items straight through unchanged).
-- customer_id is taken from auth.uid(), never trusted from p_order.
--
-- For every item, this only decrements stock if there's enough left
-- (`inventory_count >= qty`). If any item comes up short, the function
-- raises, which rolls back everything it already did in this call
-- (Postgres wraps a single function invocation in an implicit
-- transaction) — so a failed order never partially decrements stock or
-- creates a half-valid row.
-- ---------------------------------------------------------------
create or replace function public.place_order(p_order jsonb)
returns table(success boolean, order_id text, insufficient_product_name text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_product_id text;
  v_qty integer;
  v_updated integer;
  v_product_name text;
  v_order_id text := p_order->>'id';
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  for v_item in select * from jsonb_array_elements(p_order->'items') loop
    v_product_id := v_item->>'productId';
    v_qty := (v_item->>'quantity')::integer;

    update public.products
    set inventory_count = inventory_count - v_qty,
        sold_count = sold_count + v_qty
    where id = v_product_id and inventory_count >= v_qty;

    get diagnostics v_updated = row_count;

    if v_updated = 0 then
      select name into v_product_name from public.products where id = v_product_id;
      return query select false, null::text, coalesce(v_product_name, 'an item in your cart');
      return;
    end if;
  end loop;

  insert into public.orders (
    id, order_number, customer_id, customer_name, customer_contact, customer_university,
    business_id, business_name, items, total_amount, total_cost,
    payment_method, payment_status, fulfillment_type, delivery_method, delivery_date,
    meetup_location, order_status, notes, coupon_code, discount_amount, created_at
  ) values (
    v_order_id,
    p_order->>'orderNumber',
    v_user_id,
    p_order->>'customerName',
    p_order->>'customerContact',
    p_order->>'customerUniversity',
    p_order->>'businessId',
    p_order->>'businessName',
    p_order->'items',
    (p_order->>'totalAmount')::numeric,
    (p_order->>'totalCost')::numeric,
    p_order->>'paymentMethod',
    p_order->>'paymentStatus',
    p_order->>'fulfillmentType',
    nullif(p_order->>'deliveryMethod', ''),
    nullif(p_order->>'deliveryDate', '')::date,
    p_order->>'meetupLocation',
    coalesce(p_order->>'orderStatus', 'Pending'),
    nullif(p_order->>'notes', ''),
    nullif(p_order->>'couponCode', ''),
    coalesce((p_order->>'discountAmount')::numeric, 0),
    now()
  );

  return query select true, v_order_id, null::text;
end;
$$;

-- ---------------------------------------------------------------
-- Realtime: let clients subscribe to their own new notifications without
-- polling. Guarded so re-running this migration doesn't error if the
-- table is already part of the publication.
-- ---------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
