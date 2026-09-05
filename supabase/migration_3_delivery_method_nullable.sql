-- Migration 3: delivery_method doesn't apply to Campus Meetup / Locker
-- pickup orders (only Dorm Delivery), so it must be nullable.
alter table public.orders alter column delivery_method drop not null;
