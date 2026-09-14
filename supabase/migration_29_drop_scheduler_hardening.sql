-- ===================================================================
-- Fixes two gaps in the Product Drop Scheduler (Sprout+ feature):
--
-- 1. Favoriters were notified about a scheduled product the moment it was
--    *created*, regardless of how far out its drop_date was — spoiling
--    the whole point of a scheduled drop as a surprise reveal. This
--    defers that notification until the drop actually happens, using the
--    same "no cron job, catch up on next load" idiom already established
--    by migration_9 (visibility) and migration_22 (SproutUp's weekly
--    recompute): a new notify_dropped_products() RPC is called once by
--    the client on every app load (see loadInitialData in
--    src/context/AppContext.tsx), and is a cheap no-op for everyone after
--    the first caller following an actual drop moment.
--
-- 2. Nothing server-side ever enforced drop_date — place_order() would
--    happily sell a not-yet-dropped product to anyone who called it
--    directly (bypassing the UI's hide-until-drop filter), and the
--    products SELECT policy was fully open (`using (true)`), so the row
--    itself was readable early too. This adds a real drop_date check to
--    place_order(), and tightens the SELECT policy so a not-yet-dropped
--    product is only visible to its own seller/team or an admin.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

-- ---------------------------------------------------------------
-- 1. Defer the "new product" notification until the drop actually happens.
-- ---------------------------------------------------------------
alter table public.products add column if not exists drop_notified_at timestamptz;

create or replace function public.notify_new_product()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only notify right away if this isn't a scheduled future drop. A
  -- scheduled drop gets notified later, by notify_dropped_products()
  -- below, once its drop_date actually passes.
  if new.drop_date is null or new.drop_date <= now() then
    perform public.notify_business_favoriters(
      new.business_id, 'new_products', 'shop_new_product', '🌱 New product!',
      new.business_name || ' just added ' || new.name || '.',
      new.id, 'product', jsonb_build_object('view', 'product', 'businessId', new.business_id, 'productId', new.id)
    );
    update public.products set drop_notified_at = now() where id = new.id;
  end if;
  return new;
end;
$$;

-- Idempotent, cheap catch-up check — safe to call on every app load. The
-- first caller after a given product's drop_date passes does the real
-- work (one notification fan-out per newly-dropped product); every other
-- caller in between just runs an empty query. Mirrors migration_22's
-- recompute_sproutup_features() design.
create or replace function public.notify_dropped_products()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_product record;
begin
  for v_product in
    select id, business_id, business_name, name
    from public.products
    where drop_date is not null
      and drop_date <= now()
      and drop_notified_at is null
  loop
    perform public.notify_business_favoriters(
      v_product.business_id, 'new_products', 'shop_new_product', '🌱 New product!',
      v_product.business_name || ' just added ' || v_product.name || '.',
      v_product.id, 'product', jsonb_build_object('view', 'product', 'businessId', v_product.business_id, 'productId', v_product.id)
    );
    update public.products set drop_notified_at = now() where id = v_product.id;
  end loop;
end;
$$;

-- ---------------------------------------------------------------
-- 2. Make drop_date a real server-side embargo, not just a UI filter.
-- ---------------------------------------------------------------
drop policy if exists "Anyone can discover products" on public.products;
create policy "Anyone can discover products"
  on public.products for select using (
    drop_date is null
    or drop_date <= now()
    or exists (
      select 1 from public.businesses
      where businesses.id = products.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
    or public.is_admin()
  );

-- place_order() re-declared in full (see migration_24_proof_of_payment.sql)
-- with one addition: reject any item whose product hasn't dropped yet.
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
  v_proof_url text := nullif(p_order->>'proofOfPaymentUrl', '');
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_order->'items' is null or jsonb_array_length(p_order->'items') = 0 then
    raise exception 'Your bag is empty';
  end if;

  -- Proof of payment is mandatory for GCash/Maya — this app has no real
  -- payment gateway, so a screenshot is the only evidence a seller has
  -- that they were actually paid. Enforced server-side (not just hidden
  -- behind a disabled button client-side) so it can't be skipped by
  -- calling this RPC directly. Cash on Campus Meetup is exempt — payment
  -- happens in person, there's nothing to screenshot.
  if v_payment_method in ('GCash', 'Maya') and v_proof_url is null then
    raise exception 'Please attach proof of payment before placing this order';
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
    select id, name, price, cost_price, image_url, unit, is_pre_order, drop_date
      into v_product
      from public.products
      where id = (v_item->>'productId');

    if not found then
      raise exception 'A product in your cart no longer exists';
    end if;

    if v_product.drop_date is not null and v_product.drop_date > now() then
      raise exception '% has not dropped yet', v_product.name;
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
    when v_proof_url is not null then 'Pending Verification'
    else 'Paid'
  end;

  insert into public.orders (
    id, order_number, customer_id, customer_name, customer_contact, customer_university,
    business_id, business_name, items, total_amount, total_cost,
    payment_method, payment_status, fulfillment_type, delivery_method, delivery_date,
    meetup_location, order_status, notes, coupon_code, discount_amount, proof_of_payment_url, created_at
  ) values (
    v_order_id, p_order->>'orderNumber', v_user_id, p_order->>'customerName', p_order->>'customerContact',
    p_order->>'customerUniversity', v_business_id, p_order->>'businessName', v_items, v_total, v_total_cost,
    v_payment_method, v_payment_status, p_order->>'fulfillmentType', v_delivery_method,
    nullif(p_order->>'deliveryDate', '')::date, p_order->>'meetupLocation',
    coalesce(p_order->>'orderStatus', 'Pending'), nullif(p_order->>'notes', ''), v_coupon_code, v_discount,
    v_proof_url, now()
  );

  return query select v_order_id, v_total, v_discount, v_items;
end;
$$;
