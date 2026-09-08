import { REQUEST_TYPE_OPTIONS } from '../../config/sla'
import { DEPARTMENTS } from '../../config/departments'
import { VALUE_BAND_OPTIONS } from '../../config/valueBands'
import type { EstimatedValueBand, RequestType } from '../../lib/database.types'
import type { IntakeFormState } from './useIntakeForm'

interface Props {
  form: IntakeFormState
  setField: <K extends keyof IntakeFormState>(key: K, value: IntakeFormState[K]) => void
}

export function RequestDetailsFields({ form, setField }: Props) {
  return (
    <>
      <label htmlFor="request-type">Request type</label>
      <select
        id="request-type"
        value={form.requestType}
        onChange={(event) => setField('requestType', event.target.value as RequestType)}
      >
        {REQUEST_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label htmlFor="requesting-department">Requesting department</label>
      <select
        id="requesting-department"
        value={form.requestingDepartment}
        onChange={(event) => setField('requestingDepartment', event.target.value)}
      >
        {DEPARTMENTS.map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>

      <label htmlFor="counterparty-name">Counterparty (company name, if any)</label>
      <input
        id="counterparty-name"
        type="text"
        value={form.counterpartyName}
        onChange={(event) => setField('counterpartyName', event.target.value)}
      />

      <label htmlFor="estimated-value-band">Estimated value</label>
      <select
        id="estimated-value-band"
        value={form.estimatedValueBand}
        onChange={(event) =>
          setField('estimatedValueBand', event.target.value as EstimatedValueBand | '')
        }
      >
        <option value="">Not specified</option>
        {VALUE_BAND_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  )
}
