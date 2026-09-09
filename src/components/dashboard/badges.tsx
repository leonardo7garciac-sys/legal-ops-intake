import { REQUEST_STATUS_OPTIONS } from '../../config/requestStatus'
import { TRIAGE_LANE_OPTIONS } from '../../config/triage'
import type { RequestStatus, TriageLane } from '../../lib/database.types'

export function StatusBadge({ status }: { status: RequestStatus }) {
  const label = REQUEST_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
  return <span className={`dashboard-badge dashboard-badge-status-${status}`}>{label}</span>
}

export function LaneBadge({ lane }: { lane: TriageLane }) {
  const label = TRIAGE_LANE_OPTIONS.find((option) => option.value === lane)?.label ?? lane
  return <span className={`dashboard-badge dashboard-badge-lane-${lane}`}>{label}</span>
}
