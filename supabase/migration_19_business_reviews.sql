-- Star reviews: a customer can rate a business 1-5 stars, but only for an
-- order they actually completed. One review per order (order_id is the
-- primary key), re-rating updates it rather than creating a duplicate.
-- businesses.rating/review_count are recomputed as a live aggregate every
-- time a review is submitted, replacing the static placeholder values set
-- at business creation.

create table if not exists public.business_reviews (
  order_id text primary key references public.orders(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists business_reviews_business_id_idx on public.business_reviews(business_id);

alter table public.business_reviews enable row level security;

drop policy if exists "Reviews are publicly readable" on public.business_reviews;
create policy "Reviews are publicly readable"
  on public.business_reviews for select using (true);

-- No insert/update policy on this table: every write goes through
-- submit_review() below (security definer), which validates order
-- ownership + Completed status itself — same posture as orders/coupons.
-- Direct client inserts/updates are blocked by default-deny RLS.

create or replace function public.submit_review(p_order_id text, p_stars int)
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

  if p_stars < 1 or p_stars > 5 then
    raise exception 'Rating must be between 1 and 5 stars';
  end if;

  select * into v_order from public.orders where id = p_order_id;
  if not found then
    raise exception 'Order not found';
  elsif v_order.customer_id <> v_user_id then
    raise exception 'This is not your order';
  elsif v_order.order_status <> 'Completed' then
    raise exception 'You can only rate completed orders';
  end if;

  insert into public.business_reviews (order_id, business_id, customer_id, stars)
  values (p_order_id, v_order.business_id, v_user_id, p_stars)
  on conflict (order_id) do update
    set stars = excluded.stars, created_at = now();

  update public.businesses b
  set review_count = (select count(*) from public.business_reviews where business_id = b.id),
      rating = (select round(avg(stars)::numeric, 1) from public.business_reviews where business_id = b.id)
  where b.id = v_order.business_id;
end;
$$;
