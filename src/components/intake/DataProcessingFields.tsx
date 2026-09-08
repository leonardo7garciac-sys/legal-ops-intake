import type { IntakeFormState } from './useIntakeForm'

interface Props {
  form: IntakeFormState
  setField: <K extends keyof IntakeFormState>(key: K, value: IntakeFormState[K]) => void
}

export function DataProcessingFields({ form, setField }: Props) {
  return (
    <fieldset className="intake-data-processing">
      <legend>Does this request involve processing of…</legend>

      <label className="intake-checkbox">
        <input
          type="checkbox"
          checked={form.involvesCustomerData}
          onChange={(event) => setField('involvesCustomerData', event.target.checked)}
        />
        Customer data
      </label>

      <label className="intake-checkbox">
        <input
          type="checkbox"
          checked={form.involvesEmployeeData}
          onChange={(event) => setField('involvesEmployeeData', event.target.checked)}
        />
        Employee data
      </label>

      <label className="intake-checkbox">
        <input
          type="checkbox"
          checked={form.involvesThirdPartyData}
          onChange={(event) => setField('involvesThirdPartyData', event.target.checked)}
        />
        Third-party data
      </label>

      <label className="intake-checkbox">
        <input
          type="checkbox"
          checked={form.involvesInternationalTransfer}
          onChange={(event) => setField('involvesInternationalTransfer', event.target.checked)}
        />
        International transfer
      </label>
    </fieldset>
  )
}
