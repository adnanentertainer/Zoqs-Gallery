-- ZOQ's Gallery — Social Engagement Reward Campaigns
--
-- Adds a MANUAL-VERIFICATION social engagement reward system. Facebook/
-- Instagram's official Graph APIs do not let a third-party app verify that a
-- specific individual liked or shared a specific post — that data was locked
-- down for privacy years ago, and Meta's Platform Terms separately prohibit
-- "like-gating" (conditioning a reward on a like/share/follow) outright. So
-- this is deliberately NOT an automatic-verification system: a customer
-- self-reports which eligible posts they engaged with, submits proof (a link
-- and/or note) once they've reached the campaign's required count, and an
-- admin reviews and approves it from the Admin Portal. No Facebook Login, no
-- Graph API calls, no scraping.
--
-- The reward itself reuses the existing promo_codes engine end to end
-- (20260921000000_promo_codes_and_banners.sql) rather than building a
-- parallel discount system: approving a submission simply inserts a row into
-- promo_codes with a few new nullable "who owns this / where did it come
-- from" columns, and create_order()/validate_promo_code() are extended
-- in-place (CREATE OR REPLACE, same signatures) to enforce that an
-- owner-scoped code can only ever be redeemed by the customer it was issued
-- to. Every existing promo code has owner_user_id = null, so none of this
-- changes behavior for a single line of existing data.
--
-- As with orders/order_items/promo_codes, nothing here is ever written
-- directly by client code except plain admin CRUD on campaigns/content
-- (gated by is_admin(), same as promo_codes) — every customer-facing
-- mutation (joining a campaign, toggling an engagement, submitting proof,
-- an admin's approve/reject decision) goes through a SECURITY DEFINER RPC
-- that recomputes and re-validates everything server-side. The frontend
-- never gets to say "I completed 20 engagements" — only the count of rows
-- actually present in social_campaign_engagements is ever trusted.

-- ============================================================================
-- social_campaigns
-- ============================================================================
create table social_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  -- Purely informational context for the admin (which Page/IG account the
  -- eligible content lives on) — never used to call any Graph API, since no
  -- automatic verification happens.
  facebook_page_id text,
  instagram_account_id text,
  engagement_type text not null check (engagement_type in ('like', 'share', 'both')),
  required_engagement_count integer not null check (required_engagement_count > 0),
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  min_order_amount integer check (min_order_amount is null or min_order_amount >= 0),
  max_discount_amount integer check (max_discount_amount is null or max_discount_amount >= 0),
  -- How many days after admin approval the generated reward code stays valid.
  coupon_validity_days integer not null default 30 check (coupon_validity_days > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  -- Total number of distinct customers who may ever complete this campaign.
  -- Null = unlimited.
  max_total_claims integer check (max_total_claims is null or max_total_claims > 0),
  max_claims_per_customer integer not null default 1 check (max_claims_per_customer > 0),
  allow_repeat_claims boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_campaigns_percentage_max_100
    check (discount_type <> 'percentage' or discount_value <= 100)
);

create index idx_social_campaigns_status on social_campaigns(status);

create trigger trg_social_campaigns_updated_at
before update on social_campaigns
for each row execute function set_updated_at();

-- ============================================================================
-- social_campaign_content — the eligible posts/videos admins select. A post
-- can be soft-removed (is_active = false) without breaking historical
-- engagement records that already reference it.
-- ============================================================================
create table social_campaign_content (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references social_campaigns(id) on delete cascade,
  platform text not null check (platform in ('facebook', 'instagram')),
  post_url text not null,
  post_id text,
  thumbnail_url text,
  caption text,
  posted_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_social_campaign_content_campaign on social_campaign_content(campaign_id, is_active);

-- ============================================================================
-- social_campaign_participations — one row per customer per attempt at a
-- campaign. cycle_number lets a repeat-claim campaign track successive
-- attempts without losing the history of earlier ones.
-- ============================================================================
create table social_campaign_participations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references social_campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_number integer not null default 1,
  status text not null default 'in_progress' check (status in (
    'in_progress', 'pending_verification', 'more_proof_requested',
    'approved', 'rejected', 'reward_issued', 'reward_used', 'expired'
  )),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, user_id, cycle_number)
);

create index idx_social_campaign_participations_campaign_user
  on social_campaign_participations(campaign_id, user_id);
create index idx_social_campaign_participations_user
  on social_campaign_participations(user_id);

create trigger trg_social_campaign_participations_updated_at
before update on social_campaign_participations
for each row execute function set_updated_at();

-- ============================================================================
-- social_campaign_engagements — the actual "customer says they engaged with
-- this post" records. The UNIQUE constraint is the anti-duplicate-counting
-- guard: the same post can never be counted twice toward the same
-- participation's progress, even if the customer double-clicks or the
-- client retries a request.
-- ============================================================================
create table social_campaign_engagements (
  id uuid primary key default gen_random_uuid(),
  participation_id uuid not null references social_campaign_participations(id) on delete cascade,
  content_id uuid not null references social_campaign_content(id) on delete cascade,
  engagement_type text not null check (engagement_type in ('like', 'share')),
  created_at timestamptz not null default now(),
  unique (participation_id, content_id, engagement_type)
);

create index idx_social_campaign_engagements_participation
  on social_campaign_engagements(participation_id);

