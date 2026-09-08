import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { REQUEST_TYPE_OPTIONS, getSlaDeadline, isJustificationRequired } from '../../config/sla'
import { DEPARTMENTS } from '../../config/departments'
import type { EstimatedValueBand, RequestType } from '../../lib/database.types'

export interface IntakeFormState {
  requestType: RequestType
  requestingDepartment: string
  counterpartyName: string
  estimatedValueBand: EstimatedValueBand | ''
  desiredDate: string
  justification: string
  description: string
  involvesCustomerData: boolean
  involvesEmployeeData: boolean
  involvesThirdPartyData: boolean
  involvesInternationalTransfer: boolean
}

const initialState: IntakeFormState = {
  requestType: REQUEST_TYPE_OPTIONS[0].value,
  requestingDepartment: DEPARTMENTS[0],
  counterpartyName: '',
  estimatedValueBand: '',
  desiredDate: '',
  justification: '',
  description: '',
  involvesCustomerData: false,
  involvesEmployeeData: false,
  involvesThirdPartyData: false,
  involvesInternationalTransfer: false,
}

function startOfToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function useIntakeForm() {
  const [form, setForm] = useState<IntakeFormState>(initialState)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedReference, setSubmittedReference] = useState<string | null>(null)

  function setField<K extends keyof IntakeFormState>(key: K, value: IntakeFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const desiredDateObj = form.desiredDate ? new Date(`${form.desiredDate}T00:00:00`) : null
  const slaDeadline = getSlaDeadline(form.requestType)
  const justificationRequired =
    desiredDateObj !== null && isJustificationRequired(form.requestType, desiredDateObj)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmittedReference(null)

    if (desiredDateObj !== null && desiredDateObj.getTime() <= startOfToday().getTime()) {
      setError('Desired date must be in the future.')
      return
    }

    if (justificationRequired && form.justification.trim().length === 0) {
      setError(
        'Justification is required because the desired date is before the SLA deadline for this request type.',
      )
      return
    }

    setSubmitting(true)

    const { data, error: insertError } = await supabase
      .from('requests')
      .insert({
        request_type: form.requestType,
        requesting_department: form.requestingDepartment,
        counterparty_name: form.counterpartyName.trim() || null,
        estimated_value_band: form.estimatedValueBand || null,
        desired_date: form.desiredDate,
        justification: justificationRequired ? form.justification.trim() : null,
        description: form.description.trim() || null,
        involves_customer_data: form.involvesCustomerData,
        involves_employee_data: form.involvesEmployeeData,
        involves_third_party_data: form.involvesThirdPartyData,
        involves_international_transfer: form.involvesInternationalTransfer,
      })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
    } else {
      setSubmittedReference(data.id.slice(0, 8))
      setForm(initialState)
    }

    setSubmitting(false)
  }

  return {
    form,
    setField,
    submitting,
    error,
    submittedReference,
    slaDeadline,
    justificationRequired,
    handleSubmit,
  }
}
