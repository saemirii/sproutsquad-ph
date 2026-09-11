-- Consolidates the 6 separate concurrent queries the app fires on every
-- launch (businesses, products, orders, expenses, coupons, profile) into a
-- single RPC call — one connection/round-trip instead of 6 competing for
-- this project's (currently free-tier) connection pool at once. That
-- concurrent burst was the direct cause of the intermittent "0 revenue" /
-- "no orders found" empty-state failures: individual queries are cheap
-- (confirmed via EXPLAIN ANALYZE — single-digit milliseconds), but firing 6
-- of them simultaneously under connection-pool contention meant some would
-- randomly stall past even a generous timeout.
--
-- security invoker (not definer) is deliberate: this function runs with the
-- calling user's own permissions, so every one of these sub-selects is
-- still filtered by that table's existing RLS policies exactly as before —
-- this only reduces round-trips, it does not bypass any access control.
create or replace function public.get_initial_app_data()
returns jsonb
language plpgsql
security invoker
stable
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'businesses', (
      select coalesce(jsonb_agg(to_jsonb(b)), '[]'::jsonb)
      from (
        select id, seller_id, name, handle, tagline, description, banner,
               university, campus_pickup_spots, category, gcash_number,
               maya_number, instagram_handle, tiktok_handle, rating,
               review_count, established_date, badges
        from public.businesses
      ) b
    ),
    'products', (
      select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb)
      from (
        select id, business_id, business_name, university, name, description,
               price, cost_price, category, inventory_count, tags,
               is_available, unit, sku, sold_count, bundled_product_ids,
               is_pre_order, pre_order_release_date, drop_date
        from public.products
      ) p
    ),
    -- orders.items snapshots each cart item's full base64 product image at
    -- purchase time (same base64-in-column problem as businesses.logo /
    -- products.image_url, but never given the same "light columns"
    -- treatment) — confirmed via a live response that a single request
    -- carried tens of megabytes because of this alone. Nothing in the UI
    -- actually renders item.imageUrl (verified: OrderManager.tsx and
    -- IosBagView.tsx only ever show productName/quantity/price/isPreOrder),
    -- so it's stripped from every item here rather than fetched at all.
    'orders', (
      select coalesce(jsonb_agg(
        to_jsonb(o) || jsonb_build_object(
          'items', (
            select coalesce(jsonb_agg(elem - 'imageUrl'), '[]'::jsonb)
            from jsonb_array_elements(o.items) as elem
          )
        )
      ), '[]'::jsonb)
      from public.orders o
    ),
    'expenses', (select coalesce(jsonb_agg(to_jsonb(e)), '[]'::jsonb) from public.expenses e),
    'coupons', (select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) from public.coupons c),
    'profile', (select to_jsonb(pr) from public.profiles pr where pr.id = auth.uid())
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_initial_app_data() to authenticated;
