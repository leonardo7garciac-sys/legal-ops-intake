# Legal Ops Intake

An internal legal front door for an in-house legal team.

## Live demo

https://legal-ops-intake.pages.dev

Demo credentials:
- Email: demo@corvina.example
- Password: demo-corvina-2026

The Supabase project is on the free tier, so the database may take a few seconds to
wake up after a period of inactivity — the first sign-in or request after a while
may be slow.

## The problem

Legal demand at a company like Corvina Software arrives by email, chat, and hallway
conversation. There is no register of what was asked, no way to prioritise incoming
requests, no forcing function for a complete request (dates, value, whether personal
data is involved), and no data with which to measure the legal team's own work.

This app is the capture instrument. Its output — structured, triaged, timestamped
requests — is the raw data the sibling project, `legal-ops-contract-analytics`,
analyses.

## What it does

- **Intake** with SLA-aware validation: a justification is required when the
  requested date falls short of the SLA for that request type.
- **Automatic triage** into three lanes (express / standard / priority), derived
  from the request's own fields at submission time — the requester never picks a
  lane.
- **Weighted workload routing**: each new request is assigned to the active lawyer
  carrying the lowest total weight of open work, not the lowest case count.
- **A working queue dashboard**: every request, filterable by status and lane, with
  a status control, overdue highlighting, and per-lawyer workload visibility.

## Architecture

- **Stack**: Vite + React 19 (TypeScript), Supabase (Postgres + Auth), deployed to
  Cloudflare Pages.
- **Tables**: `lawyers` (the in-house team), `requests` (one row per intake
  submission), `status_transitions` (an append-only audit trail of status changes).
- **Row Level Security**, in plain terms:
  - **Read**: any authenticated (signed-in) user can read every `lawyers` and
    `requests` row, and every `status_transitions` row — this is an internal tool,
    not a per-user inbox.
  - **Insert**: a new request can only be inserted by an account linked to an
    active lawyer.
  - **Update**: a request can only be updated by the lawyer it's assigned to, or by
    any active lawyer while it's unassigned.
  - `status_transitions` has no client insert/update/delete policy at all — it is
    written only by a database trigger.

## Design decisions

**Data minimisation is a hard rule.** No field anywhere collects a data subject's
name, documents, or contact details. The four `involves_*` booleans on a request
record that personal-data processing is involved — never the personal data itself.
This keeps the tool usable without turning it into a second system that itself
needs to be protected as a repository of personal data.

**Triage is derived from structured facts, not a classification the requester
declares.** The requester never picks a lane or names a legal risk category; the
lane is computed from the request type, value band, and personal-data flags they
already filled in. A self-declared classification would be inconsistent between
requesters and easy to game toward whichever lane gets faster service.

**Routing runs in a database trigger, with an advisory lock, rather than
client-side.** A client-side "who has the lowest load" computation reads stale
data the moment two requests are submitted close together, and a client can't be
trusted to compute its own priority anyway. The trigger recomputes on every insert
inside the same transaction, and `pg_advisory_xact_lock` serialises concurrent
submissions so two requests submitted at the same instant can't both land on the
same least-loaded lawyer.

**The audit trail is written by a `security definer` trigger, with no client
insert policy on `status_transitions`.** If any authenticated user could insert
their own status-transition rows, the audit trail would prove nothing — a lawyer
under pressure could simply write a friendlier history. Because only the trigger
can write to that table, the record of who did what, and when, can't be forged
from the client.

## Known limitations

- **Triage can be bypassed by a direct API call.** The lane is computed in the
  browser (`src/config/triage.ts`) before the insert; the database only
  constrains `triage_lane` to be one of the three valid values, not that it
  matches the request's actual fields. A request inserted directly against the
  Supabase API, rather than through the form, could set any lane regardless of
  what it actually involves.
- **Routing weights are duplicated, not shared.** The same weight per request
  type is defined once in `src/config/sla.ts` and again inline in the SQL
  function `request_type_weight()`, with a comment on each side telling the
  reader to keep them in sync. A database-held weights table, read by both the
  app and the trigger, was considered and rejected as disproportionate
  engineering for five values that change about as rarely as the SLA table
  itself does.
- **There is no `created_by` column.** The system records what was asked and
  when, but not who asked — so it cannot answer "which department submits the
  most requests" by requester identity, only by the `requesting_department`
  field they filled in.
- **The dashboard loads once.** It fetches requests and lawyers on mount and
  does not subscribe to changes — a second lawyer's update, or a new
  submission, won't appear until the page is reloaded.
- **Business-day arithmetic only skips weekends.** `addBusinessDays` has no
  holiday calendar, so an SLA deadline that lands on a public holiday is still
  treated as a normal business day. In a real deployment, the holiday calendar
  would come from HR, not be hardcoded here.
- **Same-day urgent requests have no path through the form.** The intake form
  requires the desired date to be strictly in the future, so a request needed
  today — arguably the most urgent kind — cannot be submitted as written. The
  right behaviour would be to accept a same-day date as the extreme case of a
  tight deadline — justification required, priority lane — rather than blocking
  the submission and pushing the requester back to email.

## Running locally

1. Clone the repository.
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your own Supabase project's
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Apply the migrations in `supabase/migrations/`, in order, via the Supabase SQL
   Editor (see `supabase/README.md`).
5. Optionally, run `supabase/seed.sql` for demo data.
6. `npm run dev`

## AI use in this project

Claude Code generated the application code — components, hooks, SQL migrations,
and this documentation — from specifications written by the author.

The decisions were the author's: the process design (what a legal front door
needs to capture and enforce), the triage rule and its thresholds, the SLA
table, the weighted-routing approach (including the choice to enforce it in the
database rather than the client), the data-minimisation rule, and the RLS model
describing who can read, insert, and update each table.

All generated output was reviewed, run, and tested by the author before being
treated as done.
