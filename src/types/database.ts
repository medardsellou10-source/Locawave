export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          plan: "trial" | "solo" | "pro" | "agence"
          plan_expires_at: string | null
          referral_code: string | null
          wave_number: string | null
          om_number: string | null
          address: string | null
          logo_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          plan?: "trial" | "solo" | "pro" | "agence"
          plan_expires_at?: string | null
          referral_code?: string | null
          wave_number?: string | null
          om_number?: string | null
          address?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          plan?: "trial" | "solo" | "pro" | "agence"
          plan_expires_at?: string | null
          referral_code?: string | null
          wave_number?: string | null
          om_number?: string | null
          address?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          org_id: string
          email: string
          full_name: string
          role: "owner" | "manager" | "viewer"
          created_at: string
        }
        Insert: {
          id: string
          org_id: string
          email: string
          full_name: string
          role?: "owner" | "manager" | "viewer"
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          full_name?: string
          role?: "owner" | "manager" | "viewer"
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          org_id: string
          name: string
          type: "appartement" | "villa" | "bureau" | "local"
          address: string | null
          neighborhood: string | null
          city: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          type: "appartement" | "villa" | "bureau" | "local"
          address?: string | null
          neighborhood?: string | null
          city?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          type?: "appartement" | "villa" | "bureau" | "local"
          address?: string | null
          neighborhood?: string | null
          city?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          property_id: string
          org_id: string
          unit_number: string
          type: "studio" | "f1" | "f2" | "f3" | "f4" | "commerce"
          floor: number | null
          surface_m2: number | null
          rent_fcfa: number
          status: "vacant" | "rented" | "maintenance"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          org_id: string
          unit_number: string
          type: "studio" | "f1" | "f2" | "f3" | "f4" | "commerce"
          floor?: number | null
          surface_m2?: number | null
          rent_fcfa: number
          status?: "vacant" | "rented" | "maintenance"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          org_id?: string
          unit_number?: string
          type?: "studio" | "f1" | "f2" | "f3" | "f4" | "commerce"
          floor?: number | null
          surface_m2?: number | null
          rent_fcfa?: number
          status?: "vacant" | "rented" | "maintenance"
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          org_id: string
          first_name: string
          last_name: string
          whatsapp: string
          email: string | null
          id_document_type: string | null
          id_document_number: string | null
          employer: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          first_name: string
          last_name: string
          whatsapp: string
          email?: string | null
          id_document_type?: string | null
          id_document_number?: string | null
          employer?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          first_name?: string
          last_name?: string
          whatsapp?: string
          email?: string | null
          id_document_type?: string | null
          id_document_number?: string | null
          employer?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leases: {
        Row: {
          id: string
          org_id: string
          unit_id: string
          tenant_id: string
          start_date: string
          end_date: string
          rent_fcfa: number
          due_day: number
          deposit_fcfa: number
          status: "active" | "ended"
          alert_60d_sent_at: string | null
          alert_30d_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          unit_id: string
          tenant_id: string
          start_date: string
          end_date: string
          rent_fcfa: number
          due_day: number
          deposit_fcfa?: number
          status?: "active" | "ended"
          alert_60d_sent_at?: string | null
          alert_30d_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          unit_id?: string
          tenant_id?: string
          start_date?: string
          end_date?: string
          rent_fcfa?: number
          due_day?: number
          deposit_fcfa?: number
          status?: "active" | "ended"
          alert_60d_sent_at?: string | null
          alert_30d_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rent_schedules: {
        Row: {
          id: string
          lease_id: string
          org_id: string
          due_date: string
          amount_fcfa: number
          status: "pending" | "paid" | "late"
          reminder_count: number
          reminder_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lease_id: string
          org_id: string
          due_date: string
          amount_fcfa: number
          status?: "pending" | "paid" | "late"
          reminder_count?: number
          reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lease_id?: string
          org_id?: string
          due_date?: string
          amount_fcfa?: number
          status?: "pending" | "paid" | "late"
          reminder_count?: number
          reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          org_id: string
          rent_schedule_id: string
          amount_fcfa: number
          method: "wave" | "orange_money" | "cash"
          reference: string | null
          screenshot_url: string | null
          paid_at: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          rent_schedule_id: string
          amount_fcfa: number
          method: "wave" | "orange_money" | "cash"
          reference?: string | null
          screenshot_url?: string | null
          paid_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          rent_schedule_id?: string
          amount_fcfa?: number
          method?: "wave" | "orange_money" | "cash"
          reference?: string | null
          screenshot_url?: string | null
          paid_at?: string
          created_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          org_id: string
          payment_id: string
          receipt_number: string
          pdf_url: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          payment_id: string
          receipt_number: string
          pdf_url?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          payment_id?: string
          receipt_number?: string
          pdf_url?: string | null
          sent_at?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          org_id: string
          property_id: string
          category: string
          amount_fcfa: number
          description: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          property_id: string
          category: string
          amount_fcfa: number
          description?: string | null
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          property_id?: string
          category?: string
          amount_fcfa?: number
          description?: string | null
          date?: string
          created_at?: string
        }
      }
      maintenance_requests: {
        Row: {
          id: string
          org_id: string
          unit_id: string
          description: string
          status: "open" | "in_progress" | "resolved"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          unit_id: string
          description: string
          status?: "open" | "in_progress" | "resolved"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          unit_id?: string
          description?: string
          status?: "open" | "in_progress" | "resolved"
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          org_id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      notification_templates: {
        Row: {
          id: string
          org_id: string
          type: string
          message_template: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          type: string
          message_template: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          type?: string
          message_template?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_org_id: string
          referee_org_id: string
          status: "pending" | "converted" | "rewarded"
          reward_applied_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          referrer_org_id: string
          referee_org_id: string
          status?: "pending" | "converted" | "rewarded"
          reward_applied_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          referrer_org_id?: string
          referee_org_id?: string
          status?: "pending" | "converted" | "rewarded"
          reward_applied_at?: string | null
          created_at?: string
        }
      }
      pending_confirmations: {
        Row: {
          id: string
          org_id: string
          whatsapp_from: string
          extracted_data: Json
          rent_schedule_id: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          whatsapp_from: string
          extracted_data: Json
          rent_schedule_id?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          whatsapp_from?: string
          extracted_data?: Json
          rent_schedule_id?: string | null
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      plan_type: "trial" | "solo" | "pro" | "agence"
      unit_status: "vacant" | "rented" | "maintenance"
      unit_type: "studio" | "f1" | "f2" | "f3" | "f4" | "commerce"
      property_type: "appartement" | "villa" | "bureau" | "local"
      lease_status: "active" | "ended"
      rent_status: "pending" | "paid" | "late"
      payment_method: "wave" | "orange_money" | "cash"
      user_role: "owner" | "manager" | "viewer"
      maintenance_status: "open" | "in_progress" | "resolved"
      referral_status: "pending" | "converted" | "rewarded"
    }
  }
}
