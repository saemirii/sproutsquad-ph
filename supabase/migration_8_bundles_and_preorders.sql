-- ===================================================================
-- Migration 8: Bundle Builder and Pre-Order System (Sprout+ features).
--
-- Both are modeled as ordinary `products` rows with extra fields, so they
-- flow through all existing cart/checkout/order/inventory logic unchanged:
-- - A "bundle" is a product whose bundled_product_ids lists the component
--   products it combines, with its own independent price and inventory.
-- - A "pre-order" is a product flagged is_pre_order with an expected
--   release date, purchasable normally before it actually ships.
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

alter table public.products add column if not exists bundled_product_ids text[];
alter table public.products add column if not exists is_pre_order boolean not null default false;
alter table public.products add column if not exists pre_order_release_date date;
