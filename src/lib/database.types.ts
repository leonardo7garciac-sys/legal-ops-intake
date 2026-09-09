// Hand-derived from supabase/migrations/20260907120000_create_schema.sql.
// No Supabase CLI connection is available from this environment, so this file
// is not machine-generated. Regenerate with `supabase gen types typescript`
// once the project is linked, and keep it in sync manually until then.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RequestType =
  | 'pontual_query'
  | 'nda'
  | 'renewal_no_changes'
  | 'new_contract_corvina_paper'
  | 'third_party_draft_review'

export type RequestStatus =
  | 'new'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled'

export type EstimatedValueBand =
  | 'under_10k'
  | '10k_50k'
  | '50k_250k'
  | '250k_1m'
  | 'over_1m'

export type TriageLane =
  | 'express'
  | 'standard'
  | 'priority'

export interface Database {
  public: {
    Tables: {
      lawyers: {
        Row: {
          id: string
          name: string
          email: string
          auth_user_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          auth_user_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          auth_user_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          id: string
          request_type: RequestType
          requesting_department: string
          counterparty_name: string | null
          estimated_value_band: EstimatedValueBand | null
          desired_date: string
          justification: string | null
          description: string | null
          assigned_lawyer_id: string | null
          status: RequestStatus
          involves_customer_data: boolean
          involves_employee_data: boolean
          involves_third_party_data: boolean
          involves_international_transfer: boolean
          triage_lane: TriageLane
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_type: RequestType
          requesting_department: string
          counterparty_name?: string | null
          estimated_value_band?: EstimatedValueBand | null
          desired_date: string
          justification?: string | null
          description?: string | null
          assigned_lawyer_id?: string | null
          status?: RequestStatus
          involves_customer_data?: boolean
          involves_employee_data?: boolean
          involves_third_party_data?: boolean
          involves_international_transfer?: boolean
          triage_lane: TriageLane
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_type?: RequestType
          requesting_department?: string
          counterparty_name?: string | null
          estimated_value_band?: EstimatedValueBand | null
          desired_date?: string
          justification?: string | null
          description?: string | null
          assigned_lawyer_id?: string | null
          status?: RequestStatus
          involves_customer_data?: boolean
          involves_employee_data?: boolean
          involves_third_party_data?: boolean
          involves_international_transfer?: boolean
          triage_lane?: TriageLane
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      status_transitions: {
        Row: {
          id: string
          request_id: string
          previous_status: RequestStatus | null
          new_status: RequestStatus
          changed_at: string
        }
        Insert: {
          id?: string
          request_id: string
          previous_status?: RequestStatus | null
          new_status: RequestStatus
          changed_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          previous_status?: RequestStatus | null
          new_status?: RequestStatus
          changed_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
