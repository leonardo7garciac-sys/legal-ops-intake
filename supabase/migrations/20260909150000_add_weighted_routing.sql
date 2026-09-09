-- Legal Operations Intake — weighted-workload routing (issue #5)
-- Assigns each new request to the active lawyer with the lowest total weight
-- of open requests (status new/in_progress/on_hold), not the lowest case
-- count. Runs entirely in the database via a before-insert trigger so it
-- cannot race between two simultaneous submissions and cannot be bypassed
-- by a direct API call.

-- ---------------------------------------------------------------------------
-- request_type_weight
-- Routing weight per request type. This is a hand-kept copy of the weight
-- field in REQUEST_TYPE_CONFIG (src/config/sla.ts) — update both together,
-- or routing will disagree with what the intake form displays.
-- ---------------------------------------------------------------------------

create function request_type_weight(request_type text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case request_type
    when 'pontual_query' then 1
    when 'nda' then 2
    when 'renewal_no_changes' then 2
    when 'new_contract_corvina_paper' then 3
    when 'third_party_draft_review' then 4
  end;
$$;

-- ---------------------------------------------------------------------------
-- assign_lawyer_for_request
-- Picks the active lawyer with the lowest total weight of open requests.
-- Ties are broken by lowest weight first, then oldest lawyer created_at, so
-- the outcome is reproducible. Runs before insert so a single
-- RETURNING/.select() from the client already reflects the assignment — no
-- second write is needed.
--
-- Not security definer: lawyers and requests both already let any
-- authenticated user select all rows, so this function can read what it
-- needs running as the inserting user.
--
-- An advisory transaction lock serializes concurrent assignment
-- computations, so two requests submitted at the same instant cannot both
-- read the same pre-insert workload and land on the same lawyer. The lock
-- is released automatically at the end of the transaction.
--
-- If there is no active lawyer, assigned_lawyer_id is left null rather than
-- failing the insert — `select ... into` sets the target to null when the
-- query returns no rows, so no exception handling is needed here.
-- ---------------------------------------------------------------------------

create function assign_lawyer_for_request()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  chosen_lawyer_id uuid;
begin
  if new.assigned_lawyer_id is not null then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext('assign_lawyer_for_request')::bigint);

  select l.id
    into chosen_lawyer_id
    from lawyers l
    left join requests r
      on r.assigned_lawyer_id = l.id
     and r.status in ('new', 'in_progress', 'on_hold')
   where l.active
   group by l.id, l.created_at
   order by coalesce(sum(request_type_weight(r.request_type)), 0) asc, l.created_at asc
   limit 1;

  new.assigned_lawyer_id := chosen_lawyer_id;
  return new;
end;
$$;

create trigger requests_assign_lawyer
  before insert on requests
  for each row
  execute function assign_lawyer_for_request();
