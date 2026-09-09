import { Fragment, useState } from 'react'
import type { ChangeEvent } from 'react'
import { REQUEST_TYPE_CONFIG, getSlaDeadline } from '../../config/sla'
import { REQUEST_STATUS_OPTIONS, OPEN_REQUEST_STATUSES } from '../../config/requestStatus'
import { LaneBadge, StatusBadge } from './badges'
import { RequestDetailRow } from './RequestDetailRow'
import type { LawyerRecord, RequestRecord } from './useDashboardData'
import type { RequestStatus } from '../../lib/database.types'

interface RequestRowProps {
  request: RequestRecord
  lawyerNameById: Map<string, string>
  currentLawyer: LawyerRecord | null
  onUpdateStatus: (requestId: string, status: RequestStatus) => Promise<string | null>
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function RequestRow({ request, lawyerNameById, currentLawyer, onUpdateStatus }: RequestRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [now] = useState(() => Date.now())

  const slaDeadline = getSlaDeadline(request.request_type, new Date(request.created_at))
  const isOverdue = OPEN_REQUEST_STATUSES.includes(request.status) && slaDeadline.getTime() < now

  const canEdit =
    currentLawyer !== null &&
    currentLawyer.active &&
    (request.assigned_lawyer_id === currentLawyer.id || request.assigned_lawyer_id === null)

  const lawyerName = lawyerNameById.get(request.assigned_lawyer_id ?? '') ?? 'Unassigned'

  async function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    setUpdateError(null)
    const result = await onUpdateStatus(request.id, event.target.value as RequestStatus)
    if (result) {
      setUpdateError(result)
    }
  }

  return (
    <Fragment>
      <tr className={isOverdue ? 'dashboard-row-overdue' : undefined}>
        <td>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? '−' : '+'}
          </button>
        </td>
        <td>{request.id.slice(0, 8)}</td>
        <td>{REQUEST_TYPE_CONFIG[request.request_type].label}</td>
        <td>{request.requesting_department}</td>
        <td>
          <LaneBadge lane={request.triage_lane} />
        </td>
        <td>{request.desired_date}</td>
        <td>
          {formatDate(slaDeadline)}
          {isOverdue && <span className="dashboard-overdue-marker"> (overdue)</span>}
        </td>
        <td>
          {canEdit ? (
            <select value={request.status} onChange={handleStatusChange}>
              {REQUEST_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <StatusBadge status={request.status} />
          )}
        </td>
        <td>{lawyerName}</td>
      </tr>
      {updateError && (
        <tr>
          <td colSpan={9} className="dashboard-error" role="alert">
            {updateError}
          </td>
        </tr>
      )}
      {expanded && <RequestDetailRow description={request.description} />}
    </Fragment>
  )
}
