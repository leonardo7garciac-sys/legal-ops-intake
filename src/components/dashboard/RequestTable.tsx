import { RequestRow } from './RequestRow'
import type { LawyerRecord, RequestRecord } from './useDashboardData'
import type { RequestStatus } from '../../lib/database.types'

interface RequestTableProps {
  requests: RequestRecord[]
  lawyerNameById: Map<string, string>
  currentLawyer: LawyerRecord | null
  onUpdateStatus: (requestId: string, status: RequestStatus) => Promise<string | null>
}

export function RequestTable({ requests, lawyerNameById, currentLawyer, onUpdateStatus }: RequestTableProps) {
  return (
    <table className="dashboard-requests">
      <thead>
        <tr>
          <th aria-label="Expand" />
          <th>Reference</th>
          <th>Type</th>
          <th>Department</th>
          <th>Lane</th>
          <th>Desired date</th>
          <th>SLA deadline</th>
          <th>Status</th>
          <th>Assigned lawyer</th>
        </tr>
      </thead>
      <tbody>
        {requests.length === 0 && (
          <tr>
            <td colSpan={9}>No requests match the current filters.</td>
          </tr>
        )}
        {requests.map((request) => (
          <RequestRow
            key={request.id}
            request={request}
            lawyerNameById={lawyerNameById}
            currentLawyer={currentLawyer}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </tbody>
    </table>
  )
}
