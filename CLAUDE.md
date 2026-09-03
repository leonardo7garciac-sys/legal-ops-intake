# CLAUDE.md

Project conventions for this repository. Follow these before writing any code, data, or docs.

## Purpose

This is a Legal Operations portfolio project — a "legal front door" intake application, a
demonstration artifact for job applications, not production code. It must actually function.

## Fictional company

All synthetic data and documentation refer to a single fictional company, the same one used in
the sibling project `legal-ops-contract-analytics`:

- **Corvina Software Ltda.** — B2B SaaS company
- 400 employees
- In-house legal team of 4 lawyers
- Roughly 150 contracts processed per quarter

## Language

All file names, code comments, commit messages, and documentation must be in English.

## Commits

- Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, etc.).
- One commit per logical step.
- Reference the relevant GitHub issue in each commit message, e.g. `feat: add intake form (#3)`.

## Environment

- Windows with PowerShell.
- Node and npm are available.

## Stack

- Vite + React (TypeScript)
- Supabase (Postgres + auth)
- Deployed to Cloudflare Pages

## Secrets and environment variables

- Supabase credentials live in `.env.local`, which is git-ignored.
- A `.env.example` with placeholder keys is committed.
- Vite only exposes environment variables prefixed with `VITE_` to client-side code, so Supabase
  variables are named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Data minimisation (hard architectural rule)

This system records that personal-data processing is involved in a request — never the personal
data itself. No field anywhere may collect names, documents, contact details, or any other
personal data of data subjects. If a feature seems to require it, stop and flag it instead of
implementing it.

## Request types and SLAs

Request-type SLAs, in business days:

| Request type                        | SLA (business days) |
|--------------------------------------|----------------------|
| Pontual query                        | 3                    |
| NDA                                  | 3                    |
| Renewal without changes              | 5                    |
| New contract on Corvina paper        | 10                   |
| Review of third-party draft          | 15                   |

A justification field becomes required when the requester's desired date falls short of the SLA
for that request type.

These SLAs live in a single configurable constant, never inline in components.

## Routing

Routing is by weighted open workload, not by case count: each request type carries a weight, and
a new request goes to the lawyer with the lowest total weight of open requests. Weights live
alongside the SLA constant.

## Scope boundary

Never write business conclusions or analytical interpretation — in code, comments, docs, or
commit messages. The human author writes those.

## Folder structure

- `src/config/` — SLA and routing-weight constants (single source of truth; see rules above)
- `src/lib/` — Supabase client and other integration setup
- `src/components/intake/` — request-intake form components
