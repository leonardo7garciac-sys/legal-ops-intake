// Triage rule (issue #4): assigns each request to a lane at submission time,
// derived only from the structured fields the requester already filled in.
// The requester never picks a lane or a legal classification — this function
// derives it.
import type { EstimatedValueBand, RequestType, TriageLane } from '../lib/database.types'

export const TRIAGE_LANE_OPTIONS: { value: TriageLane; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
]

// Value bands that put a request in the priority lane regardless of type.
const PRIORITY_VALUE_BANDS: EstimatedValueBand[] = ['250k_1m', 'over_1m']

// Request types eligible for the express lane.
const EXPRESS_REQUEST_TYPES: RequestType[] = ['pontual_query', 'nda', 'renewal_no_changes']

// Value bands eligible for the express lane (unspecified also qualifies,
// checked separately since it isn't a band value).
const EXPRESS_VALUE_BANDS: EstimatedValueBand[] = ['under_10k']

export interface TriageInput {
  requestType: RequestType
  estimatedValueBand: EstimatedValueBand | ''
  involvesCustomerData: boolean
  involvesEmployeeData: boolean
  involvesThirdPartyData: boolean
  involvesInternationalTransfer: boolean
}

export interface TriageResult {
  lane: TriageLane
  reason: string
}

// Joins reason fragments into a single sentence-safe list: 1 → "a",
// 2 → "a and b", 3 → "a, b, and c". A plain ', and '.join is wrong for 3.
function joinReasons(reasons: string[]): string {
  if (reasons.length === 2) return `${reasons[0]} and ${reasons[1]}`
  if (reasons.length > 2) {
    return `${reasons.slice(0, -1).join(', ')}, and ${reasons[reasons.length - 1]}`
  }
  return reasons[0]
}

// Lane and reason are computed together from the same conditions so they
// cannot drift apart. Priority is checked first, so it wins over express
// when both would apply.
export function computeTriage(input: TriageInput): TriageResult {
  // Personal-data categories only. An international transfer is an
  // operation performed on data (LGPD art. 5º, X), not a category of
  // data, so it is its own condition below rather than folded in here.
  const involvesPersonalData =
    input.involvesCustomerData || input.involvesEmployeeData || input.involvesThirdPartyData

  const isHighValue =
    input.estimatedValueBand !== '' && PRIORITY_VALUE_BANDS.includes(input.estimatedValueBand)

  const involvesInternationalTransfer = input.involvesInternationalTransfer

  if (involvesPersonalData || isHighValue || involvesInternationalTransfer) {
    const reasons: string[] = []
    if (involvesPersonalData) reasons.push('personal-data processing')
    if (isHighValue) reasons.push('an estimated value of R$250k or higher')
    if (involvesInternationalTransfer) reasons.push('an international data transfer')

    return {
      lane: 'priority',
      reason: `Priority: this request involves ${joinReasons(reasons)}.`,
    }
  }

  const isExpressType = EXPRESS_REQUEST_TYPES.includes(input.requestType)
  const isExpressValue =
    input.estimatedValueBand === '' || EXPRESS_VALUE_BANDS.includes(input.estimatedValueBand)

  if (isExpressType && isExpressValue) {
    return {
      lane: 'express',
      reason:
        'Express: a pontual query, NDA, or renewal without changes, with no personal-data ' +
        'processing, no international transfer, and a low or unspecified estimated value.',
    }
  }

  return {
    lane: 'standard',
    reason: 'Standard: does not meet the criteria for the express or priority lane.',
  }
}