-- ============================================================================
-- social_campaign_submissions — one row per time a customer asks for review.
-- A campaign can be reviewed more than once if an admin asks for more proof,
-- so this is an append-only log, not a single mutable field on the
-- participation. Proof is a link + free-text note only (no file upload) —
-- there is no existing customer-facing file storage bucket in this codebase,
-- and adding new storage infra is out of scope for this feature; a post URL
-- and a short description is sufficient for a human admin to check.
-- ============================================================================
create table social_campaign_submissions (
  id uuid primary key default gen_random_uuid(),
  participation_id uuid not null references social_campaign_participations(id) on delete cascade,
  proof_link text,
  proof_note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'more_proof_requested')),
  admin_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_social_campaign_submissions_participation
  on social_campaign_submissions(participation_id);
create index idx_social_campaign_submissions_status
  on social_campaign_submissions(status);

-- ============================================================================
-- promo_codes — extended with nullable "where did this code come from / who
-- does it belong to" columns. Every existing row gets source = 'manual' and
-- owner_user_id = null, so ordinary admin-created codes (no owner) are
-- completely unaffected by the ownership check added to
-- validate_promo_code()/create_order() below.
-- ============================================================================
alter table promo_codes add column source text not null default 'manual'
  check (source in ('manual', 'social_campaign'));
alter table promo_codes add column campaign_id uuid references social_campaigns(id) on delete set null;
alter table promo_codes add column owner_user_id uuid references auth.users(id) on delete set null;
alter table promo_codes add column participation_id uuid references social_campaign_participations(id) on delete set null;

-- A completed participation can only ever mint one reward code — enforced
-- here rather than trusted to application code, so even a bug or a retried
-- admin action can't double-issue a code for the same completed campaign.
create unique index idx_promo_codes_participation_unique
  on promo_codes(participation_id) where participation_id is not null;

create index idx_promo_codes_owner_user on promo_codes(owner_user_id) where owner_user_id is not null;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table social_campaigns enable row level security;
alter table social_campaign_content enable row level security;
alter table social_campaign_participations enable row level security;
alter table social_campaign_engagements enable row level security;
alter table social_campaign_submissions enable row level security;

-- Campaigns/content: signed-in customers can browse only active campaigns
-- (never drafts/paused/expired ones an admin is still preparing); admins see
-- and manage everything. Participation still requires auth.uid() inside the
-- RPCs below regardless of what's readable here.
create policy "Authenticated can read active campaigns"
  on social_campaigns for select to authenticated
  using (status = 'active');
create policy "Admins can read all campaigns"
  on social_campaigns for select to authenticated using (is_admin());
create policy "Admins can insert campaigns"
  on social_campaigns for insert to authenticated with check (is_admin());
create policy "Admins can update campaigns"
  on social_campaigns for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete campaigns"
  on social_campaigns for delete to authenticated using (is_admin());

create policy "Authenticated can read active campaign content"
  on social_campaign_content for select to authenticated
  using (
    is_active = true
    and exists (
      select 1 from social_campaigns
      where social_campaigns.id = social_campaign_content.campaign_id
        and social_campaigns.status = 'active'
    )
  );
create policy "Admins can read all campaign content"
  on social_campaign_content for select to authenticated using (is_admin());
create policy "Admins can insert campaign content"
  on social_campaign_content for insert to authenticated with check (is_admin());
create policy "Admins can update campaign content"
  on social_campaign_content for update to authenticated using (is_admin()) with check (is_admin());
create policy "Admins can delete campaign content"
  on social_campaign_content for delete to authenticated using (is_admin());

-- Participations/engagements/submissions: read-only for the owning customer
-- plus admins. No insert/update/delete policy for authenticated/anon at
-- all — every write happens exclusively inside the SECURITY DEFINER RPCs
-- below, which independently re-validate ownership on every call.
create policy "Customers can read own participations"
  on social_campaign_participations for select to authenticated
  using (user_id = auth.uid() or is_admin());

create policy "Customers can read own engagements"
  on social_campaign_engagements for select to authenticated
  using (
    is_admin()
    or exists (
      select 1 from social_campaign_participations
      where social_campaign_participations.id = social_campaign_engagements.participation_id
        and social_campaign_participations.user_id = auth.uid()
    )
  );

create policy "Customers can read own submissions"
  on social_campaign_submissions for select to authenticated
  using (
    is_admin()
    or exists (
      select 1 from social_campaign_participations
      where social_campaign_participations.id = social_campaign_submissions.participation_id
        and social_campaign_participations.user_id = auth.uid()
    )
  );

