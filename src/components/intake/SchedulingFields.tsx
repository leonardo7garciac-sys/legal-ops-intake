import { REQUEST_TYPE_CONFIG } from '../../config/sla'
import type { IntakeFormState } from './useIntakeForm'

interface Props {
  form: IntakeFormState
  setField: <K extends keyof IntakeFormState>(key: K, value: IntakeFormState[K]) => void
  slaDeadline: Date
  justificationRequired: boolean
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function SchedulingFields({ form, setField, slaDeadline, justificationRequired }: Props) {
  return (
    <>
      <label htmlFor="desired-date">Desired date</label>
      <input
        id="desired-date"
        type="date"
        required
        value={form.desiredDate}
        onChange={(event) => setField('desiredDate', event.target.value)}
      />
      <p className="intake-hint">
        SLA: {REQUEST_TYPE_CONFIG[form.requestType].slaBusinessDays} business days
      </p>

      {justificationRequired && (
        <>
          <p className="intake-hint">
            SLA deadline for this request type: {toDateInputValue(slaDeadline)}
          </p>
          <label htmlFor="justification">
            Justification (required — desired date is before the SLA deadline)
          </label>
          <textarea
            id="justification"
            required
            value={form.justification}
            onChange={(event) => setField('justification', event.target.value)}
          />
        </>
      )}
    </>
  )
}
