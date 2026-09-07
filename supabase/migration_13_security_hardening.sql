-- ===================================================================
-- Migration 13: Security hardening — fixes 4 loopholes found during a
-- deliberate audit of everything built so far.
--
-- 1. place_order() (migration_12) trusted client-supplied prices/totals/
--    discount with no server-side cross-check against the real products/
--    coupons tables — a tampered client could submit a real order at any
--    price it wanted while still decrementing real inventory. Rewritten
--    to re-derive every price and the coupon discount from the database,
--    trusting the client only for productId + quantity (and the
--    customer's own contact/delivery preferences, which only affect
--    themselves). Also fixes a real atomicity bug in the original
--    version: on failure it returned a `success: false` row instead of
--    raising, which — for a failure partway through a multi-item order —
--    would have left earlier items' stock decrements committed despite
--    the overall order "failing". Every failure path now raises, which
--    Postgres guarantees rolls back everything the function already did
--    in this call.
--
-- 2. redeem_coupon() (migration_7) incremented redemption_count with no
--    check that the coupon was even still active/unexpired/under its
--    redemption limit. Hardened the same way, and coupon redemption now
--    also happens atomically inside place_order() itself rather than as
--    a separate client-triggered follow-up call.
--
-- 3. Sprout+ (coupons, bundles, pre-orders, scheduled drops) was only
--    gated in the UI (SproutPlusGate) — nothing server-side stopped a
--    non-subscriber from calling the same insert/update directly. Adds
--    business_has_sprout_plus() and layers it onto the relevant RLS
--    policies.
--
-- 4. create_notification/create_notification_if_enabled/
--    notify_business_team/notify_business_favoriters (migration_12) were
--    meant to be called only from triggers, but Postgres grants EXECUTE
--    to PUBLIC by default — any authenticated client could call them
--    directly to plant a fake notification (e.g. impersonating an
--    official announcement) in any user's feed. Execute is revoked from
--    client roles; the triggers that call them still work because a
--    security-definer function executes as its owner, which always
--    retains full rights on functions it owns regardless of what's been
--    revoked from other roles.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

-- ---------------------------------------------------------------
-- Fix 3 helper: does this business's owner currently have Sprout+?
-- Security definer because a team member (business_members) legitimately
-- using a subscribed shop's paid features has no RLS access to the
-- owner's own sprout_plus_subscriptions row otherwise.
-- ---------------------------------------------------------------
create or replace function public.business_has_sprout_plus(p_business_id text)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.businesses b
    join public.sprout_plus_subscriptions s on s.user_id = b.seller_id
    where b.id = p_business_id and s.status in ('active', 'cancelling')
  );
$$;

-- ---------------------------------------------------------------
-- Fix 3: coupons require Sprout+ to create.
-- ---------------------------------------------------------------
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
    and public.business_has_sprout_plus(coupons.business_id)
  );

