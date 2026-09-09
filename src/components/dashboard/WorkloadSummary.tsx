import { REQUEST_TYPE_CONFIG } from '../../config/sla'
import { OPEN_REQUEST_STATUSES } from '../../config/requestStatus'
import type { LawyerRecord, RequestRecord } from './useDashboardData'

interface WorkloadSummaryProps {
  requests: RequestRecord[]
  lawyers: LawyerRecord[]
}

interface LawyerWorkload {
  lawyer: LawyerRecord
  openCount: number
  openWeight: number
}

export function WorkloadSummary({ requests, lawyers }: WorkloadSummaryProps) {
  const workloads: LawyerWorkload[] = lawyers.map((lawyer) => {
    const openRequests = requests.filter(
      (request) =>
        request.assigned_lawyer_id === lawyer.id && OPEN_REQUEST_STATUSES.includes(request.status),
    )
    const openWeight = openRequests.reduce(
      (total, request) => total + REQUEST_TYPE_CONFIG[request.request_type].weight,
      0,
    )
    return { lawyer, openCount: openRequests.length, openWeight }
  })

  workloads.sort((a, b) => {
    if (a.openWeight !== b.openWeight) {
      return a.openWeight - b.openWeight
    }
    return new Date(a.lawyer.created_at).getTime() - new Date(b.lawyer.created_at).getTime()
  })

  return (
    <table className="dashboard-workload">
      <caption>Lawyer workload</caption>
      <thead>
        <tr>
          <th>Lawyer</th>
          <th>Open requests</th>
          <th>Open weight</th>
        </tr>
      </thead>
      <tbody>
        {workloads.map(({ lawyer, openCount, openWeight }) => (
          <tr key={lawyer.id}>
            <td>
              {lawyer.name}
              {!lawyer.active && ' (inactive)'}
            </td>
            <td>{openCount}</td>
            <td>{openWeight}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
