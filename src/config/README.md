# config

Single source of truth for constants that must never be hardcoded inline in components.

Planned modules:
- `sla.ts` — request-type SLA constants (business days) and the desired-date-vs-SLA
  justification rule.
- `routing.ts` — request-type weights used for weighted open-workload routing.

See root `CLAUDE.md` for the rules these constants must encode.