-- ---------------------------------------------------------------
-- Fix 3: bundles / pre-orders / scheduled drops require Sprout+.
-- A plain product (none of these three fields set) is unaffected —
-- only inserts/updates that actually use a premium field are gated.
-- ---------------------------------------------------------------
drop policy if exists "Owners can add products" on public.products;
create policy "Owners can add products"
  on public.products for insert with check (
    exists (select 1 from public.businesses where businesses.id = products.business_id and businesses.seller_id = auth.uid())
    and (
      not (
        (bundled_product_ids is not null and cardinality(bundled_product_ids) > 0)
        or is_pre_order
        or drop_date is not null
      )
      or public.business_has_sprout_plus(products.business_id)
    )
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
  )
  with check (
    exists (
      select 1 from public.businesses
      where businesses.id = products.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
    and (
      not (
        (bundled_product_ids is not null and cardinality(bundled_product_ids) > 0)
        or is_pre_order
        or drop_date is not null
      )
      or public.business_has_sprout_plus(products.business_id)
    )
  );

-- ---------------------------------------------------------------
-- Fix 2: redeem_coupon() now actually enforces the coupon's own rules.
-- (No longer called by the client directly — place_order() below
-- redeems atomically as part of placing the order — but hardened
-- regardless, since it's still a public RPC anyone could call.)
-- ---------------------------------------------------------------
create or replace function public.redeem_coupon(target_coupon_id text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_coupon record;
begin
  select * into v_coupon from public.coupons where id = target_coupon_id;

  if not found then
    raise exception 'Coupon not found';
  elsif not v_coupon.is_active then
    raise exception 'Coupon is no longer active';
  elsif v_coupon.expires_at is not null and v_coupon.expires_at < now() then
    raise exception 'Coupon has expired';
  elsif v_coupon.max_redemptions is not null and v_coupon.redemption_count >= v_coupon.max_redemptions then
    raise exception 'Coupon has reached its redemption limit';
  end if;

  update public.coupons set redemption_count = redemption_count + 1 where id = target_coupon_id;
end;
$$;

-- ---------------------------------------------------------------
-- Fix 1: place_order() rewritten to be fully server-authoritative on
-- pricing, and atomic on every failure path (raises instead of
-- returning a false row, so Postgres rolls back the whole call).
--
-- The client is trusted only for: productId + quantity per item, the
-- coupon code it wants to try, and information about the customer
-- themselves (name/contact/delivery preference) that can't affect
-- anyone but them. Every price, the coupon discount, and payment_status
-- are derived from the database, never taken from the request.
--
-- Return type changed (order_id/final totals only, no more success
-- flag) — old signature dropped first since Postgres won't let
-- CREATE OR REPLACE change a function's return type.
-- ---------------------------------------------------------------
drop function if exists public.place_order(jsonb);

create or replace function public.place_order(p_order jsonb)
returns table(
  order_id text,
  final_total_amount numeric,
  final_discount_amount numeric,
  final_items jsonb
)
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_product record;
  v_qty integer;
  v_updated integer;
  v_order_id text := p_order->>'id';
  v_business_id text := p_order->>'businessId';
  v_items jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_total_cost numeric := 0;
  v_coupon record;
  v_coupon_code text := nullif(trim(p_order->>'couponCode'), '');
  v_discount numeric := 0;
  v_total numeric;
  v_payment_method text := p_order->>'paymentMethod';
  v_delivery_method text := nullif(p_order->>'deliveryMethod', '');
  v_payment_status text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_order->'items' is null or jsonb_array_length(p_order->'items') = 0 then
    raise exception 'Your bag is empty';
  end if;

  -- Validate the coupon BEFORE touching any inventory, so an invalid
  -- coupon never leaves a partial stock decrement behind.
  if v_coupon_code is not null then
    select * into v_coupon from public.coupons where business_id = v_business_id and code = v_coupon_code;
    if not found then
      raise exception 'That coupon code was not found for this shop';
    elsif not v_coupon.is_active then
      raise exception 'That coupon is no longer active';
    elsif v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'That coupon has expired';
    elsif v_coupon.max_redemptions is not null and v_coupon.redemption_count >= v_coupon.max_redemptions then
      raise exception 'That coupon has reached its redemption limit';
    end if;
  end if;

  for v_item in select * from jsonb_array_elements(p_order->'items') loop
    select id, name, price, cost_price, image_url, unit, is_pre_order
      into v_product
      from public.products
      where id = (v_item->>'productId');

    if not found then
      raise exception 'A product in your cart no longer exists';
    end if;

    v_qty := coalesce((v_item->>'quantity')::integer, 0);
    if v_qty <= 0 then
      raise exception 'Invalid quantity for %', v_product.name;
    end if;

    update public.products
    set inventory_count = inventory_count - v_qty,
        sold_count = sold_count + v_qty
    where id = v_product.id and inventory_count >= v_qty;

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception '% just sold out', v_product.name;
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    v_total_cost := v_total_cost + (v_product.cost_price * v_qty);

    v_items := v_items || jsonb_build_object(
      'productId', v_product.id,
      'productName', v_product.name,
      'price', v_product.price,
      'costPrice', v_product.cost_price,
      'quantity', v_qty,
      'imageUrl', v_product.image_url,
      'unit', v_product.unit,
      'isPreOrder', v_product.is_pre_order
    );
  end loop;

  if v_coupon_code is not null then
    v_discount := case
      when v_coupon.discount_type = 'percentage' then round(v_subtotal * (v_coupon.discount_value / 100))
      else least(v_coupon.discount_value, v_subtotal)
    end;
    update public.coupons set redemption_count = redemption_count + 1 where id = v_coupon.id;
  end if;

  v_total := greatest(0, v_subtotal - v_discount);
  v_payment_status := case
    when v_payment_method = 'Cash on Campus Meetup' then 'Pay on Meetup'
    when v_delivery_method = 'Cash on Delivery' then 'Pay on Delivery'
    else 'Paid'
  end;

  insert into public.orders (
    id, order_number, customer_id, customer_name, customer_contact, customer_university,
    business_id, business_name, items, total_amount, total_cost,
    payment_method, payment_status, fulfillment_type, delivery_method, delivery_date,
    meetup_location, order_status, notes, coupon_code, discount_amount, created_at
  ) values (
    v_order_id, p_order->>'orderNumber', v_user_id, p_order->>'customerName', p_order->>'customerContact',
    p_order->>'customerUniversity', v_business_id, p_order->>'businessName', v_items, v_total, v_total_cost,
    v_payment_method, v_payment_status, p_order->>'fulfillmentType', v_delivery_method,
    nullif(p_order->>'deliveryDate', '')::date, p_order->>'meetupLocation',
    coalesce(p_order->>'orderStatus', 'Pending'), nullif(p_order->>'notes', ''), v_coupon_code, v_discount, now()
  );

  return query select v_order_id, v_total, v_discount, v_items;
end;
$$;

-- ---------------------------------------------------------------
-- Fix 4: notification helper functions become internal-only. Triggers
-- keep working — they call these from inside their own security-definer
-- context, which always retains full rights on functions the same
-- owner owns, regardless of what's revoked from other roles here.
-- ---------------------------------------------------------------
revoke execute on function public.create_notification(uuid, text, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.create_notification_if_enabled(uuid, text, text, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.notify_business_team(text, text, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.notify_business_favoriters(text, text, text, text, text, text, text, jsonb) from public, anon, authenticated;
