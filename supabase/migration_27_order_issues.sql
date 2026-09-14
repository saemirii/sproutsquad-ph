-- "Report an Issue" on orders. Either party marking an order Completed/
-- Received instantly reflects on both sides with no way to dispute it — a
-- mis-click, or a seller marking Completed before the buyer actually got
-- their order, had no recourse. This adds a lightweight flag-and-notify
-- mechanism: reporting does NOT change the order's status itself (a
-- deliberate choice — an automatic revert could be gamed by a bad-faith
-- report), it just surfaces the concern to the other party and to admins.

create table if not exists public.order_issues (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reporter_role text not null check (reporter_role in ('buyer', 'seller')),
  reason text not null,
  message text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists order_issues_order_id_idx on public.order_issues (order_id);
create index if not exists order_issues_status_idx on public.order_issues (status) where status = 'open';

alter table public.order_issues enable row level security;

-- Same "seller or team member" exists-check migration_4 already uses for
-- orders/products/expenses.
drop policy if exists "Order participants and admins can view issues" on public.order_issues;
create policy "Order participants and admins can view issues"
  on public.order_issues for select using (
    auth.uid() = reporter_id
    or exists (select 1 from public.orders where orders.id = order_issues.order_id and orders.customer_id = auth.uid())
    or exists (
      select 1 from public.businesses
      where businesses.id = order_issues.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
    or public.is_admin()
  );

drop policy if exists "Order participants can report an issue" on public.order_issues;
create policy "Order participants can report an issue"
  on public.order_issues for insert with check (
    auth.uid() = reporter_id
    and exists (
      select 1 from public.orders
      where orders.id = order_issues.order_id
      and orders.business_id = order_issues.business_id
      and (
        orders.customer_id = auth.uid()
        or exists (
          select 1 from public.businesses
          where businesses.id = orders.business_id
          and (
            businesses.seller_id = auth.uid()
            or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
          )
        )
      )
    )
  );

drop policy if exists "Admins can resolve issues" on public.order_issues;
create policy "Admins can resolve issues"
  on public.order_issues for update using (public.is_admin());

-- Notify the OTHER party the moment an issue is reported — same
-- can't-be-bypassed-by-the-client trigger pattern as
-- notify_order_created()/notify_order_status_changed() (migration_12).
create or replace function public.notify_order_issue_reported()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_order record;
begin
  select customer_id, business_name, order_number into v_order
  from public.orders where id = new.order_id;

  if new.reporter_role = 'buyer' then
    perform public.notify_business_team(
      new.business_id, 'order_issue_reported', 'Issue reported on an order',
      'A buyer reported an issue with order ' || coalesce(v_order.order_number, '') || ': ' || new.reason,
      new.order_id, 'order', jsonb_build_object('view', 'seller_order', 'businessId', new.business_id, 'orderId', new.order_id)
    );
  else
    perform public.create_notification(
      v_order.customer_id, 'order_issue_reported', 'The seller reported an issue',
      coalesce(v_order.business_name, 'The shop') || ' reported an issue with your order: ' || new.reason,
      new.order_id, 'order', jsonb_build_object('view', 'customer_order', 'orderId', new.order_id)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_issue_reported on public.order_issues;
create trigger on_order_issue_reported
after insert on public.order_issues
for each row execute procedure public.notify_order_issue_reported();
