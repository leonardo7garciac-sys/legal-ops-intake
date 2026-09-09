// Single source of truth for request-type SLAs and routing weights.
// Routing itself runs in Postgres (see request_type_weight() in
// supabase/migrations/20260909150000_add_weighted_routing.sql), which hand-copies
// these weights — keep both in sync when either changes.
import type { RequestType } from '../lib/database.types'

interface RequestTypeConfig {
  label: string
  slaBusinessDays: number
  weight: number
}

export const REQUEST_TYPE_CONFIG: Record<RequestType, RequestTypeConfig> = {
  pontual_query: {
    label: 'Pontual query',
    slaBusinessDays: 3,
    weight: 1,
  },
  nda: {
    label: 'NDA',
    slaBusinessDays: 3,
    weight: 2,
  },
  renewal_no_changes: {
    label: 'Renewal without changes',
    slaBusinessDays: 5,
    weight: 2,
  },
  new_contract_corvina_paper: {
    label: 'New contract on Corvina paper',
    slaBusinessDays: 10,
    weight: 3,
  },
  third_party_draft_review: {
    label: 'Review of third-party draft',
    slaBusinessDays: 15,
    weight: 4,
  },
}

export const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  'pontual_query',
  'nda',
  'renewal_no_changes',
  'new_contract_corvina_paper',
  'third_party_draft_review',
].map((value) => ({
  value: value as RequestType,
  label: REQUEST_TYPE_CONFIG[value as RequestType].label,
}))

export function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  let remaining = days

  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining -= 1
    }
  }

  return result
}

export function getSlaDeadline(requestType: RequestType, from: Date = new Date()): Date {
  return addBusinessDays(from, REQUEST_TYPE_CONFIG[requestType].slaBusinessDays)
}

export function isJustificationRequired(
  requestType: RequestType,
  desiredDate: Date,
  today: Date = new Date(),
): boolean {
  return desiredDate.getTime() < getSlaDeadline(requestType, today).getTime()
}
