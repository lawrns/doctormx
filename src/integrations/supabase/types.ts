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
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_id: string | null
          auth_token: string
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          user_agent: string | null
        }
        Insert: {
          admin_id?: string | null
          auth_token: string
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string | null
          auth_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          auth_id: string | null
          created_at: string
          email: string
          encrypted_password: string
          failed_attempts: number | null
          first_name: string | null
          id: string
          last_login_at: string | null
          last_name: string | null
          locked_at: string | null
          permissions: Json
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          email: string
          encrypted_password: string
          failed_attempts?: number | null
          first_name?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          locked_at?: string | null
          permissions?: Json
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          email?: string
          encrypted_password?: string
          failed_attempts?: number | null
          first_name?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          locked_at?: string | null
          permissions?: Json
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      body_regions: {
        Row: {
          coordinates: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "body_regions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "body_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      condition_specialties: {
        Row: {
          condition_id: string | null
          created_at: string | null
          id: string
          priority: number | null
          specialty_name: string
        }
        Insert: {
          condition_id?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          specialty_name: string
        }
        Update: {
          condition_id?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          specialty_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "condition_specialties_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "symptoms_conditions"
            referencedColumns: ["id"]
          },
        ]
      }
      dentist_images: {
        Row: {
          created_at: string | null
          dentist_id: string | null
          id: string
          image_type: string | null
          image_url: string
        }
        Insert: {
          created_at?: string | null
          dentist_id?: string | null
          id?: string
          image_type?: string | null
          image_url: string
        }
        Update: {
          created_at?: string | null
          dentist_id?: string | null
          id?: string
          image_type?: string | null
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "dentist_images_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "dentists"
            referencedColumns: ["id"]
          },
        ]
      }
      dentist_insurances: {
        Row: {
          created_at: string | null
          dentist_id: string | null
          id: string
          insurance_name: string
        }
        Insert: {
          created_at?: string | null
          dentist_id?: string | null
          id?: string
          insurance_name: string
        }
        Update: {
          created_at?: string | null
          dentist_id?: string | null
          id?: string
          insurance_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dentist_insurances_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "dentists"
            referencedColumns: ["id"]
          },
        ]
      }
      dentist_languages: {
        Row: {
          created_at: string | null
          dentist_id: string | null
          id: string
          language_name: string
        }
        Insert: {
          created_at?: string | null
          dentist_id?: string | null
          id?: string
          language_name: string
        }
        Update: {
          created_at?: string | null
          dentist_id?: string | null
          id?: string
          language_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dentist_languages_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "dentists"
            referencedColumns: ["id"]
          },
        ]
      }
      dentist_prices: {
        Row: {
          created_at: string | null
          dentist_id: string | null
          id: string
          price_max: number | null
          price_min: number | null
          service_name: string
        }
        Insert: {
          created_at?: string | null
          dentist_id?: string | null
          id?: string
          price_max?: number | null
          price_min?: number | null
          service_name: string
        }
        Update: {
          created_at?: string | null
          dentist_id?: string | null
          id?: string
          price_max?: number | null
          price_min?: number | null
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dentist_prices_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "dentists"
            referencedColumns: ["id"]
          },
        ]
      }
      dentist_reviews: {
        Row: {
          created_at: string | null
          dentist_id: string | null
          id: string
          rating: number
          review_date: string | null
          review_text: string | null
          reviewer_location: string | null
          reviewer_name: string | null
        }
        Insert: {
          created_at?: string | null
          dentist_id?: string | null
          id?: string
          rating: number
          review_date?: string | null
          review_text?: string | null
          reviewer_location?: string | null
          reviewer_name?: string | null
        }
        Update: {
          created_at?: string | null
          dentist_id?: string | null
          id?: string
          rating?: number
          review_date?: string | null
          review_text?: string | null
          reviewer_location?: string | null
          reviewer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dentist_reviews_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "dentists"
            referencedColumns: ["id"]
          },
        ]
      }
      dentist_services: {
        Row: {
          created_at: string | null
          dentist_id: string | null
          description: string | null
          id: string
          service_name: string
        }
        Insert: {
          created_at?: string | null
          dentist_id?: string | null
          description?: string | null
          id?: string
          service_name: string
        }
        Update: {
          created_at?: string | null
          dentist_id?: string | null
          description?: string | null
          id?: string
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "dentist_services_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "dentists"
            referencedColumns: ["id"]
          },
        ]
      }
      dentists: {
        Row: {
          address: string | null
          clinic_id: string | null
          clinic_name: string
          created_at: string | null
          description: string | null
          email: string | null
          has_review: boolean | null
          id: string
          is_premium: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          phone: string | null
          review_person: string | null
          review_quote: string | null
          review_rating: number | null
          review_text: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          clinic_id?: string | null
          clinic_name: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          has_review?: boolean | null
          id?: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          phone?: string | null
          review_person?: string | null
          review_quote?: string | null
          review_rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          clinic_id?: string | null
          clinic_name?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          has_review?: boolean | null
          id?: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          phone?: string | null
          review_person?: string | null
          review_quote?: string | null
          review_rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          condition_id: string | null
          created_at: string | null
          id: string
          recommendation_text: string
          severity_level: number
          telemedicine_option: boolean | null
        }
        Insert: {
          condition_id?: string | null
          created_at?: string | null
          id?: string
          recommendation_text: string
          severity_level: number
          telemedicine_option?: boolean | null
        }
        Update: {
          condition_id?: string | null
          created_at?: string | null
          id?: string
          recommendation_text?: string
          severity_level?: number
          telemedicine_option?: boolean | null
        }
        Relationships: []
      }
      symptom_conditions: {
        Row: {
          condition_name: string
          created_at: string | null
          id: string
          probability: number | null
          requires_emergency: boolean | null
          severity_level: number | null
          symptom_id: string | null
        }
        Insert: {
          condition_name: string
          created_at?: string | null
          id?: string
          probability?: number | null
          requires_emergency?: boolean | null
          severity_level?: number | null
          symptom_id?: string | null
        }
        Update: {
          condition_name?: string
          created_at?: string | null
          id?: string
          probability?: number | null
          requires_emergency?: boolean | null
          severity_level?: number | null
          symptom_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "symptom_conditions_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptoms"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_conditions_treatments: {
        Row: {
          condition_id: string | null
          created_at: string | null
          id: string
          priority: number | null
          requires_prescription: boolean | null
          treatment_description: string | null
          treatment_name: string
          treatment_type: string
        }
        Insert: {
          condition_id?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          requires_prescription?: boolean | null
          treatment_description?: string | null
          treatment_name: string
          treatment_type: string
        }
        Update: {
          condition_id?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          requires_prescription?: boolean | null
          treatment_description?: string | null
          treatment_name?: string
          treatment_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_conditions_treatments_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "symptoms_conditions"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_factors: {
        Row: {
          created_at: string | null
          factor_type: string
          factor_value: Json | null
          id: string
          symptom_id: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          factor_type: string
          factor_value?: Json | null
          id?: string
          symptom_id?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          factor_type?: string
          factor_value?: Json | null
          id?: string
          symptom_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "symptom_factors_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptoms"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_question_groups: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      symptom_questions: {
        Row: {
          conditional_logic: Json | null
          created_at: string | null
          group_id: string | null
          help_text: string | null
          id: string
          options: Json | null
          order: number
          question_text: string
          question_type: string | null
          required: boolean | null
          skip_logic: Json | null
          symptom_id: string | null
          validation_rules: Json | null
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string | null
          group_id?: string | null
          help_text?: string | null
          id?: string
          options?: Json | null
          order: number
          question_text: string
          question_type?: string | null
          required?: boolean | null
          skip_logic?: Json | null
          symptom_id?: string | null
          validation_rules?: Json | null
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string | null
          group_id?: string | null
          help_text?: string | null
          id?: string
          options?: Json | null
          order?: number
          question_text?: string
          question_type?: string | null
          required?: boolean | null
          skip_logic?: Json | null
          symptom_id?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "symptom_questions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "symptom_question_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptom_questions_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptoms"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_severity_rules: {
        Row: {
          condition_id: string | null
          created_at: string | null
          id: string
          rule_criteria: Json
          rule_type: string
          severity_modifier: number
        }
        Insert: {
          condition_id?: string | null
          created_at?: string | null
          id?: string
          rule_criteria: Json
          rule_type: string
          severity_modifier: number
        }
        Update: {
          condition_id?: string | null
          created_at?: string | null
          id?: string
          rule_criteria?: Json
          rule_type?: string
          severity_modifier?: number
        }
        Relationships: [
          {
            foreignKeyName: "symptom_severity_rules_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "symptoms_conditions"
            referencedColumns: ["id"]
          },
        ]
      }
      symptoms: {
        Row: {
          age_specific: boolean | null
          body_region: string
          common_triggers: Json | null
          created_at: string | null
          description: string | null
          duration_relevance: boolean | null
          follow_up_questions: Json | null
          gender_specific: boolean | null
          id: string
          name: string
          prevention_tips: Json | null
          severity_level: number
          typical_duration: string | null
          warning_signs: Json | null
        }
        Insert: {
          age_specific?: boolean | null
          body_region: string
          common_triggers?: Json | null
          created_at?: string | null
          description?: string | null
          duration_relevance?: boolean | null
          follow_up_questions?: Json | null
          gender_specific?: boolean | null
          id?: string
          name: string
          prevention_tips?: Json | null
          severity_level?: number
          typical_duration?: string | null
          warning_signs?: Json | null
        }
        Update: {
          age_specific?: boolean | null
          body_region?: string
          common_triggers?: Json | null
          created_at?: string | null
          description?: string | null
          duration_relevance?: boolean | null
          follow_up_questions?: Json | null
          gender_specific?: boolean | null
          id?: string
          name?: string
          prevention_tips?: Json | null
          severity_level?: number
          typical_duration?: string | null
          warning_signs?: Json | null
        }
        Relationships: []
      }
      symptoms_conditions: {
        Row: {
          condition_name: string
          created_at: string | null
          id: string
          probability: number | null
          requires_emergency: boolean | null
          severity_level: number | null
          symptom_id: string | null
        }
        Insert: {
          condition_name: string
          created_at?: string | null
          id?: string
          probability?: number | null
          requires_emergency?: boolean | null
          severity_level?: number | null
          symptom_id?: string | null
        }
        Update: {
          condition_name?: string
          created_at?: string | null
          id?: string
          probability?: number | null
          requires_emergency?: boolean | null
          severity_level?: number | null
          symptom_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "symptoms_conditions_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptoms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_symptom_checks: {
        Row: {
          answers: Json | null
          created_at: string | null
          id: string
          recommendation_id: string | null
          severity_level: number
          symptom_id: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          id?: string
          recommendation_id?: string | null
          severity_level?: number
          symptom_id?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          id?: string
          recommendation_id?: string | null
          severity_level?: number
          symptom_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_symptom_checks_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_symptom_checks_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptoms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hash_password: {
        Args: {
          password: string
        }
        Returns: string
      }
      verify_password: {
        Args: {
          password: string
          hashed_password: string
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
