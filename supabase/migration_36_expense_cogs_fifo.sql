-- ===================================================================
-- Migration 36: Per-product FIFO cost-of-goods tracking for expenses.
--
-- "Materials & Supplies" and "Packaging" expenses can now be linked to the
-- specific product they were bought for, with a units-purchased count —
-- this is what lets the app compute Gross Profit by matching each
-- product's actual units sold (from completed orders) against the
-- oldest-first (FIFO) cost of the inventory/packaging batches that funded
-- them, instead of the old cash-basis "revenue minus every expense"
-- approximation.
--
-- product_name is a denormalized snapshot (same convention as
-- orders.business_name, order_items.product_name elsewhere in this schema)
-- so a logged expense stays legible even if the product is later deleted —
-- product_id itself goes null on delete since the expense record must
-- never be destroyed just because the product was.
--
-- Both new columns are nullable: only "Materials & Supplies" and
-- "Packaging" expenses are expected to carry them (enforced client-side),
-- every other category leaves them null.
--
-- Safe to run standalone / re-run (idempotent).
-- ===================================================================

alter table public.expenses
  add column if not exists product_id text references public.products(id) on delete set null,
  add column if not exists product_name text,
  add column if not exists units_purchased integer;
