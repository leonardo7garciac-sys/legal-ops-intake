import { useIntakeForm } from './useIntakeForm'
import { RequestDetailsFields } from './RequestDetailsFields'
import { SchedulingFields } from './SchedulingFields'
import { DataProcessingFields } from './DataProcessingFields'
import './IntakeForm.css'

export function IntakeForm() {
  const {
    form,
    setField,
    submitting,
    error,
    submittedReference,
    slaDeadline,
    justificationRequired,
    handleSubmit,
  } = useIntakeForm()

  return (
    <div className="intake-screen">
      <form className="intake-form" onSubmit={handleSubmit}>
        <h1>New legal request</h1>
        <p className="intake-subtitle">
          Do not include names, documents, or any other personal data of data subjects anywhere
          in this form.
        </p>

        <RequestDetailsFields form={form} setField={setField} />
        <SchedulingFields
          form={form}
          setField={setField}
          slaDeadline={slaDeadline}
          justificationRequired={justificationRequired}
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(event) => setField('description', event.target.value)}
        />

        <DataProcessingFields form={form} setField={setField} />

        {error && (
          <p className="intake-error" role="alert">
            {error}
          </p>
        )}

        {submittedReference && (
          <p className="intake-success" role="status">
            Request submitted. Reference: {submittedReference}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </div>
  )
}
