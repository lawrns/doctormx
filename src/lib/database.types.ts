export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lab_appointments: {
        Row: {
          id: string
          request_id: string
          technician_id: string | null
          appointment_date: string
          appointment_time: string
          address: string
          lat: number | null
          lng: number | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          request_id: string
          technician_id?: string | null
          appointment_date: string
          appointment_time: string
          address: string
          lat?: number | null
          lng?: number | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          technician_id?: string | null
          appointment_date?: string
          appointment_time?: string
          address?: string
          lat?: number | null
          lng?: number | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_appointments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "lab_test_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_appointments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "lab_technicians"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_results: {
        Row: {
          id: string
          request_id: string
          test_id: string
          result_data: Json
          is_abnormal: boolean
          pdf_url: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          request_id: string
          test_id: string
          result_data: Json
          is_abnormal?: boolean
          pdf_url?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          test_id?: string
          result_data?: Json
          is_abnormal?: boolean
          pdf_url?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "lab_test_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_samples: {
        Row: {
          id: string
          appointment_id: string
          sample_type: string
          sample_id: string
          collection_time: string
          collected_by: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          appointment_id: string
          sample_type: string
          sample_id: string
          collection_time: string
          collected_by?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          appointment_id?: string
          sample_type?: string
          sample_id?: string
          collection_time?: string
          collected_by?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_samples_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "lab_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_samples_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "lab_technicians"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_technicians: {
        Row: {
          id: string
          user_id: string | null
          name: string
          license_number: string | null
          phone: string
          email: string
          is_active: boolean
          service_areas: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          license_number?: string | null
          phone: string
          email: string
          is_active?: boolean
          service_areas?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          license_number?: string | null
          phone?: string
          email?: string
          is_active?: boolean
          service_areas?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_technicians_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_test_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lab_test_category_mapping: {
        Row: {
          test_id: string
          category_id: string
        }
        Insert: {
          test_id: string
          category_id: string
        }
        Update: {
          test_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_test_category_mapping_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "lab_test_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_test_category_mapping_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_test_request_items: {
        Row: {
          id: string
          request_id: string
          test_id: string
          price_at_order: number
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          test_id: string
          price_at_order: number
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          test_id?: string
          price_at_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_test_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "lab_test_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_test_request_items_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_test_requests: {
        Row: {
          id: string
          patient_id: string
          status: string
          instructions: string | null
          special_requirements: string | null
          created_at: string
          updated_at: string | null
          payment_status: string
          total_amount: number | null
        }
        Insert: {
          id?: string
          patient_id: string
          status?: string
          instructions?: string | null
          special_requirements?: string | null
          created_at?: string
          updated_at?: string | null
          payment_status?: string
          total_amount?: number | null
        }
        Update: {
          id?: string
          patient_id?: string
          status?: string
          instructions?: string | null
          special_requirements?: string | null
          created_at?: string
          updated_at?: string | null
          payment_status?: string
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_test_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_tests: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          price: number
          instructions: string | null
          preparation_required: boolean
          fast_required: boolean
          fast_hours: number | null
          processing_time_hours: number
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          price: number
          instructions?: string | null
          preparation_required?: boolean
          fast_required?: boolean
          fast_hours?: number | null
          processing_time_hours?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          price?: number
          instructions?: string | null
          preparation_required?: boolean
          fast_required?: boolean
          fast_hours?: number | null
          processing_time_hours?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}