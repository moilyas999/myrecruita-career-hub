export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          created_at: string
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_name: string
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_name?: string
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_name?: string
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      bulk_import_files: {
        Row: {
          created_at: string
          cv_submission_id: string | null
          error_message: string | null
          file_name: string
          file_path: string
          file_url: string
          id: string
          parsed_data: Json | null
          processed_at: string | null
          session_id: string
          status: string
        }
        Insert: {
          created_at?: string
          cv_submission_id?: string | null
          error_message?: string | null
          file_name: string
          file_path: string
          file_url: string
          id?: string
          parsed_data?: Json | null
          processed_at?: string | null
          session_id: string
          status?: string
        }
        Update: {
          created_at?: string
          cv_submission_id?: string | null
          error_message?: string | null
          file_name?: string
          file_path?: string
          file_url?: string
          id?: string
          parsed_data?: Json | null
          processed_at?: string | null
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_import_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "bulk_import_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_import_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          failed_count: number
          id: string
          imported_count: number
          parsed_count: number
          started_at: string | null
          status: string
          total_files: number
          user_email: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          failed_count?: number
          id?: string
          imported_count?: number
          parsed_count?: number
          started_at?: string | null
          status?: string
          total_files?: number
          user_email: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          failed_count?: number
          id?: string
          imported_count?: number
          parsed_count?: number
          started_at?: string | null
          status?: string
          total_files?: number
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      career_partner_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          service_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          service_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          service_type?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          inquiry_type: string
          message: string
          name: string
          phone: string | null
          subject: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          inquiry_type: string
          message: string
          name: string
          phone?: string | null
          subject: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      cv_submissions: {
        Row: {
          added_by: string | null
          admin_notes: string | null
          ai_profile: Json | null
          created_at: string
          cv_file_url: string | null
          cv_score: number | null
          cv_score_breakdown: Json | null
          education_level: string | null
          email: string
          experience_summary: string | null
          id: string
          job_title: string | null
          location: string | null
          message: string | null
          name: string
          phone: string
          scored_at: string | null
          sector: string | null
          seniority_level: string | null
          skills: string | null
          source: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          added_by?: string | null
          admin_notes?: string | null
          ai_profile?: Json | null
          created_at?: string
          cv_file_url?: string | null
          cv_score?: number | null
          cv_score_breakdown?: Json | null
          education_level?: string | null
          email: string
          experience_summary?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          message?: string | null
          name: string
          phone: string
          scored_at?: string | null
          sector?: string | null
          seniority_level?: string | null
          skills?: string | null
          source?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          added_by?: string | null
          admin_notes?: string | null
          ai_profile?: Json | null
          created_at?: string
          cv_file_url?: string | null
          cv_score?: number | null
          cv_score_breakdown?: Json | null
          education_level?: string | null
          email?: string
          experience_summary?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          message?: string | null
          name?: string
          phone?: string
          scored_at?: string | null
          sector?: string | null
          seniority_level?: string | null
          skills?: string | null
          source?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      cv_upload_activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      email_ingestion_log: {
        Row: {
          created_at: string
          email_type: string | null
          error_message: string | null
          filter_reason: string | null
          from_email: string
          from_name: string | null
          id: string
          is_relevant: boolean | null
          job_status_update_id: string | null
          message_id: string
          processed_at: string | null
          received_at: string
          status: string
          subject: string | null
          to_email: string
        }
        Insert: {
          created_at?: string
          email_type?: string | null
          error_message?: string | null
          filter_reason?: string | null
          from_email: string
          from_name?: string | null
          id?: string
          is_relevant?: boolean | null
          job_status_update_id?: string | null
          message_id: string
          processed_at?: string | null
          received_at?: string
          status?: string
          subject?: string | null
          to_email: string
        }
        Update: {
          created_at?: string
          email_type?: string | null
          error_message?: string | null
          filter_reason?: string | null
          from_email?: string
          from_name?: string | null
          id?: string
          is_relevant?: boolean | null
          job_status_update_id?: string | null
          message_id?: string
          processed_at?: string | null
          received_at?: string
          status?: string
          subject?: string | null
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_ingestion_log_job_status_update_id_fkey"
            columns: ["job_status_update_id"]
            isOneToOne: false
            referencedRelation: "job_status_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_job_submissions: {
        Row: {
          company_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          job_description: string
          job_spec_file_url: string | null
          job_title: string
          location: string
          phone: string
          sector: string
        }
        Insert: {
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          job_description: string
          job_spec_file_url?: string | null
          job_title: string
          location: string
          phone: string
          sector: string
        }
        Update: {
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          job_description?: string
          job_spec_file_url?: string | null
          job_title?: string
          location?: string
          phone?: string
          sector?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          created_at: string
          cv_file_url: string | null
          email: string
          id: string
          job_id: string | null
          message: string | null
          name: string
          phone: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          cv_file_url?: string | null
          email: string
          id?: string
          job_id?: string | null
          message?: string | null
          name: string
          phone: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          cv_file_url?: string | null
          email?: string
          id?: string
          job_id?: string | null
          message?: string | null
          name?: string
          phone?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_status_updates: {
        Row: {
          ai_reasoning: string | null
          confidence_score: number
          created_at: string
          created_by: string | null
          email_body: string
          email_from: string | null
          email_message_id: string | null
          email_subject: string | null
          id: string
          job_id: string | null
          job_reference: string | null
          job_title: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: string
          status: string
          suggested_status: string
          updated_at: string
        }
        Insert: {
          ai_reasoning?: string | null
          confidence_score?: number
          created_at?: string
          created_by?: string | null
          email_body: string
          email_from?: string | null
          email_message_id?: string | null
          email_subject?: string | null
          id?: string
          job_id?: string | null
          job_reference?: string | null
          job_title?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: string
          suggested_status?: string
          updated_at?: string
        }
        Update: {
          ai_reasoning?: string | null
          confidence_score?: number
          created_at?: string
          created_by?: string | null
          email_body?: string
          email_from?: string | null
          email_message_id?: string | null
          email_subject?: string | null
          id?: string
          job_id?: string | null
          job_reference?: string | null
          job_title?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: string
          suggested_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_status_updates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          created_at: string
          description: string
          id: string
          location: string
          reference_id: string
          requirements: string
          salary: string | null
          sector: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          created_at?: string
          description: string
          id?: string
          location: string
          reference_id: string
          requirements: string
          salary?: string | null
          sector: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          created_at?: string
          description?: string
          id?: string
          location?: string
          reference_id?: string
          requirements?: string
          salary?: string | null
          sector?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          event_preferences: Json
          id: string
          in_app_enabled: boolean
          push_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          event_preferences?: Json
          id?: string
          in_app_enabled?: boolean
          push_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          event_preferences?: Json
          id?: string
          in_app_enabled?: boolean
          push_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission: Database["public"]["Enums"]["permission_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission: Database["public"]["Enums"]["permission_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["permission_type"]
          user_id?: string
        }
        Relationships: []
      }
      talent_profiles: {
        Row: {
          created_at: string
          details: string | null
          id: string
          is_visible: boolean
          preferred_location: string
          reference_id: string
          role: string
          sector: string
          updated_at: string
          years_experience: number
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          is_visible?: boolean
          preferred_location: string
          reference_id: string
          role: string
          sector: string
          updated_at?: string
          years_experience: number
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          is_visible?: boolean
          preferred_location?: string
          reference_id?: string
          role?: string
          sector?: string
          updated_at?: string
          years_experience?: number
        }
        Relationships: []
      }
      talent_requests: {
        Row: {
          company_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          message: string | null
          talent_id: string | null
        }
        Insert: {
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          talent_id?: string | null
        }
        Update: {
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          talent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_requests_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          cv_file_url: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          cv_file_url?: string | null
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          cv_file_url?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role_permissions: {
        Args: { _role: string; _user_id: string }
        Returns: undefined
      }
      generate_job_reference: { Args: never; Returns: string }
      generate_talent_reference: { Args: never; Returns: string }
      get_admin_role: { Args: { user_id: string }; Returns: string }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["permission_type"][]
      }
      has_permission: {
        Args: {
          _permission: Database["public"]["Enums"]["permission_type"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_full_admin: { Args: { user_id: string }; Returns: boolean }
      sync_notification_event_types: { Args: never; Returns: undefined }
    }
    Enums: {
      permission_type:
        | "cv.view"
        | "cv.create"
        | "cv.update"
        | "cv.delete"
        | "cv.export"
        | "jobs.view"
        | "jobs.create"
        | "jobs.update"
        | "jobs.delete"
        | "applications.view"
        | "applications.manage"
        | "talent.view"
        | "talent.create"
        | "talent.update"
        | "talent.delete"
        | "submissions.view"
        | "submissions.delete"
        | "blog.view"
        | "blog.create"
        | "blog.update"
        | "blog.delete"
        | "analytics.view"
        | "staff.view"
        | "staff.create"
        | "staff.update"
        | "staff.delete"
        | "settings.view"
        | "settings.update"
        | "notifications.manage"
        | "pipeline.view"
        | "pipeline.create"
        | "pipeline.update"
        | "pipeline.delete"
      staff_role:
        | "admin"
        | "recruiter"
        | "account_manager"
        | "marketing"
        | "cv_uploader"
        | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      permission_type: [
        "cv.view",
        "cv.create",
        "cv.update",
        "cv.delete",
        "cv.export",
        "jobs.view",
        "jobs.create",
        "jobs.update",
        "jobs.delete",
        "applications.view",
        "applications.manage",
        "talent.view",
        "talent.create",
        "talent.update",
        "talent.delete",
        "submissions.view",
        "submissions.delete",
        "blog.view",
        "blog.create",
        "blog.update",
        "blog.delete",
        "analytics.view",
        "staff.view",
        "staff.create",
        "staff.update",
        "staff.delete",
        "settings.view",
        "settings.update",
        "notifications.manage",
        "pipeline.view",
        "pipeline.create",
        "pipeline.update",
        "pipeline.delete",
      ],
      staff_role: [
        "admin",
        "recruiter",
        "account_manager",
        "marketing",
        "cv_uploader",
        "viewer",
      ],
    },
  },
} as const
