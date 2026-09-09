import { useState } from 'react'
import { useDashboardData } from './useDashboardData'
import { RequestFilters } from './RequestFilters'
import { WorkloadSummary } from './WorkloadSummary'
import { RequestTable } from './RequestTable'
import { OPEN_REQUEST_STATUSES } from '../../config/requestStatus'
import type { StatusFilterValue } from '../../config/requestStatus'
import type { TriageLane } from '../../lib/database.types'
import './DashboardScreen.css'

export function DashboardScreen() {
  const { requests, lawyers, currentLawyer, loading, error, updateStatus } = useDashboardData()
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('open')
  const [laneFilter, setLaneFilter] = useState<TriageLane | 'all'>('all')
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false)

  const lawyerNameById = new Map(lawyers.map((lawyer) => [lawyer.id, lawyer.name]))

  const filteredRequests = requests.filter((request) => {
    if (statusFilter === 'open') {
      if (!OPEN_REQUEST_STATUSES.includes(request.status)) {
        return false
      }
    } else if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false
    }
    if (laneFilter !== 'all' && request.triage_lane !== laneFilter) {
      return false
    }
    if (assignedToMeOnly && request.assigned_lawyer_id !== currentLawyer?.id) {
      return false
    }
    return true
  })

  return (
    <div className="dashboard-screen">
      <h1>Dashboard</h1>

      {loading && <p>Loading…</p>}
      {error && (
        <p className="dashboard-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <WorkloadSummary requests={requests} lawyers={lawyers} />
          <RequestFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            laneFilter={laneFilter}
            onLaneFilterChange={setLaneFilter}
            assignedToMeOnly={assignedToMeOnly}
            onAssignedToMeOnlyChange={setAssignedToMeOnly}
            assignedToMeDisabled={currentLawyer === null}
          />
          <RequestTable
            requests={filteredRequests}
            lawyerNameById={lawyerNameById}
            currentLawyer={currentLawyer}
            onUpdateStatus={updateStatus}
          />
        </>
      )}
    </div>
  )
}
