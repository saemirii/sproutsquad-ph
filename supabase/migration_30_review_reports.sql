-- "Report a review" — closes an App Store Guideline 1.2 (User-Generated
-- Content) gap: business_reviews lets any buyer post free text + photos
-- publicly, with no way for anyone to report it and no way for an admin to
-- remove it. This adds a report queue (mirrors order_issues in
-- migration_27) plus a real removal action (mirrors moderate_sproutup_
-- nomination in migration_23), so objectionable reviews can actually be
-- taken down, not just flagged forever.
--
-- The reported review's content is snapshotted onto the report row at
-- report time (review_customer_name/review_stars/review_comment/
-- business_name below) rather than joined live from business_reviews —
-- report_review() (not the client) fills these in from the real row, so a
-- reporter can't fabricate what a review said, and the admin queue (plus
-- any later audit) can still show what was reported even after a
-- "removed" decision deletes the live review. This is also why order_id
-- references orders(id), not business_reviews(order_id): a report is
-- meant to outlive the review it's about.

create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  message text,
  business_name text not null default '',
  review_customer_name text not null default '',
  review_stars smallint,
  review_comment text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  moderator_id uuid references auth.users(id),
  moderator_decision text check (moderator_decision in ('dismissed', 'removed')),
  moderator_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists review_reports_order_id_idx on public.review_reports (order_id);
create index if not exists review_reports_status_idx on public.review_reports (status) where status = 'open';

alter table public.review_reports enable row level security;

-- Same "seller or team member" exists-check migration_4/migration_27 use.
drop policy if exists "Reporters, reviewed business, and admins can view review reports" on public.review_reports;
create policy "Reporters, reviewed business, and admins can view review reports"
  on public.review_reports for select using (
    auth.uid() = reporter_id
    or exists (
      select 1 from public.businesses
      where businesses.id = review_reports.business_id
      and (
        businesses.seller_id = auth.uid()
        or exists (select 1 from public.business_members where business_members.business_id = businesses.id and business_members.user_id = auth.uid())
      )
    )
    or public.is_admin()
  );

-- No insert/update policy — every write goes through report_review() /
-- moderate_review_report() below (both security definer), same posture as
-- business_reviews/sproutup_nominations.

create or replace function public.report_review(p_order_id text, p_reason text, p_message text default null)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_review record;
  v_business_name text;
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  if trim(coalesce(p_reason, '')) = '' then
    raise exception 'Please choose a reason';
  end if;

  select * into v_review from public.business_reviews where order_id = p_order_id;
  if not found then
    raise exception 'Review not found';
  end if;

  if exists (
    select 1 from public.review_reports
    where order_id = p_order_id and reporter_id = v_user_id and status = 'open'
  ) then
    raise exception 'You already reported this review';
  end if;

  select name into v_business_name from public.businesses where id = v_review.business_id;

  insert into public.review_reports (
    order_id, business_id, reporter_id, reason, message,
    business_name, review_customer_name, review_stars, review_comment
  ) values (
    p_order_id, v_review.business_id, v_user_id, trim(p_reason), nullif(trim(p_message), ''),
    coalesce(v_business_name, ''), v_review.customer_name, v_review.stars, v_review.comment
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.moderate_review_report(p_id uuid, p_decision text, p_note text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_report record;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can moderate review reports';
  end if;
  if p_decision not in ('dismissed', 'removed') then
    raise exception 'Invalid decision';
  end if;

  select * into v_report from public.review_reports where id = p_id and status = 'open';
  if not found then
    raise exception 'Report not found or already resolved';
  end if;

  if p_decision = 'removed' then
    delete from public.business_reviews where order_id = v_report.order_id;

    update public.businesses b
    set review_count = (select count(*) from public.business_reviews where business_id = b.id),
        rating = (select coalesce(round(avg(stars)::numeric, 1), 0) from public.business_reviews where business_id = b.id)
    where b.id = v_report.business_id;

    -- Removing the review resolves every open report against it, not
    -- just the one being acted on — they'd otherwise linger in the queue
    -- pointing at content that no longer exists.
    update public.review_reports
    set status = 'resolved', moderator_id = auth.uid(), moderator_decision = 'removed', moderator_note = p_note, updated_at = now()
    where order_id = v_report.order_id and status = 'open';
  else
    update public.review_reports
    set status = 'resolved', moderator_id = auth.uid(), moderator_decision = 'dismissed', moderator_note = p_note, updated_at = now()
    where id = p_id;
  end if;
end;
$$;
