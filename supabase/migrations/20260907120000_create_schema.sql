-- Legal Operations Intake — initial schema (issue #2)
-- Tables: lawyers, requests, status_transitions
-- Apply this file's statements, in order, in the Supabase SQL Editor.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on every row update.
-- ---------------------------------------------------------------------------

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- lawyers
-- The four in-house lawyers. Name and email here belong to Corvina employees
-- acting in a professional capacity, not to data subjects of the requests
-- they handle, so they are permitted under the data-minimisation rule.
-- ---------------------------------------------------------------------------

create table lawyers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lawyers_set_updated_at
  before update on lawyers
  for each row
  execute function set_updated_at();

alter table lawyers enable row level security;

create policy "lawyers_select_authenticated"
  on lawyers for select
  to authenticated
  using (true);

-- No client-facing insert/update/delete policy: lawyer records are managed
-- directly by an admin via the Supabase SQL Editor / service role.

-- ---------------------------------------------------------------------------
-- requests
-- One row per intake submission.
-- ---------------------------------------------------------------------------

create table requests (
  id uuid primary key default gen_random_uuid(),

  request_type text not null check (request_type in (
    'pontual_query',
    'nda',
    'renewal_no_changes',
    'new_contract_corvina_paper',
    'third_party_draft_review'
  )),

  requesting_department text not null,

  -- A company, never an individual.
  counterparty_name text,

  estimated_value_band text check (estimated_value_band in (
    'under_10k',
    '10k_50k',
    '50k_250k',
    '250k_1m',
    'over_1m'
  )),

  desired_date date not null,

  justification text,

  description text,

  assigned_lawyer_id uuid references lawyers(id) on delete set null,

  status text not null default 'new' check (status in (
    'new',
    'in_progress',
    'on_hold',
    'completed',
    'cancelled'
  )),

  -- Data-processing questions: booleans describing the operation the request
  -- concerns, never the personal data itself.
  involves_customer_data boolean not null default false,
  involves_employee_data boolean not null default false,
  involves_third_party_data boolean not null default false,
  involves_international_transfer boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column requests.justification is
  'Required by application logic (not enforced here) when desired_date falls '
  'short of the SLA for request_type. SLA thresholds are defined once in '
  'src/config/sla.ts.';

comment on column requests.description is
  'Free text. Must not contain personal data (names, documents, contact '
  'details, or any other personal data of data subjects). The application '
  'warns the user of this before submission.';

create trigger requests_set_updated_at
  before update on requests
  for each row
  execute function set_updated_at();

alter table requests enable row level security;

create policy "requests_select_authenticated"
  on requests for select
  to authenticated
  using (true);

create policy "requests_insert_authenticated"
  on requests for insert
  to authenticated
  with check (true);

-- A request may be updated by the lawyer it is assigned to, or by any active
-- lawyer when it is unassigned (so unclaimed requests can be picked up from
-- the queue). Not open to every authenticated user.
create policy "requests_update_assigned_or_unassigned_lawyer"
  on requests for update
  to authenticated
  using (
    exists (
      select 1 from lawyers
      where lawyers.auth_user_id = auth.uid()
        and lawyers.active
        and (
          lawyers.id = requests.assigned_lawyer_id
          or requests.assigned_lawyer_id is null
        )
    )
  );

-- No delete policy: requests are never deleted, for audit integrity.

-- ---------------------------------------------------------------------------
-- status_transitions
-- One row per status change. The audit trail and the source of cycle-time
-- data. Populated only by the trigger below — clients cannot write to it.
-- ---------------------------------------------------------------------------

create table status_transitions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  previous_status text,
  new_status text not null,
  changed_at timestamptz not null default now()
);

alter table status_transitions enable row level security;

create policy "status_transitions_select_authenticated"
  on status_transitions for select
  to authenticated
  using (true);

-- No insert/update/delete policy: rows are written only by the
-- security-definer trigger function below, never directly by a client.

create function log_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into status_transitions (request_id, previous_status, new_status)
    values (new.id, null, new.status);
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into status_transitions (request_id, previous_status, new_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger requests_log_status_transition
  after insert or update of status on requests
  for each row
  execute function log_status_transition();
