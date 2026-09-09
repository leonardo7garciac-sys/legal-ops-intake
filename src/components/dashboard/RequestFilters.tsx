import { REQUEST_STATUS_OPTIONS } from '../../config/requestStatus'
import type { StatusFilterValue } from '../../config/requestStatus'
import { TRIAGE_LANE_OPTIONS } from '../../config/triage'
import type { TriageLane } from '../../lib/database.types'

interface RequestFiltersProps {
  statusFilter: StatusFilterValue
  onStatusFilterChange: (value: StatusFilterValue) => void
  laneFilter: TriageLane | 'all'
  onLaneFilterChange: (value: TriageLane | 'all') => void
  assignedToMeOnly: boolean
  onAssignedToMeOnlyChange: (value: boolean) => void
  assignedToMeDisabled: boolean
}

export function RequestFilters({
  statusFilter,
  onStatusFilterChange,
  laneFilter,
  onLaneFilterChange,
  assignedToMeOnly,
  onAssignedToMeOnlyChange,
  assignedToMeDisabled,
}: RequestFiltersProps) {
  return (
    <div className="dashboard-filters">
      <label>
        Status
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as StatusFilterValue)}
        >
          <option value="open">Open</option>
          <option value="all">All statuses</option>
          {REQUEST_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Lane
        <select
          value={laneFilter}
          onChange={(event) => onLaneFilterChange(event.target.value as TriageLane | 'all')}
        >
          <option value="all">All lanes</option>
          {TRIAGE_LANE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="dashboard-filters-checkbox">
        <input
          type="checkbox"
          checked={assignedToMeOnly}
          disabled={assignedToMeDisabled}
          onChange={(event) => onAssignedToMeOnlyChange(event.target.checked)}
        />
        Assigned to me
      </label>
    </div>
  )
}
