-- ===================================================================
-- Migration 14: Order tracking UX — an "Out for Delivery" status for
-- courier-fulfilled orders, and a customer-initiated "I Received My
-- Order" confirmation.
--
-- Today, order completion is entirely seller-driven — the customer is
-- purely passive. This adds a second, safe way to close out an order:
-- confirm_order_received() lets the *customer* mark their own order
-- complete once it's Ready for Pickup / Out for Delivery (the seller's
-- own "mark complete" stays available as a fallback in case a customer
-- never taps it). It's a security-definer RPC rather than a broadened
-- RLS policy so a customer can only ever move their own order through
-- this one specific, validated transition — never touch price/status
-- fields arbitrarily.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

-- ---------------------------------------------------------------
-- Extend the order-status-changed notification for the new status.
-- ---------------------------------------------------------------
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
  elsif new.order_status = 'Out for Delivery' then
    v_type := 'order_out_for_delivery'; v_title := '🚚 Out for delivery!';
    v_message := 'Your order from ' || new.business_name || ' is on its way.';
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

-- ---------------------------------------------------------------
-- Customer-initiated receipt confirmation. Only the order's own
-- customer can call this, and only from the two statuses that mean
-- "the seller says this is on its way to you" — it cannot be used to
-- jump an order from Pending straight to Completed.
-- ---------------------------------------------------------------
create or replace function public.confirm_order_received(p_order_id text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_order from public.orders where id = p_order_id;
  if not found then
    raise exception 'Order not found';
  elsif v_order.customer_id <> v_user_id then
    raise exception 'This is not your order';
  elsif v_order.order_status not in ('Ready for Pickup', 'Out for Delivery') then
    raise exception 'This order cannot be confirmed as received yet';
  end if;

  update public.orders
  set order_status = 'Completed', payment_status = 'Paid'
  where id = p_order_id;
  -- The above update fires notify_order_status_changed (a customer-facing
  -- "order completed" receipt) automatically — no need to duplicate it here.

  perform public.notify_business_team(
    v_order.business_id, 'order_received', '✅ Customer confirmed receipt',
    coalesce(nullif(v_order.customer_name, ''), 'Your customer') || ' confirmed they received order ' || v_order.order_number || '.',
    p_order_id, 'order', jsonb_build_object('view', 'seller_order', 'businessId', v_order.business_id, 'orderId', p_order_id)
  );
end;
$$;
