// Requesting-department list, matching the sibling legal-ops-contract-analytics project.
export const DEPARTMENTS = [
  'Sales',
  'Engineering',
  'Product',
  'Customer Success',
  'Marketing',
  'Finance',
  'HR',
  'IT',
] as const

export type Department = (typeof DEPARTMENTS)[number]
