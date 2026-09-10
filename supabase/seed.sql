-- Legal Operations Intake — demo seed data (issue #7)
-- Optional demo data, not part of the schema. Run manually, after all
-- migrations, via the Supabase SQL Editor (whose connection bypasses RLS,
-- so the requests_insert_active_lawyer policy doesn't block this). See
-- supabase/README.md § Resetting the demo data.
--
-- triage_lane is set explicitly below, computed by hand to match
-- src/config/triage.ts's computeTriage() — that rule lives in the client,
-- so nothing in the database derives it automatically for a direct insert
-- like this (the app itself always computes it in the browser before a
-- real submission).
--
-- assigned_lawyer_id is intentionally omitted so the requests_assign_lawyer
-- trigger (issue #5) distributes these across whatever active lawyers
-- exist. desired_date is uniformly two weeks out for every row, for
-- simplicity — it isn't meant to be historically accurate, and nothing in
-- the database enforces it against the SLA (that check is client-side only).
-- All counterparties are fictional companies; no personal data anywhere.

insert into requests (
  request_type, requesting_department, counterparty_name, estimated_value_band,
  desired_date, description, status,
  involves_customer_data, involves_employee_data, involves_third_party_data, involves_international_transfer,
  triage_lane, created_at
) values
  -- express: pontual query, no personal data, low value
  ('pontual_query', 'Sales', null, 'under_10k',
   current_date + 14, 'Quick question on standard payment terms.', 'new',
   false, false, false, false, 'express', now() - interval '58 days'),

  -- express: NDA, no personal data, value not specified
  ('nda', 'Engineering', 'Vela Systems Ltda.', null,
   current_date + 14, 'Mutual NDA ahead of a technical evaluation.', 'in_progress',
   false, false, false, false, 'express', now() - interval '1 days'),

  -- express: renewal without changes, no personal data, low value
  ('renewal_no_changes', 'Customer Success', 'Amora Digital Ltda.', 'under_10k',
   current_date + 14, 'Straight renewal, no changes to existing terms.', 'on_hold',
   false, false, false, false, 'express', now() - interval '45 days'),

  -- standard: renewal without changes, value band excludes it from express
  ('renewal_no_changes', 'Finance', 'Nortbridge Tecnologia Ltda.', '10k_50k',
   current_date + 14, 'Renewal with a modest increase in contract value.', 'completed',
   false, false, false, false, 'standard', now() - interval '50 days'),

  -- standard: new contract on Corvina paper is never express-eligible
  ('new_contract_corvina_paper', 'Product', 'Cedro Logistica Ltda.', '50k_250k',
   current_date + 14, 'New services agreement on Corvina''s standard paper.', 'new',
   false, false, false, false, 'standard', now() - interval '20 days'),

  -- standard: third-party draft review is never express-eligible
  ('third_party_draft_review', 'IT', 'Ipe Consultoria Ltda.', '50k_250k',
   current_date + 14, 'Reviewing counterparty-drafted services agreement.', 'in_progress',
   false, false, false, false, 'standard', now() - interval '5 days'),

  -- priority: personal data (customer data)
  ('pontual_query', 'Marketing', null, 'under_10k',
   current_date + 14, 'Question about a marketing data-sharing arrangement.', 'new',
   true, false, false, false, 'priority', now() - interval '10 days'),

  -- priority: personal data (employee data)
  ('nda', 'HR', 'Aurora Pagamentos Ltda.', null,
   current_date + 14, 'NDA with a prospective payroll vendor.', 'cancelled',
   false, true, false, false, 'priority', now() - interval '35 days'),

  -- priority: high estimated value
  ('new_contract_corvina_paper', 'Sales', 'Bravium Industria Ltda.', '250k_1m',
   current_date + 14, 'Large new supply agreement on Corvina paper.', 'on_hold',
   false, false, false, false, 'priority', now() - interval '25 days'),

  -- priority: personal data (third-party data) and high value together
  ('third_party_draft_review', 'Engineering', 'Solaris Energia Ltda.', 'over_1m',
   current_date + 14, 'Large third-party draft involving shared user data.', 'completed',
   false, false, true, false, 'priority', now() - interval '55 days'),

  -- priority: personal data (international transfer)
  ('renewal_no_changes', 'Product', 'Marfim Distribuidora Ltda.', 'under_10k',
   current_date + 14, 'Renewal involving a cross-border data transfer.', 'new',
   false, false, false, true, 'priority', now() - interval '2 days'),

  -- standard: pontual query but value band excludes it from express
  ('pontual_query', 'Customer Success', null, '10k_50k',
   current_date + 14, 'Pricing question tied to a mid-size account.', 'in_progress',
   false, false, false, false, 'standard', now() - interval '40 days');
