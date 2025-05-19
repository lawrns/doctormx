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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          created_at: string
          doctor_id: string
          id: string
          patient_id: string | null
          status: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          created_at?: string
          doctor_id: string
          id?: string
          patient_id?: string | null
          status?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      broadcasts: {
        Row: {
          content: string
          created_at: string
          doctor_id: string
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          doctor_id: string
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          doctor_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          }
        ]
      }
      domains: {
        Row: {
          created_at: string
          doctor_id: string
          domain: string
          id: string
          is_active: boolean
          is_verified: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          domain: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          domain?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "domains_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          }
        ]
      }
      doctors: {
        Row: {
          address: string | null
          bio: string | null
          city: string | null
          created_at: string
          education: string[] | null
          email: string
          id: string
          image_url: string | null
          languages: string[] | null
          name: string
          phone: string | null
          practice_years: number | null
          specialty: string | null
          state: string | null
          user_id: string
          verification_status: string | null
          verified: boolean
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          education?: string[] | null
          email: string
          id?: string
          image_url?: string | null
          languages?: string[] | null
          name: string
          phone?: string | null
          practice_years?: number | null
          specialty?: string | null
          state?: string | null
          user_id: string
          verification_status?: string | null
          verified?: boolean
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          education?: string[] | null
          email?: string
          id?: string
          image_url?: string | null
          languages?: string[] | null
          name?: string
          phone?: string | null
          practice_years?: number | null
          specialty?: string | null
          state?: string | null
          user_id?: string
          verification_status?: string | null
          verified?: boolean
          website?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      knowledge_base: {
        Row: {
          id: string
          question: string
          answer: string
          embedding: number[] | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          embedding?: number[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          embedding?: number[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_test_requests: {
        Row: {
          created_at: string
          doctor_id: string | null
          id: string
          patient_id: string
          status: string
          test_id: string
        }
        Insert: {
          created_at?: string
          doctor_id?: string | null
          id?: string
          patient_id: string
          status?: string
          test_id: string
        }
        Update: {
          created_at?: string
          doctor_id?: string | null
          id?: string
          patient_id?: string
          status?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_test_requests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_test_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_test_requests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          }
        ]
      }
      lab_tests: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      medical_knowledge: {
        Row: {
          created_at: string
          id: string
          terms: string[]
          description: string
          source: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          terms: string[]
          description: string
          source?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          terms?: string[]
          description?: string
          source?: string | null
        }
        Relationships: []
      }
      pharmacies: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_sponsored: boolean
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          sponsorship_level: number
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_sponsored?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          sponsorship_level?: number
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_sponsored?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          sponsorship_level?: number
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          medications: Json
          patient_id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          medications: Json
          patient_id: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          medications?: Json
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          medical_history: Json | null
          name: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          medical_history?: Json | null
          name?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          medical_history?: Json | null
          name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      referrals: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          patient_id: string | null
          reason: string | null
          referral_code: string
          specialty: string | null
          status: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          patient_id?: string | null
          reason?: string | null
          referral_code?: string
          specialty?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string | null
          reason?: string | null
          referral_code?: string
          specialty?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          id: string
          plan_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          id?: string
          plan_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          id?: string
          plan_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_knowledge: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          question: string
          answer: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never