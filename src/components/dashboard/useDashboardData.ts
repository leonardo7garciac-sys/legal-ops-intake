import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import type { Database, RequestStatus } from '../../lib/database.types'

export type RequestRecord = Database['public']['Tables']['requests']['Row']
export type LawyerRecord = Database['public']['Tables']['lawyers']['Row']

export function useDashboardData() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestRecord[]>([])
  const [lawyers, setLawyers] = useState<LawyerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const [requestsResult, lawyersResult] = await Promise.all([
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('lawyers').select('*'),
      ])

      if (cancelled) {
        return
      }

      if (requestsResult.error) {
        setError(requestsResult.error.message)
      } else if (lawyersResult.error) {
        setError(lawyersResult.error.message)
      } else {
        setRequests(requestsResult.data)
        setLawyers(lawyersResult.data)
      }

      setLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const currentLawyer = lawyers.find((lawyer) => lawyer.auth_user_id === user?.id) ?? null

  const updateStatus = useCallback(async (requestId: string, status: RequestStatus) => {
    const { error: updateError } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', requestId)

    if (updateError) {
      return updateError.message
    }

    setRequests((prev) =>
      prev.map((request) => (request.id === requestId ? { ...request, status } : request)),
    )
    return null
  }, [])

  return { requests, lawyers, currentLawyer, loading, error, updateStatus }
}
