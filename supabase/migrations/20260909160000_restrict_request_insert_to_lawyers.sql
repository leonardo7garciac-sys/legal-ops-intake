-- Legal Operations Intake — restrict request submission to active lawyers (issue #7)
-- Replaces requests_insert_authenticated (any authenticated user) with a
-- check matching the UPDATE policy's pattern: only an account linked to an
-- active lawyer may submit a request. In a corporate intake, submissions
-- come from identified staff, not anonymous users — and this also prevents
-- an unrestricted public demo account from being abused to flood the queue.
--
-- A production deployment would link every employee's account (not just
-- lawyers) to enforce this the same way; this demo only has lawyer accounts
-- to link against.

drop policy "requests_insert_authenticated" on requests;

create policy "requests_insert_active_lawyer"
  on requests for insert
  to authenticated
  with check (
    exists (
      select 1 from lawyers
      where lawyers.auth_user_id = auth.uid()
        and lawyers.active
    )
  );