-- ============================================================================
-- social_campaign_engagement_count() — internal helper shared by the RPCs
-- below so "how many distinct eligible posts has this participation engaged
-- with" is computed identically everywhere it matters. Counts DISTINCT
-- content_id (posts), not engagement rows: liking AND sharing the same post
-- still counts once toward the campaign's required_engagement_count, since
-- the requirement is phrased as "engage with N posts", not "perform N
-- like/share actions". Not granted to authenticated/anon — only callable
-- from other SECURITY DEFINER functions owned by the same role, never
-- directly as a client RPC.
-- ============================================================================
create or replace function social_campaign_engagement_count(p_participation_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(distinct content_id)::integer
  from social_campaign_engagements
  where participation_id = p_participation_id;
$$;

revoke execute on function social_campaign_engagement_count(uuid) from public;

-- ============================================================================
-- start_campaign_participation() — join/resume a campaign. Idempotent: a
-- customer who already has a live (non-terminal) participation just gets it
-- back, never a duplicate row (the UNIQUE(campaign_id, user_id, cycle_number)
-- constraint would reject one anyway, but this avoids the round-trip error).
-- Locks the campaign row before counting total claims, so two customers
-- racing the last available slot on a max_total_claims-capped campaign
-- serialize instead of both squeezing in.
-- ============================================================================
create or replace function start_campaign_participation(p_campaign_id uuid)
returns social_campaign_participations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_campaign social_campaigns%rowtype;
  v_existing social_campaign_participations%rowtype;
  v_completed_count integer;
  v_campaign_completed_count integer;
  v_next_cycle integer;
  v_result social_campaign_participations%rowtype;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to join this campaign.' using errcode = '28000';
  end if;

  select * into v_campaign from social_campaigns where id = p_campaign_id for update;
  if not found or v_campaign.status <> 'active' then
    raise exception 'This campaign is not currently active.' using errcode = 'P0001';
  end if;
  if v_campaign.starts_at is not null and v_campaign.starts_at > now() then
    raise exception 'This campaign has not started yet.' using errcode = 'P0001';
  end if;
  if v_campaign.ends_at is not null and v_campaign.ends_at < now() then
    raise exception 'This campaign has ended.' using errcode = 'P0001';
  end if;

  select * into v_existing from social_campaign_participations
    where campaign_id = p_campaign_id and user_id = v_user_id
      and status in ('in_progress', 'pending_verification', 'more_proof_requested', 'approved')
    order by cycle_number desc
    limit 1;
  if found then
    return v_existing;
  end if;

  select count(*) into v_completed_count from social_campaign_participations
    where campaign_id = p_campaign_id and user_id = v_user_id
      and status in ('reward_issued', 'reward_used');

  if v_completed_count > 0 then
    if not v_campaign.allow_repeat_claims then
      raise exception 'You have already claimed the reward for this campaign.' using errcode = 'P0001';
    end if;
    if v_campaign.max_claims_per_customer is not null
      and v_completed_count >= v_campaign.max_claims_per_customer
    then
      raise exception 'You have reached the maximum number of claims for this campaign.' using errcode = 'P0001';
    end if;
  end if;

  if v_campaign.max_total_claims is not null then
    select count(distinct user_id) into v_campaign_completed_count
      from social_campaign_participations
      where campaign_id = p_campaign_id and status in ('reward_issued', 'reward_used');
    if v_campaign_completed_count >= v_campaign.max_total_claims then
      raise exception 'This campaign has reached its maximum number of participants.' using errcode = 'P0001';
    end if;
  end if;

  select coalesce(max(cycle_number), 0) + 1 into v_next_cycle
    from social_campaign_participations
    where campaign_id = p_campaign_id and user_id = v_user_id;

  insert into social_campaign_participations (campaign_id, user_id, cycle_number, status)
  values (p_campaign_id, v_user_id, v_next_cycle, 'in_progress')
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function start_campaign_participation(uuid) to authenticated;
revoke execute on function start_campaign_participation(uuid) from public;

-- ============================================================================
-- toggle_campaign_engagement() — mark/unmark one post as engaged-with for
-- the caller's own in-progress participation. Every input is re-validated
-- server-side: ownership, editability (locked once submitted for review),
-- the campaign's allowed engagement type(s), and that the post actually
-- belongs to this campaign and is still active.
--
-- Reaching the campaign's required_engagement_count on a p_mark_done = true
-- call auto-submits the participation for admin review right here (no
-- separate customer-typed proof step for the common path) — the checklist
-- itself, re-read from social_campaign_engagements below, is the evidence
-- the admin reviews. submit_campaign_proof() still exists for the one case
-- where a customer supplies additional evidence: after an admin explicitly
-- requests it (status 'more_proof_requested').
-- ============================================================================
create or replace function toggle_campaign_engagement(
  p_participation_id uuid,
  p_content_id uuid,
  p_engagement_type text,
  p_mark_done boolean
)
returns social_campaign_participations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_participation social_campaign_participations%rowtype;
  v_campaign social_campaigns%rowtype;
  v_content_ok boolean;
  v_engagement_count integer;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to do this.' using errcode = '28000';
  end if;

  select * into v_participation from social_campaign_participations
    where id = p_participation_id;
  if not found or v_participation.user_id <> v_user_id then
    raise exception 'You do not have access to this campaign entry.' using errcode = '42501';
  end if;
  if v_participation.status <> 'in_progress' then
    raise exception 'This campaign entry can no longer be edited.' using errcode = 'P0001';
  end if;

  select * into v_campaign from social_campaigns where id = v_participation.campaign_id;

  if p_engagement_type not in ('like', 'share') then
    raise exception 'Invalid engagement type.' using errcode = '22023';
  end if;
  if v_campaign.engagement_type <> 'both' and v_campaign.engagement_type <> p_engagement_type then
    raise exception 'This campaign does not accept that type of engagement.' using errcode = '22023';
  end if;

  select exists(
    select 1 from social_campaign_content
    where id = p_content_id and campaign_id = v_participation.campaign_id and is_active = true
  ) into v_content_ok;
  if not v_content_ok then
    raise exception 'This post is not part of this campaign.' using errcode = 'P0001';
  end if;

  if p_mark_done then
    insert into social_campaign_engagements (participation_id, content_id, engagement_type)
    values (p_participation_id, p_content_id, p_engagement_type)
    on conflict (participation_id, content_id, engagement_type) do nothing;

    v_engagement_count := social_campaign_engagement_count(p_participation_id);
    if v_engagement_count >= v_campaign.required_engagement_count then
      insert into social_campaign_submissions (participation_id, proof_link, proof_note, status)
      values (p_participation_id, null, null, 'pending');

      update social_campaign_participations
        set status = 'pending_verification', submitted_at = now()
        where id = p_participation_id;
    end if;
  else
    delete from social_campaign_engagements
      where participation_id = p_participation_id
        and content_id = p_content_id
        and engagement_type = p_engagement_type;
  end if;

  select * into v_participation from social_campaign_participations where id = p_participation_id;
  return v_participation;
end;
$$;

grant execute on function toggle_campaign_engagement(uuid, uuid, text, boolean) to authenticated;
revoke execute on function toggle_campaign_engagement(uuid, uuid, text, boolean) from public;

-- ============================================================================
-- submit_campaign_proof() — the FOLLOW-UP proof path only: a customer whose
-- entry an admin flagged 'more_proof_requested' uses this to supply the
-- specific evidence the admin asked for. The initial submission (reaching
-- required_engagement_count) is created automatically by
-- toggle_campaign_engagement() above, with no customer-typed proof — this
-- function no longer accepts that initial 'in_progress' case, and (unlike
-- the automatic path) always requires actual proof text, since it exists
-- specifically to answer a named admin request for more evidence.
-- ============================================================================
create or replace function submit_campaign_proof(
  p_participation_id uuid,
  p_proof_link text,
  p_proof_note text
)
returns social_campaign_submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_participation social_campaign_participations%rowtype;
  v_campaign social_campaigns%rowtype;
  v_engagement_count integer;
  v_result social_campaign_submissions%rowtype;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to do this.' using errcode = '28000';
  end if;

  select * into v_participation from social_campaign_participations
    where id = p_participation_id for update;
  if not found or v_participation.user_id <> v_user_id then
    raise exception 'You do not have access to this campaign entry.' using errcode = '42501';
  end if;
  if v_participation.status <> 'more_proof_requested' then
    raise exception 'This campaign entry is not awaiting additional proof.' using errcode = 'P0001';
  end if;

  select * into v_campaign from social_campaigns where id = v_participation.campaign_id;

  v_engagement_count := social_campaign_engagement_count(p_participation_id);
  if v_engagement_count < v_campaign.required_engagement_count then
    raise exception 'You have not yet completed the required number of engagements.' using errcode = 'P0001';
  end if;

  if coalesce(trim(p_proof_link), '') = '' and coalesce(trim(p_proof_note), '') = '' then
    raise exception 'Please share a post link or a short note with the additional proof requested.' using errcode = '22023';
  end if;

  insert into social_campaign_submissions (participation_id, proof_link, proof_note, status)
  values (p_participation_id, nullif(trim(p_proof_link), ''), nullif(trim(p_proof_note), ''), 'pending')
  returning * into v_result;

  update social_campaign_participations
    set status = 'pending_verification', submitted_at = now()
    where id = p_participation_id;

  return v_result;
end;
$$;

grant execute on function submit_campaign_proof(uuid, text, text) to authenticated;
revoke execute on function submit_campaign_proof(uuid, text, text) from public;

-- ============================================================================
-- admin_review_campaign_submission() — the only place a social-campaign
-- reward code is ever minted. Approving re-verifies the engagement count
-- (defense in depth against a stale/racing submission) and the campaign-wide
-- claim cap (row-locked) before generating a unique 'ZOQS-XXXXXX' code and
-- inserting it into the existing promo_codes table with usage_limit = 1,
-- usage_limit_per_customer = 1, and owner_user_id/participation_id set so
-- create_order()/validate_promo_code() below will only ever let this
-- specific customer redeem it, exactly once.
-- ============================================================================
create or replace function admin_review_campaign_submission(
  p_submission_id uuid,
  p_decision text,
  p_admin_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_submission social_campaign_submissions%rowtype;
  v_participation social_campaign_participations%rowtype;
  v_campaign social_campaigns%rowtype;
  v_engagement_count integer;
  v_completed_count integer;
  v_code text;
  v_promo_id uuid;
  v_expires_at timestamptz;
  v_attempt integer := 0;
begin
  if not is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;
  if p_decision not in ('approve', 'reject', 'request_more_proof') then
    raise exception 'Invalid decision.' using errcode = '22023';
  end if;

  select * into v_submission from social_campaign_submissions
    where id = p_submission_id for update;
  if not found then
    raise exception 'Submission not found.' using errcode = 'P0001';
  end if;

  select * into v_participation from social_campaign_participations
    where id = v_submission.participation_id for update;

  if p_decision = 'reject' then
    update social_campaign_submissions
      set status = 'rejected', admin_notes = p_admin_notes, reviewed_by = v_admin_id, reviewed_at = now()
      where id = p_submission_id;
    update social_campaign_participations
      set status = 'rejected', reviewed_by = v_admin_id, reviewed_at = now()
      where id = v_participation.id;
    return jsonb_build_object('decision', 'rejected');
  end if;

  if p_decision = 'request_more_proof' then
    update social_campaign_submissions
      set status = 'more_proof_requested', admin_notes = p_admin_notes, reviewed_by = v_admin_id, reviewed_at = now()
      where id = p_submission_id;
    update social_campaign_participations
      set status = 'more_proof_requested', reviewed_by = v_admin_id, reviewed_at = now()
      where id = v_participation.id;
    return jsonb_build_object('decision', 'more_proof_requested');
  end if;

  -- p_decision = 'approve'
  select * into v_campaign from social_campaigns where id = v_participation.campaign_id for update;

  v_engagement_count := social_campaign_engagement_count(v_participation.id);
  if v_engagement_count < v_campaign.required_engagement_count then
    raise exception 'This customer no longer meets the engagement requirement.' using errcode = 'P0001';
  end if;

  if v_campaign.max_total_claims is not null then
    select count(distinct user_id) into v_completed_count from social_campaign_participations
      where campaign_id = v_campaign.id
        and status in ('reward_issued', 'reward_used')
        and id <> v_participation.id;
    if v_completed_count >= v_campaign.max_total_claims then
      raise exception 'This campaign has reached its maximum number of participants.' using errcode = 'P0001';
    end if;
  end if;

  loop
    v_code := 'ZOQS-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from promo_codes where code = v_code);
    v_attempt := v_attempt + 1;
    if v_attempt > 20 then
      raise exception 'Could not generate a unique reward code. Please try again.' using errcode = 'P0001';
    end if;
  end loop;

  v_expires_at := now() + (v_campaign.coupon_validity_days || ' days')::interval;

  insert into promo_codes (
    code, discount_type, discount_value, min_order_amount, max_discount_amount,
    expires_at, usage_limit, usage_limit_per_customer, is_active, description,
    source, campaign_id, owner_user_id, participation_id
  ) values (
    v_code, v_campaign.discount_type, v_campaign.discount_value, v_campaign.min_order_amount,
    v_campaign.max_discount_amount, v_expires_at, 1, 1, true,
    'Social engagement reward: ' || v_campaign.name,
    'social_campaign', v_campaign.id, v_participation.user_id, v_participation.id
  )
  returning id into v_promo_id;

  update social_campaign_submissions
    set status = 'approved', admin_notes = p_admin_notes, reviewed_by = v_admin_id, reviewed_at = now()
    where id = p_submission_id;

  update social_campaign_participations
    set status = 'reward_issued', reviewed_by = v_admin_id, reviewed_at = now()
    where id = v_participation.id;

  return jsonb_build_object(
    'decision', 'approved',
    'promo_code_id', v_promo_id,
    'code', v_code,
    'discount_type', v_campaign.discount_type,
    'discount_value', v_campaign.discount_value,
    'expires_at', v_expires_at
  );
end;
$$;

grant execute on function admin_review_campaign_submission(uuid, text, text) to authenticated;
revoke execute on function admin_review_campaign_submission(uuid, text, text) from public;

-- ============================================================================
-- validate_promo_code() — CREATE OR REPLACE with the exact same signature and
-- every existing check preserved byte-for-byte (reproduced from
-- 20260921000000_promo_codes_and_banners.sql), plus one addition: a code
-- with owner_user_id set can only validate as usable for that exact
-- customer. Ordinary admin-created codes have owner_user_id = null and are
-- completely unaffected.
-- ============================================================================
create or replace function validate_promo_code(
  p_code text,
  p_subtotal integer,
  p_email text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_promo_id uuid;
  v_promo_code text;
  v_promo_discount_type text;
  v_promo_discount_value integer;
  v_promo_min_order_amount integer;
  v_promo_max_discount_amount integer;
  v_promo_starts_at timestamptz;
  v_promo_expires_at timestamptz;
  v_promo_usage_limit integer;
  v_promo_usage_limit_per_customer integer;
  v_promo_usage_count integer;
  v_promo_is_active boolean;
  v_promo_owner_user_id uuid;
  v_discount_amount integer;
  v_per_customer_count integer;
begin
  if p_subtotal is null or p_subtotal < 0 then
    return jsonb_build_object('valid', false, 'error', 'Your cart is empty.');
  end if;

  select id, code, discount_type, discount_value, min_order_amount,
         max_discount_amount, starts_at, expires_at, usage_limit,
         usage_limit_per_customer, usage_count, is_active, owner_user_id
    into v_promo_id, v_promo_code, v_promo_discount_type, v_promo_discount_value,
         v_promo_min_order_amount, v_promo_max_discount_amount, v_promo_starts_at,
         v_promo_expires_at, v_promo_usage_limit, v_promo_usage_limit_per_customer,
         v_promo_usage_count, v_promo_is_active, v_promo_owner_user_id
    from promo_codes where code = upper(trim(coalesce(p_code, '')));

  if not found or v_promo_is_active is not true then
    return jsonb_build_object('valid', false, 'error', 'Invalid or expired promo code.');
  end if;

  -- A social-campaign reward code belongs to exactly one customer — anyone
  -- else (including a guest) sees the same generic error a nonexistent code
  -- would, so this never reveals that the code exists.
  if v_promo_owner_user_id is not null
    and (v_user_id is null or v_user_id <> v_promo_owner_user_id)
  then
    return jsonb_build_object('valid', false, 'error', 'Invalid or expired promo code.');
  end if;

  if v_promo_starts_at is not null and v_promo_starts_at > now() then
    return jsonb_build_object('valid', false, 'error', 'This promo code is not active yet.');
  end if;

  if v_promo_expires_at is not null and v_promo_expires_at < now() then
    return jsonb_build_object('valid', false, 'error', 'Invalid or expired promo code.');
  end if;

  if v_promo_usage_limit is not null and v_promo_usage_count >= v_promo_usage_limit then
    return jsonb_build_object('valid', false, 'error', 'This promo code has reached its usage limit.');
  end if;

  if v_promo_min_order_amount is not null and p_subtotal < v_promo_min_order_amount then
    return jsonb_build_object(
      'valid', false,
      'error', format('Minimum order of Rs. %s is required for this promo code.', v_promo_min_order_amount)
    );
  end if;

  if v_promo_usage_limit_per_customer is not null
    and coalesce(trim(p_email), '') <> ''
  then
    select count(*) into v_per_customer_count from promo_code_usages
      where promo_code_id = v_promo_id
        and (
          (v_user_id is not null and user_id = v_user_id)
          or (v_user_id is null and lower(customer_email) = lower(trim(p_email)))
        );
    if v_per_customer_count >= v_promo_usage_limit_per_customer then
      return jsonb_build_object(
        'valid', false,
        'error', 'You have already used this promo code the maximum number of times.'
      );
    end if;
  end if;

  if v_promo_discount_type = 'percentage' then
    v_discount_amount := floor(p_subtotal * v_promo_discount_value / 100.0)::integer;
    if v_promo_max_discount_amount is not null then
      v_discount_amount := least(v_discount_amount, v_promo_max_discount_amount);
    end if;
  else
    v_discount_amount := v_promo_discount_value;
  end if;
  v_discount_amount := least(v_discount_amount, p_subtotal);

  return jsonb_build_object(
    'valid', true,
    'code', v_promo_code,
    'discount_type', v_promo_discount_type,
    'discount_value', v_promo_discount_value,
    'discount_amount', v_discount_amount
  );
end;
$$;

grant execute on function validate_promo_code(text, integer, text) to authenticated, anon;
revoke execute on function validate_promo_code(text, integer, text) from public;

-- ============================================================================
-- create_order() — CREATE OR REPLACE, reproducing the current version from
-- 20260925230000_free_shipping_after_discount.sql (the latest prior
-- modification, which compares the free-shipping threshold against the
-- post-discount subtotal) byte-for-byte, plus two additions inside the
-- existing promo-code block: (1) the same owner_user_id/auth.uid() ownership
-- check added to validate_promo_code() above, so a social-campaign reward
-- code can never be redeemed by anyone but its owner even if they somehow
-- got past the checkout "Apply" preview; (2) after a successful commit,
-- marking the originating participation as 'reward_used' so the customer's
-- dashboard reflects that their reward has now actually been spent. Every
-- other line — stock handling, order numbering, notifications wiring — is
-- completely unchanged.
-- ============================================================================
create or replace function create_order(
  p_items jsonb,
  p_payment_method text,
  p_shipping jsonb,
  p_customer_notes text default null,
  p_promo_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_guest_token uuid;
  v_item jsonb;
  v_quantity integer;
  v_product_id uuid;
  v_product_name text;
  v_product_price integer;
  v_product_stock integer;
  v_product_is_active boolean;
  v_product_image_url text;
  v_product_sku text;
  v_selected_variants jsonb;
  v_variant_key text;
  v_variant_value text;
  v_variant_id uuid;
  v_variant_name text;
  v_variant_price_adjustment integer;
  v_variant_stock integer;
  v_variant_is_active boolean;
  v_variant_sku text;
  v_unit_price integer;
  v_line_total integer;
  v_subtotal integer := 0;
  v_shipping_cost integer;
  v_total integer;
  v_free_shipping_threshold integer;
  v_flat_shipping_cost integer;
  v_order_id uuid;
  v_order_number text;
  v_attempt integer := 0;
  v_order_items jsonb := '[]'::jsonb;
  v_movement_new_stock integer;
  v_customer_email text;
  v_promo_code_normalized text;
  v_promo_id uuid;
  v_promo_code text;
  v_promo_discount_type text;
  v_promo_discount_value integer;
  v_promo_min_order_amount integer;
  v_promo_max_discount_amount integer;
  v_promo_starts_at timestamptz;
  v_promo_expires_at timestamptz;
  v_promo_usage_limit integer;
  v_promo_usage_limit_per_customer integer;
  v_promo_usage_count integer;
  v_promo_is_active boolean;
  v_promo_owner_user_id uuid;
  v_promo_participation_id uuid;
  v_discount_amount integer := 0;
  v_per_customer_count integer;
begin
  if v_user_id is null then
    v_guest_token := gen_random_uuid();
  end if;

  if p_payment_method not in ('cod', 'bank_transfer', 'easypaisa', 'jazzcash') then
    raise exception 'Invalid payment method.' using errcode = '22023';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty.' using errcode = '22023';
  end if;

  if coalesce(trim(p_shipping->>'full_name'), '') = ''
    or coalesce(trim(p_shipping->>'email'), '') = ''
    or coalesce(trim(p_shipping->>'phone'), '') = ''
    or coalesce(trim(p_shipping->>'address_line_1'), '') = ''
    or coalesce(trim(p_shipping->>'city'), '') = ''
    or coalesce(trim(p_shipping->>'province'), '') = ''
  then
    raise exception 'Shipping information is incomplete.' using errcode = '22023';
  end if;

  if length(coalesce(p_customer_notes, '')) > 500 then
    raise exception 'Customer notes are too long.' using errcode = '22023';
  end if;

  v_customer_email := trim(p_shipping->>'email');

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'Invalid quantity.' using errcode = '22023';
    end if;

    select p.id, p.name, p.price, p.stock, p.is_active, p.sku,
           (select pi.image_url from product_images pi
             where pi.product_id = p.id
             order by pi.display_order limit 1)
      into v_product_id, v_product_name, v_product_price, v_product_stock,
           v_product_is_active, v_product_sku, v_product_image_url
      from products p
      where p.slug = v_item->>'product_slug';

    if not found or v_product_is_active is not true then
      raise exception 'One or more products in your cart are no longer available.'
        using errcode = 'P0001';
    end if;

    v_unit_price := v_product_price;
    v_variant_id := null;
    v_variant_name := null;
    v_variant_sku := null;
    v_variant_stock := null;
    v_selected_variants := v_item->'selected_variants';

    if v_selected_variants is not null and jsonb_typeof(v_selected_variants) = 'object' then
      for v_variant_key, v_variant_value in select * from jsonb_each_text(v_selected_variants)
      loop
        select pv.id, pv.option_value, pv.price_adjustment, pv.stock, pv.is_active, pv.sku
          into v_variant_id, v_variant_name, v_variant_price_adjustment,
               v_variant_stock, v_variant_is_active, v_variant_sku
          from product_variants pv
          where pv.product_id = v_product_id
            and pv.option_type = v_variant_key
            and pv.option_value = v_variant_value;

        if not found or v_variant_is_active is not true then
          raise exception 'A selected product option is no longer available.'
            using errcode = 'P0001';
        end if;

        if v_variant_price_adjustment is not null then
          v_unit_price := v_product_price + v_variant_price_adjustment;
        end if;

        if v_variant_stock is not null and v_variant_stock < v_quantity then
          raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
        end if;
      end loop;
    end if;

    if (v_variant_id is null or v_variant_stock is null) and v_product_stock < v_quantity then
      raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
    end if;

    v_line_total := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    if v_variant_id is not null and v_variant_stock is not null then
      update product_variants set stock = stock - v_quantity
        where id = v_variant_id and stock >= v_quantity
        returning stock into v_movement_new_stock;
      if not found then
        raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
      end if;
    else
      update products set stock = stock - v_quantity
        where id = v_product_id and stock >= v_quantity
        returning stock into v_movement_new_stock;
      if not found then
        raise exception 'Insufficient stock for %.', v_product_name using errcode = 'P0001';
      end if;
    end if;

    v_order_items := v_order_items || jsonb_build_object(
      'product_id', v_product_id,
      'variant_id', v_variant_id,
      'product_name', v_product_name,
      'variant_name', v_variant_name,
      'product_price', v_unit_price,
      'quantity', v_quantity,
      'line_total', v_line_total,
      'product_image_url', v_product_image_url,
      'sku', coalesce(v_variant_sku, v_product_sku),
      'new_stock', v_movement_new_stock
    );
  end loop;

  -- ==========================================================================
  -- Promo code redemption — runs only if a code was supplied. `for update`
  -- locks the promo_codes row for the rest of this transaction, so two
  -- concurrent orders racing against the same near-exhausted usage_limit
  -- serialize here instead of both reading a stale usage_count.
  -- ==========================================================================
  if coalesce(trim(p_promo_code), '') <> '' then
    v_promo_code_normalized := upper(trim(p_promo_code));

    select id, code, discount_type, discount_value, min_order_amount,
           max_discount_amount, starts_at, expires_at, usage_limit,
           usage_limit_per_customer, usage_count, is_active, owner_user_id, participation_id
      into v_promo_id, v_promo_code, v_promo_discount_type, v_promo_discount_value,
           v_promo_min_order_amount, v_promo_max_discount_amount, v_promo_starts_at,
           v_promo_expires_at, v_promo_usage_limit, v_promo_usage_limit_per_customer,
           v_promo_usage_count, v_promo_is_active, v_promo_owner_user_id, v_promo_participation_id
      from promo_codes
      where code = v_promo_code_normalized
      for update;

    if not found or v_promo_is_active is not true then
      raise exception 'Invalid or expired promo code.' using errcode = 'P0001';
    end if;

    -- A social-campaign reward code can only ever be redeemed by the
    -- customer it was issued to (see validate_promo_code() for the matching
    -- preview-time check). Ordinary codes have owner_user_id = null and are
    -- unaffected.
    if v_promo_owner_user_id is not null
      and (v_user_id is null or v_user_id <> v_promo_owner_user_id)
    then
      raise exception 'Invalid or expired promo code.' using errcode = 'P0001';
    end if;

    if v_promo_starts_at is not null and v_promo_starts_at > now() then
      raise exception 'This promo code is not active yet.' using errcode = 'P0001';
    end if;

    if v_promo_expires_at is not null and v_promo_expires_at < now() then
      raise exception 'Invalid or expired promo code.' using errcode = 'P0001';
    end if;

    if v_promo_usage_limit is not null and v_promo_usage_count >= v_promo_usage_limit then
      raise exception 'This promo code has reached its usage limit.' using errcode = 'P0001';
    end if;

    if v_promo_min_order_amount is not null and v_subtotal < v_promo_min_order_amount then
      raise exception 'Minimum order of Rs. % is required for this promo code.',
        v_promo_min_order_amount using errcode = 'P0001';
    end if;

    if v_promo_usage_limit_per_customer is not null then
      select count(*) into v_per_customer_count from promo_code_usages
        where promo_code_id = v_promo_id
          and (
            (v_user_id is not null and user_id = v_user_id)
            or (v_user_id is null and lower(customer_email) = lower(v_customer_email))
          );
      if v_per_customer_count >= v_promo_usage_limit_per_customer then
        raise exception 'You have already used this promo code the maximum number of times.'
          using errcode = 'P0001';
      end if;
    end if;

    if v_promo_discount_type = 'percentage' then
      v_discount_amount := floor(v_subtotal * v_promo_discount_value / 100.0)::integer;
      if v_promo_max_discount_amount is not null then
        v_discount_amount := least(v_discount_amount, v_promo_max_discount_amount);
      end if;
    else
      v_discount_amount := v_promo_discount_value;
    end if;

    -- Never let a discount exceed the order it's applied to — the hard
    -- backstop against a negative total, on top of the DB check constraint.
    v_discount_amount := least(v_discount_amount, v_subtotal);
  end if;

  select (value #>> '{}')::integer into v_free_shipping_threshold
    from site_settings where key = 'free_shipping_threshold';
  select (value #>> '{}')::integer into v_flat_shipping_cost
    from site_settings where key = 'flat_shipping_cost';
  v_free_shipping_threshold := coalesce(v_free_shipping_threshold, 3000);
  v_flat_shipping_cost := coalesce(v_flat_shipping_cost, 250);

  -- Compared against the post-discount amount, not the raw subtotal — see
  -- 20260925230000_free_shipping_after_discount.sql.
  v_shipping_cost := case
    when (v_subtotal - v_discount_amount) >= v_free_shipping_threshold then 0
    else v_flat_shipping_cost
  end;
  v_total := v_subtotal - v_discount_amount + v_shipping_cost;

  loop
    v_order_number := 'ZOQ-' || to_char(now(), 'YYYYMMDD') || '-'
      || lpad(floor(random() * 10000)::text, 4, '0');
    exit when not exists (select 1 from orders where order_number = v_order_number);
    v_attempt := v_attempt + 1;
    if v_attempt > 20 then
      raise exception 'Could not generate a unique order number. Please try again.'
        using errcode = 'P0001';
    end if;
  end loop;

  insert into orders (
    order_number, user_id, guest_token, payment_method, subtotal, shipping_cost, total,
    shipping_full_name, shipping_email, shipping_phone,
    shipping_address_line_1, shipping_address_line_2, shipping_city,
    shipping_province, shipping_postal_code, shipping_country, customer_notes,
    promo_code, promo_code_id, discount_type, discount_value, discount_amount
  ) values (
    v_order_number, v_user_id, v_guest_token, p_payment_method, v_subtotal, v_shipping_cost, v_total,
    trim(p_shipping->>'full_name'), trim(p_shipping->>'email'), trim(p_shipping->>'phone'),
    trim(p_shipping->>'address_line_1'),
    nullif(trim(coalesce(p_shipping->>'address_line_2', '')), ''),
    trim(p_shipping->>'city'), trim(p_shipping->>'province'),
    nullif(trim(coalesce(p_shipping->>'postal_code', '')), ''),
    coalesce(nullif(trim(coalesce(p_shipping->>'country', '')), ''), 'Pakistan'),
    nullif(trim(coalesce(p_customer_notes, '')), ''),
    v_promo_code, v_promo_id, v_promo_discount_type, v_promo_discount_value, v_discount_amount
  )
  returning id into v_order_id;

  insert into order_items (
    order_id, product_id, variant_id, product_name, variant_name,
    product_price, quantity, line_total, product_image_url
  )
  select
    v_order_id,
    (item->>'product_id')::uuid,
    (item->>'variant_id')::uuid,
    item->>'product_name',
    item->>'variant_name',
    (item->>'product_price')::integer,
    (item->>'quantity')::integer,
    (item->>'line_total')::integer,
    item->>'product_image_url'
  from jsonb_array_elements(v_order_items) as item;

  insert into inventory_movements (
    product_id, variant_id, sku, movement_type, quantity_change,
    previous_quantity, new_quantity, reason, reference_number, created_by
  )
  select
    (item->>'product_id')::uuid,
    (item->>'variant_id')::uuid,
    item->>'sku',
    'sale',
    -(item->>'quantity')::integer,
    (item->>'new_stock')::integer + (item->>'quantity')::integer,
    (item->>'new_stock')::integer,
    'Customer order',
    v_order_number,
    null
  from jsonb_array_elements(v_order_items) as item;

  -- Usage is only ever counted for an order that actually committed — this
  -- runs after both inserts above succeed, never on a mere validation pass
  -- (see validate_promo_code() above, which never writes anything).
  if v_promo_id is not null then
    update promo_codes set usage_count = usage_count + 1 where id = v_promo_id;

    insert into promo_code_usages (
      promo_code_id, order_id, user_id, customer_email, discount_amount
    ) values (
      v_promo_id, v_order_id, v_user_id, v_customer_email, v_discount_amount
    );

    -- If this code was a social-campaign reward, its originating
    -- participation is now fully spent — reflected on the customer's
    -- rewards dashboard.
    if v_promo_participation_id is not null then
      update social_campaign_participations
        set status = 'reward_used'
        where id = v_promo_participation_id;
    end if;
  end if;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_cost', v_shipping_cost,
    'discount_amount', v_discount_amount,
    'promo_code', v_promo_code,
    'total', v_total,
    'guest_token', v_guest_token
  );
end;
$$;

grant execute on function create_order(jsonb, text, jsonb, text, text) to authenticated, anon;
revoke execute on function create_order(jsonb, text, jsonb, text, text) from public;
