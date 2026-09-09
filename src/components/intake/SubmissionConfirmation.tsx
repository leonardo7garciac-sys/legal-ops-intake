import type { SubmittedRequestSummary } from './useIntakeForm'
import { TRIAGE_LANE_OPTIONS } from '../../config/triage'

interface Props {
  submittedRequest: SubmittedRequestSummary
}

export function SubmissionConfirmation({ submittedRequest }: Props) {
  const laneLabel =
    TRIAGE_LANE_OPTIONS.find((option) => option.value === submittedRequest.lane)?.label ??
    submittedRequest.lane

  return (
    <p className="intake-success" role="status">
      Request submitted. Reference: {submittedRequest.reference}
      <br />
      Lane: {laneLabel}. {submittedRequest.reason}
    </p>
  )
}
