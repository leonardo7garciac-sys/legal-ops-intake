# Supabase schema

This folder holds the SQL migrations for the Legal Operations Intake database. There is
no automated pipeline connecting this repo to Supabase — migrations are applied by hand.

## Applying a migration

1. Open the Supabase project's **SQL Editor**.
2. Open the migration file from `supabase/migrations/` (oldest first, by filename
   timestamp).
3. Paste the full contents and run it.
4. Confirm no errors, then move on to the next file if there is one.

There are currently five migrations, applied in order:

1. `20260907120000_create_schema.sql` — creates the full initial schema (`lawyers`,
   `requests`, `status_transitions`).
2. `20260907130000_fix_linter_warnings.sql` — pins `set_updated_at()`'s `search_path`
   and revokes direct `EXECUTE` on `log_status_transition()`, addressing two Supabase
   database linter warnings.
3. `20260909140000_add_triage_lane.sql` — adds the `triage_lane` column to
   `requests`, constrained to `express`/`standard`/`priority`.
4. `20260909150000_add_weighted_routing.sql` — adds `request_type_weight()` and a
   before-insert trigger (`assign_lawyer_for_request`) that assigns each request to
   the active lawyer with the lowest total open-request weight.
5. `20260909160000_restrict_request_insert_to_lawyers.sql` — replaces the request
   `INSERT` policy so only an account linked to an active lawyer may submit a request.

`supabase/seed.sql` is optional demo data — it is not part of the schema and is not
applied by the migration process above. See "Resetting the demo data" below.

## Tables

### `lawyers`

The four in-house lawyers. `name` and `email` belong to Corvina employees acting in a
professional capacity, not to data subjects of the requests they handle, so they are
permitted under the data-minimisation rule. `auth_user_id` links a lawyer record to
their Supabase Auth user, once the login flow exists — it's nullable so a lawyer row can
exist before (or after) an auth account does. `active` marks whether a lawyer currently
receives new assignments.

### `requests`

One row per intake submission: the request type (one of the five SLA'd types), the
requesting department, the counterparty's company name (never an individual),
an estimated value band, a desired date, an optional justification, a free-text
description, the assigned lawyer, the current status, four booleans recording
whether the request involves processing of customer data, employee data, third-party
data, or an international transfer, and the triage lane. Those four booleans describe
the operation being requested, never the underlying personal data itself.

`justification` is not enforced by a database constraint. Application logic in
`src/config/sla.ts` requires it whenever the requester's desired date falls short of the
SLA for that request type; the database only stores the value.

`description` is free text and must never contain personal data (names, documents,
contact details, or any other personal data of data subjects). The application warns
the user of this before submission.

`triage_lane` is computed client-side by `src/config/triage.ts` at submission time and
is only constrained by the database to be one of the three valid values — it is not
otherwise enforced. A direct API insert could set any of the three lanes regardless of
the request's actual fields. In production this rule would instead live in a trigger
alongside `log_status_transition`, so it could not be bypassed.

### `status_transitions`

One row per status change on a `request`: the request, the previous status, the new
status, and a timestamp. This is the audit trail and the source of cycle-time data. Rows
are written automatically by a trigger on `requests` whenever `status` changes (or on
initial insert, with `previous_status` left `null`) — there is no client-facing insert
policy, so this table cannot be written to directly.

## Access model

All access requires an authenticated Supabase session — there are no anonymous/public
policies on any table. Row Level Security is enabled on every table.

- **`lawyers`**: any authenticated user can read all rows (needed to populate
  assignment/routing UI). No client insert/update/delete — lawyer records are managed
  directly by an admin via the SQL Editor or service role.
- **`requests`**: any authenticated user can read all rows. Both *inserting* a new
  request and *updating* one require the account to be linked to an active lawyer —
  insert requires only that; update additionally requires the request to be
  unassigned, or assigned to that same lawyer (so the queue can be picked up). No
  delete policy — requests are never deleted.
- **`status_transitions`**: any authenticated user can read all rows. No insert/update/
  delete policy — rows are written only by the `security definer` trigger function
  described above.

This assumes Supabase Auth and a login flow exist; wiring those up, and mapping signed-in
users to `lawyers.auth_user_id`, is separate work not covered by this migration.

## Linter notes

The Supabase database linter flags the `SELECT` policy on `requests`
("requests_select_authenticated") as **RLS Policy Always True**. This is intentional,
not an oversight: any authenticated Corvina staff member may view the queue — that's
the whole point of an internal front door, and no personal data is at stake. Both
`INSERT` and `UPDATE` are restricted to accounts linked to an active lawyer (`UPDATE`
additionally requires the request to be unassigned or assigned to that lawyer). That
restriction is what `lawyers.auth_user_id` exists to support.

The **Leaked Password Protection Disabled** warning remains open because HaveIBeenPwned
integration requires a paid Supabase plan. It is not applicable to this demonstration
project, which has a single seeded account.

## Resetting the demo data

To clear demo requests and reseed:

1. In the SQL Editor, run:
   ```sql
   delete from requests;
   ```
2. Then paste and run the full contents of `supabase/seed.sql`.

Do not delete rows from `lawyers` — routing (issue #5) and the demo account's
`auth_user_id` link both depend on the existing lawyer records. Deleting a request
cascades to delete its `status_transitions` rows, so no separate cleanup is needed
there.
