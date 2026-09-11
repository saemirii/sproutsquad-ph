-- Extends business_reviews with a written description and up to 3 photos,
-- plus the reviewer's display name. customer_name is denormalized onto the
-- review row (copied from the order at submission time) rather than joined
-- live, since orders aren't otherwise readable by other users — same
-- denormalization convention already used for orders.business_name.

alter table public.business_reviews add column if not exists customer_name text not null default '';
alter table public.business_reviews add column if not exists images text[] not null default '{}';

-- create or replace can extend a function's parameter list with trailing
-- defaults without breaking existing callers (old 2-arg calls still work,
-- comment/images just default null/empty) — no need to drop the old one.
create or replace function public.submit_review(
  p_order_id text,
  p_stars int,
  p_comment text default null,
  p_images text[] default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order record;
  v_images text[] := coalesce(p_images, '{}');
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_stars < 1 or p_stars > 5 then
    raise exception 'Rating must be between 1 and 5 stars';
  end if;

  if array_length(v_images, 1) > 3 then
    raise exception 'You can attach up to 3 photos';
  end if;

  select * into v_order from public.orders where id = p_order_id;
  if not found then
    raise exception 'Order not found';
  elsif v_order.customer_id <> v_user_id then
    raise exception 'This is not your order';
  elsif v_order.order_status <> 'Completed' then
    raise exception 'You can only rate completed orders';
  end if;

  insert into public.business_reviews (order_id, business_id, customer_id, customer_name, stars, comment, images)
  values (p_order_id, v_order.business_id, v_user_id, v_order.customer_name, p_stars, nullif(trim(p_comment), ''), v_images)
  on conflict (order_id) do update
    set stars = excluded.stars, comment = excluded.comment, images = excluded.images, created_at = now();

  update public.businesses b
  set review_count = (select count(*) from public.business_reviews where business_id = b.id),
      rating = (select round(avg(stars)::numeric, 1) from public.business_reviews where business_id = b.id)
  where b.id = v_order.business_id;
end;
$$;
