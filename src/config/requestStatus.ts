// Status labels for the request lifecycle, following the REQUEST_TYPE_OPTIONS /
// TRIAGE_LANE_OPTIONS pattern in this folder.
import type { RequestStatus } from '../lib/database.types'

export const REQUEST_STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

// Statuses that count as "open" — used both for workload totals and for the
// overdue check, so the two stay in sync by construction.
export const OPEN_REQUEST_STATUSES: RequestStatus[] = ['new', 'in_progress', 'on_hold']

// The dashboard's status filter adds two pseudo-values beyond the real
// statuses: "open" (the three OPEN_REQUEST_STATUSES combined, the default
// view) and "all" (no filtering).
export type StatusFilterValue = RequestStatus | 'open' | 'all'
