-- Lets a buyer attach a screenshot of their GCash/Maya payment per shop at
-- checkout, so the seller has something to verify against instead of
-- taking the buyer's word for it. Cash on Campus Meetup needs no proof —
-- payment happens in person.
--
-- payment_status already had a 'Pending Verification' value declared on
-- the client (src/types.ts) that nothing ever set — this is the missing
-- piece: a GCash/Maya order with proof attached lands there instead of
-- being marked 'Paid' on the buyer's say-so, until the seller confirms it.

alter table public.orders add column if not exists proof_of_payment_url text;

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
