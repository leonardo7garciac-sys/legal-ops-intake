-- Legal Operations Intake — add triage lane (issue #4)
-- Adds triage_lane to requests: the lane each request is routed to at
-- submission time, computed client-side from structured fields already on
-- the row. See src/config/triage.ts for the rule.

alter table requests
  add column triage_lane text not null check (triage_lane in (
    'express',
    'standard',
    'priority'
  ));

comment on column requests.triage_lane is
  'Computed once at submission time by src/config/triage.ts from the other '
  'structured fields on this row (request_type, estimated_value_band, and '
  'the involves_* booleans). Never chosen by the requester.';
