-- Fixes a severe performance bug: SELECT on public.orders was taking 8-10
-- seconds for a 22-row table when queried as an authenticated user (vs
-- <1s as anon). The RLS policy on orders is:
--
--   auth.uid() = customer_id
--     or exists (select 1 from public.businesses
--                 where businesses.id = orders.business_id
--                   and businesses.seller_id = auth.uid())
--
-- With no index on orders.customer_id, orders.business_id, or
-- businesses.seller_id, Postgres falls back to an expensive nested-loop
-- plan once auth.uid() actually returns a real value (confirmed directly:
-- anon requests, where auth.uid() is null and both branches short-circuit
-- cheaply, were fast; authenticated requests against the same table were
-- consistently 8-10s across repeated tries). This is the standard,
-- documented fix for this exact RLS pattern — index every column an RLS
-- policy filters or joins on.

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_business_id_idx on public.orders (business_id);
create index if not exists businesses_seller_id_idx on public.businesses (seller_id);
