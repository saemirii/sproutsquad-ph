-- ===================================================================
-- Migration 16: Realtime order status sync.
--
-- Updating an order's status in Shop OS (updateOrderStatus /
-- confirm_order_received) only ever updated the *acting* client's own
-- local state plus the database row — nothing pushed that change to any
-- other open session (the customer's own "My Bag" tab, a teammate's Shop
-- OS tab, the customer on a second device). Without a page reload
-- (which re-runs the initial fetch), the order looked frozen in its old
-- status anywhere else it was being viewed. `notifications` already gets
-- this treatment (migration_12); `orders` needs the exact same wiring so
-- the order-tracking UX (OrderStatusStepper, "I Received My Order")
-- actually reflects live changes.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;
