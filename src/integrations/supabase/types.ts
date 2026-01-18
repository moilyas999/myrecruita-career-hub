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
      admin_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
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
      automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          priority: number | null
          trigger_config: Json
          trigger_count: number | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          priority?: number | null
          trigger_config?: Json
          trigger_count?: number | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          priority?: number | null
          trigger_config?: Json
          trigger_count?: number | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: string | null
          related_client_id: string | null
          related_cv_id: string | null
          related_job_id: string | null
          related_pipeline_id: string | null
          rule_id: string | null
          status: string | null
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          related_client_id?: string | null
          related_cv_id?: string | null
          related_job_id?: string | null
          related_pipeline_id?: string | null
          rule_id?: string | null
          status?: string | null
          task_type?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          related_client_id?: string | null
          related_cv_id?: string | null
          related_job_id?: string | null
          related_pipeline_id?: string | null
          rule_id?: string | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_tasks_related_client_id_fkey"
            columns: ["related_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_tasks_related_cv_id_fkey"
            columns: ["related_cv_id"]
            isOneToOne: false
            referencedRelation: "cv_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_tasks_related_job_id_fkey"
            columns: ["related_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_tasks_related_pipeline_id_fkey"
            columns: ["related_pipeline_id"]
            isOneToOne: false
            referencedRelation: "candidate_pipeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_tasks_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_available: boolean | null
          is_recurring: boolean | null
          specific_date: string | null
          start_time: string
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          specific_date?: string | null
          start_time: string
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          specific_date?: string | null
          start_time?: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
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
          error_category: string | null
          error_message: string | null
          file_name: string
          file_path: string
          file_size_bytes: number | null
          file_url: string
          id: string
          parsed_data: Json | null
          processed_at: string | null
          processing_started_at: string | null
          retry_count: number | null
          session_id: string
          status: string
        }
        Insert: {
          created_at?: string
          cv_submission_id?: string | null
          error_category?: string | null
          error_message?: string | null
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          file_url: string
          id?: string
          parsed_data?: Json | null
          processed_at?: string | null
          processing_started_at?: string | null
          retry_count?: number | null
          session_id: string
          status?: string
        }
        Update: {
          created_at?: string
          cv_submission_id?: string | null
          error_category?: string | null
          error_message?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          parsed_data?: Json | null
          processed_at?: string | null
          processing_started_at?: string | null
          retry_count?: number | null
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
          avg_parse_time_ms: number | null
          batch_size: number | null
          completed_at: string | null
          created_at: string
          error_breakdown: Json | null
          error_message: string | null
          failed_count: number
          id: string
          imported_count: number
          last_heartbeat: string | null
          parsed_count: number
          processing_file_id: string | null
          started_at: string | null
          status: string
          total_files: number
          total_retry_count: number | null
          user_email: string
          user_id: string
        }
        Insert: {
          avg_parse_time_ms?: number | null
          batch_size?: number | null
          completed_at?: string | null
          created_at?: string
          error_breakdown?: Json | null
          error_message?: string | null
          failed_count?: number
          id?: string
          imported_count?: number
          last_heartbeat?: string | null
          parsed_count?: number
          processing_file_id?: string | null
          started_at?: string | null
          status?: string
          total_files?: number
          total_retry_count?: number | null
          user_email: string
          user_id: string
        }
        Update: {
          avg_parse_time_ms?: number | null
          batch_size?: number | null
          completed_at?: string | null
          created_at?: string
          error_breakdown?: Json | null
          error_message?: string | null
          failed_count?: number
          id?: string
          imported_count?: number
          last_heartbeat?: string | null
          parsed_count?: number
          processing_file_id?: string | null
          started_at?: string | null
          status?: string
          total_files?: number
          total_retry_count?: number | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_connections: {
        Row: {
          access_token_encrypted: string | null
          calendar_id: string | null
          calendar_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          provider: string
          refresh_token_encrypted: string | null
          sync_error: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          sync_error?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          provider?: string
          refresh_token_encrypted?: string | null
          sync_error?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          assigned_to: string | null
          cancellation_reason: string | null
          candidate_id: string | null
          client_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string
          event_type: string
          google_calendar_id: string | null
          google_event_id: string | null
          id: string
          is_cancelled: boolean | null
          job_id: string | null
          location: string | null
          meeting_link: string | null
          metadata: Json | null
          pipeline_id: string | null
          reminder_1h_sent: boolean | null
          reminder_24h_sent: boolean | null
          reminder_sent: boolean | null
          start_time: string
          sync_status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          cancellation_reason?: string | null
          candidate_id?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time: string
          event_type: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          is_cancelled?: boolean | null
          job_id?: string | null
          location?: string | null
          meeting_link?: string | null
          metadata?: Json | null
          pipeline_id?: string | null
          reminder_1h_sent?: boolean | null
          reminder_24h_sent?: boolean | null
          reminder_sent?: boolean | null
          start_time: string
          sync_status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          cancellation_reason?: string | null
          candidate_id?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string
          event_type?: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          is_cancelled?: boolean | null
          job_id?: string | null
          location?: string | null
          meeting_link?: string | null
          metadata?: Json | null
          pipeline_id?: string | null
          reminder_1h_sent?: boolean | null
          reminder_24h_sent?: boolean | null
          reminder_sent?: boolean | null
          start_time?: string
          sync_status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "cv_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "candidate_pipeline"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_pipeline: {
        Row: {
          assigned_to: string | null
          created_at: string
          cv_submission_id: string
          id: string
          interview_feedback: string | null
          interview_scheduled_at: string | null
          job_id: string
          notes: string | null
          offer_details: Json | null
          priority: number | null
          rejection_reason: string | null
          salary_confirmed: number | null
          stage: string
          stage_entered_at: string | null
          stage_requirements_met: Json | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          cv_submission_id: string
          id?: string
          interview_feedback?: string | null
          interview_scheduled_at?: string | null
          job_id: string
          notes?: string | null
          offer_details?: Json | null
          priority?: number | null
          rejection_reason?: string | null
          salary_confirmed?: number | null
          stage?: string
          stage_entered_at?: string | null
          stage_requirements_met?: Json | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          cv_submission_id?: string
          id?: string
          interview_feedback?: string | null
          interview_scheduled_at?: string | null
          job_id?: string
          notes?: string | null
          offer_details?: Json | null
          priority?: number | null
          rejection_reason?: string | null
          salary_confirmed?: number | null
          stage?: string
          stage_entered_at?: string | null
          stage_requirements_met?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_pipeline_cv_submission_id_fkey"
            columns: ["cv_submission_id"]
            isOneToOne: false
            referencedRelation: "cv_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pipeline_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
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
      client_contacts: {
        Row: {
          client_id: string
          created_at: string
          department: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_billing_contact: boolean | null
          is_primary: boolean | null
          job_title: string | null
          last_contact_at: string | null
          linkedin_url: string | null
          mobile: string | null
          name: string
          notes: string | null
          phone: string | null
          preferred_contact_method:
            | Database["public"]["Enums"]["contact_method"]
            | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_billing_contact?: boolean | null
          is_primary?: boolean | null
          job_title?: string | null
          last_contact_at?: string | null
          linkedin_url?: string | null
          mobile?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_contact_method?:
            | Database["public"]["Enums"]["contact_method"]
            | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_billing_contact?: boolean | null
          is_primary?: boolean | null
          job_title?: string | null
          last_contact_at?: string | null
          linkedin_url?: string | null
          mobile?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_contact_method?:
            | Database["public"]["Enums"]["contact_method"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_interactions: {
        Row: {
          client_id: string
          contact_id: string | null
          created_at: string
          created_by: string | null
          direction: Database["public"]["Enums"]["interaction_direction"] | null
          duration_minutes: number | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          outcome: string | null
          subject: string | null
          summary: string | null
        }
        Insert: {
          client_id: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          direction?:
            | Database["public"]["Enums"]["interaction_direction"]
            | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          outcome?: string | null
          subject?: string | null
          summary?: string | null
        }
        Update: {
          client_id?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          direction?:
            | Database["public"]["Enums"]["interaction_direction"]
            | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          outcome?: string | null
          subject?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "client_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      client_terms: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          effective_from: string
          effective_until: string | null
          fee_percentage_contract: number | null
          fee_percentage_perm: number | null
          flat_fee: number | null
          id: string
          is_active: boolean | null
          is_exclusive: boolean | null
          job_type: Database["public"]["Enums"]["job_type_enum"] | null
          max_salary_cap: number | null
          min_salary_threshold: number | null
          name: string
          notes: string | null
          payment_terms_days: number | null
          rebate_percentage: number | null
          rebate_period_days: number | null
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_until?: string | null
          fee_percentage_contract?: number | null
          fee_percentage_perm?: number | null
          flat_fee?: number | null
          id?: string
          is_active?: boolean | null
          is_exclusive?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type_enum"] | null
          max_salary_cap?: number | null
          min_salary_threshold?: number | null
          name: string
          notes?: string | null
          payment_terms_days?: number | null
          rebate_percentage?: number | null
          rebate_period_days?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_until?: string | null
          fee_percentage_contract?: number | null
          fee_percentage_perm?: number | null
          flat_fee?: number | null
          id?: string
          is_active?: boolean | null
          is_exclusive?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type_enum"] | null
          max_salary_cap?: number | null
          min_salary_threshold?: number | null
          name?: string
          notes?: string | null
          payment_terms_days?: number | null
          rebate_percentage?: number | null
          rebate_period_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_terms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          account_manager_id: string | null
          address: string | null
          billing_contact_name: string | null
          billing_email: string | null
          city: string | null
          company_name: string
          company_size: Database["public"]["Enums"]["company_size"] | null
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          industry: string | null
          last_contact_at: string | null
          last_placement_at: string | null
          lifetime_revenue: number | null
          logo_url: string | null
          notes: string | null
          postcode: string | null
          psl_achieved_at: string | null
          psl_expires_at: string | null
          psl_notes: string | null
          psl_status: Database["public"]["Enums"]["psl_status"] | null
          secondary_contact_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["client_status"] | null
          total_placements: number | null
          updated_at: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          account_manager_id?: string | null
          address?: string | null
          billing_contact_name?: string | null
          billing_email?: string | null
          city?: string | null
          company_name: string
          company_size?: Database["public"]["Enums"]["company_size"] | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          last_contact_at?: string | null
          last_placement_at?: string | null
          lifetime_revenue?: number | null
          logo_url?: string | null
          notes?: string | null
          postcode?: string | null
          psl_achieved_at?: string | null
          psl_expires_at?: string | null
          psl_notes?: string | null
          psl_status?: Database["public"]["Enums"]["psl_status"] | null
          secondary_contact_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          total_placements?: number | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          account_manager_id?: string | null
          address?: string | null
          billing_contact_name?: string | null
          billing_email?: string | null
          city?: string | null
          company_name?: string
          company_size?: Database["public"]["Enums"]["company_size"] | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          last_contact_at?: string | null
          last_placement_at?: string | null
          lifetime_revenue?: number | null
          logo_url?: string | null
          notes?: string | null
          postcode?: string | null
          psl_achieved_at?: string | null
          psl_expires_at?: string | null
          psl_notes?: string | null
          psl_status?: Database["public"]["Enums"]["psl_status"] | null
          secondary_contact_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          total_placements?: number | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_secondary_contact_id_fkey"
            columns: ["secondary_contact_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      cv_match_history: {
        Row: {
          ai_analyzed_count: number | null
          algo_prescreened_count: number | null
          created_at: string | null
          filters_applied: Json | null
          id: string
          job_description: string
          job_id: string | null
          matched_by: string
          parsed_requirements: Json | null
          processing_time_ms: number | null
          total_candidates_evaluated: number | null
          weights_used: Json | null
        }
        Insert: {
          ai_analyzed_count?: number | null
          algo_prescreened_count?: number | null
          created_at?: string | null
          filters_applied?: Json | null
          id?: string
          job_description: string
          job_id?: string | null
          matched_by: string
          parsed_requirements?: Json | null
          processing_time_ms?: number | null
          total_candidates_evaluated?: number | null
          weights_used?: Json | null
        }
        Update: {
          ai_analyzed_count?: number | null
          algo_prescreened_count?: number | null
          created_at?: string | null
          filters_applied?: Json | null
          id?: string
          job_description?: string
          job_id?: string | null
          matched_by?: string
          parsed_requirements?: Json | null
          processing_time_ms?: number | null
          total_candidates_evaluated?: number | null
          weights_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_match_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_match_results: {
        Row: {
          ai_explanation: string | null
          ai_score: number | null
          algorithmic_score: number | null
          career_trajectory_fit: string | null
          created_at: string | null
          cv_id: string
          final_score: number
          fit_concerns: string[] | null
          id: string
          interview_questions: string[] | null
          match_history_id: string
          outcome: string | null
          outcome_at: string | null
          outcome_notes: string | null
          overqualification_risk: string | null
          salary_expectation_fit: string | null
          shortlisted: boolean | null
          shortlisted_at: string | null
          skills_matched: string[] | null
          skills_missing: string[] | null
          skills_partial: string[] | null
          strengths: string[] | null
          submitted_at: string | null
          submitted_to_client: boolean | null
        }
        Insert: {
          ai_explanation?: string | null
          ai_score?: number | null
          algorithmic_score?: number | null
          career_trajectory_fit?: string | null
          created_at?: string | null
          cv_id: string
          final_score: number
          fit_concerns?: string[] | null
          id?: string
          interview_questions?: string[] | null
          match_history_id: string
          outcome?: string | null
          outcome_at?: string | null
          outcome_notes?: string | null
          overqualification_risk?: string | null
          salary_expectation_fit?: string | null
          shortlisted?: boolean | null
          shortlisted_at?: string | null
          skills_matched?: string[] | null
          skills_missing?: string[] | null
          skills_partial?: string[] | null
          strengths?: string[] | null
          submitted_at?: string | null
          submitted_to_client?: boolean | null
        }
        Update: {
          ai_explanation?: string | null
          ai_score?: number | null
          algorithmic_score?: number | null
          career_trajectory_fit?: string | null
          created_at?: string | null
          cv_id?: string
          final_score?: number
          fit_concerns?: string[] | null
          id?: string
          interview_questions?: string[] | null
          match_history_id?: string
          outcome?: string | null
          outcome_at?: string | null
          outcome_notes?: string | null
          overqualification_risk?: string | null
          salary_expectation_fit?: string | null
          shortlisted?: boolean | null
          shortlisted_at?: string | null
          skills_matched?: string[] | null
          skills_missing?: string[] | null
          skills_partial?: string[] | null
          strengths?: string[] | null
          submitted_at?: string | null
          submitted_to_client?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_match_results_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cv_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cv_match_results_match_history_id_fkey"
            columns: ["match_history_id"]
            isOneToOne: false
            referencedRelation: "cv_match_history"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_submissions: {
        Row: {
          added_by: string | null
          admin_notes: string | null
          ai_profile: Json | null
          anonymised_at: string | null
          available_from: string | null
          consent_expires_at: string | null
          consent_given_at: string | null
          created_at: string
          current_salary: string | null
          cv_file_url: string | null
          cv_score: number | null
          cv_score_breakdown: Json | null
          education_level: string | null
          email: string
          employment_history: Json | null
          experience_summary: string | null
          extraction_confidence: number | null
          extraction_method: string | null
          gdpr_notes: string | null
          id: string
          job_title: string | null
          last_contact_date: string | null
          location: string | null
          message: string | null
          name: string
          notice_period: string | null
          parse_correlation_id: string | null
          phone: string
          potential_duplicate_of: string | null
          processed_at: string | null
          processed_by: string | null
          professional_memberships: string[] | null
          qualifications: Json | null
          requires_sponsorship: boolean | null
          right_to_work: string | null
          role_changes_5yr: number | null
          salary_expectation: string | null
          scored_at: string | null
          sector: string | null
          sector_exposure: string[] | null
          seniority_level: string | null
          skills: string | null
          source: string | null
          user_id: string | null
          visa_expiry_date: string | null
          visa_type: string | null
          years_experience: number | null
        }
        Insert: {
          added_by?: string | null
          admin_notes?: string | null
          ai_profile?: Json | null
          anonymised_at?: string | null
          available_from?: string | null
          consent_expires_at?: string | null
          consent_given_at?: string | null
          created_at?: string
          current_salary?: string | null
          cv_file_url?: string | null
          cv_score?: number | null
          cv_score_breakdown?: Json | null
          education_level?: string | null
          email: string
          employment_history?: Json | null
          experience_summary?: string | null
          extraction_confidence?: number | null
          extraction_method?: string | null
          gdpr_notes?: string | null
          id?: string
          job_title?: string | null
          last_contact_date?: string | null
          location?: string | null
          message?: string | null
          name: string
          notice_period?: string | null
          parse_correlation_id?: string | null
          phone: string
          potential_duplicate_of?: string | null
          processed_at?: string | null
          processed_by?: string | null
          professional_memberships?: string[] | null
          qualifications?: Json | null
          requires_sponsorship?: boolean | null
          right_to_work?: string | null
          role_changes_5yr?: number | null
          salary_expectation?: string | null
          scored_at?: string | null
          sector?: string | null
          sector_exposure?: string[] | null
          seniority_level?: string | null
          skills?: string | null
          source?: string | null
          user_id?: string | null
          visa_expiry_date?: string | null
          visa_type?: string | null
          years_experience?: number | null
        }
        Update: {
          added_by?: string | null
          admin_notes?: string | null
          ai_profile?: Json | null
          anonymised_at?: string | null
          available_from?: string | null
          consent_expires_at?: string | null
          consent_given_at?: string | null
          created_at?: string
          current_salary?: string | null
          cv_file_url?: string | null
          cv_score?: number | null
          cv_score_breakdown?: Json | null
          education_level?: string | null
          email?: string
          employment_history?: Json | null
          experience_summary?: string | null
          extraction_confidence?: number | null
          extraction_method?: string | null
          gdpr_notes?: string | null
          id?: string
          job_title?: string | null
          last_contact_date?: string | null
          location?: string | null
          message?: string | null
          name?: string
          notice_period?: string | null
          parse_correlation_id?: string | null
          phone?: string
          potential_duplicate_of?: string | null
          processed_at?: string | null
          processed_by?: string | null
          professional_memberships?: string[] | null
          qualifications?: Json | null
          requires_sponsorship?: boolean | null
          right_to_work?: string | null
          role_changes_5yr?: number | null
          salary_expectation?: string | null
          scored_at?: string | null
          sector?: string | null
          sector_exposure?: string[] | null
          seniority_level?: string | null
          skills?: string | null
          source?: string | null
          user_id?: string | null
          visa_expiry_date?: string | null
          visa_type?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_submissions_potential_duplicate_of_fkey"
            columns: ["potential_duplicate_of"]
            isOneToOne: false
            referencedRelation: "cv_submissions"
            referencedColumns: ["id"]
          },
        ]
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
      interview_scorecards: {
        Row: {
          candidate_questions: string | null
          communication: number | null
          concerns: string | null
          created_at: string | null
          created_by: string | null
          cultural_fit: number | null
          experience_relevance: number | null
          id: string
          interview_date: string | null
          interview_type: string | null
          interviewer_name: string | null
          interviewer_role: string | null
          is_client_feedback: boolean | null
          motivation: number | null
          next_steps: string | null
          notes: string | null
          overall_impression: number | null
          pipeline_id: string
          questions_asked: string | null
          recommendation: string | null
          stage: string
          strengths: string | null
          technical_skills: number | null
          updated_at: string | null
        }
        Insert: {
          candidate_questions?: string | null
          communication?: number | null
          concerns?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_fit?: number | null
          experience_relevance?: number | null
          id?: string
          interview_date?: string | null
          interview_type?: string | null
          interviewer_name?: string | null
          interviewer_role?: string | null
          is_client_feedback?: boolean | null
          motivation?: number | null
          next_steps?: string | null
          notes?: string | null
          overall_impression?: number | null
          pipeline_id: string
          questions_asked?: string | null
          recommendation?: string | null
          stage: string
          strengths?: string | null
          technical_skills?: number | null
          updated_at?: string | null
        }
        Update: {
          candidate_questions?: string | null
          communication?: number | null
          concerns?: string | null
          created_at?: string | null
          created_by?: string | null
          cultural_fit?: number | null
          experience_relevance?: number | null
          id?: string
          interview_date?: string | null
          interview_type?: string | null
          interviewer_name?: string | null
          interviewer_role?: string | null
          is_client_feedback?: boolean | null
          motivation?: number | null
          next_steps?: string | null
          notes?: string | null
          overall_impression?: number | null
          pipeline_id?: string
          questions_asked?: string | null
          recommendation?: string | null
          stage?: string
          strengths?: string | null
          technical_skills?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_scorecards_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "candidate_pipeline"
            referencedColumns: ["id"]
          },
        ]
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
      job_submissions: {
        Row: {
          client_responded_at: string | null
          client_response: string | null
          cv_submission_id: string
          id: string
          job_id: string
          notes: string | null
          rejection_category: string | null
          rejection_reason: string | null
          submitted_at: string
          submitted_by: string | null
        }
        Insert: {
          client_responded_at?: string | null
          client_response?: string | null
          cv_submission_id: string
          id?: string
          job_id: string
          notes?: string | null
          rejection_category?: string | null
          rejection_reason?: string | null
          submitted_at?: string
          submitted_by?: string | null
        }
        Update: {
          client_responded_at?: string | null
          client_response?: string | null
          cv_submission_id?: string
          id?: string
          job_id?: string
          notes?: string | null
          rejection_category?: string | null
          rejection_reason?: string | null
          submitted_at?: string
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_submissions_cv_submission_id_fkey"
            columns: ["cv_submission_id"]
            isOneToOne: false
            referencedRelation: "cv_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          assigned_to: string | null
          benefits: string | null
          client_id: string | null
          closed_at: string | null
          closed_reason: string | null
          created_at: string
          created_by: string | null
          cvs_submitted_count: number | null
          description: string
          exclusivity_expires_at: string | null
          fee_percentage: number | null
          hiring_manager_id: string | null
          id: string
          interviews_scheduled_count: number | null
          job_source: string | null
          job_type_category: Database["public"]["Enums"]["job_type_enum"] | null
          location: string
          offers_made_count: number | null
          placed_at: string | null
          priority: Database["public"]["Enums"]["job_priority"] | null
          reference_id: string
          requirements: string
          revenue_forecast: number | null
          salary: string | null
          sector: string
          status: string
          target_fill_date: string | null
          target_start_date: string | null
          time_to_fill_actual_days: number | null
          time_to_fill_target_days: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          benefits?: string | null
          client_id?: string | null
          closed_at?: string | null
          closed_reason?: string | null
          created_at?: string
          created_by?: string | null
          cvs_submitted_count?: number | null
          description: string
          exclusivity_expires_at?: string | null
          fee_percentage?: number | null
          hiring_manager_id?: string | null
          id?: string
          interviews_scheduled_count?: number | null
          job_source?: string | null
          job_type_category?:
            | Database["public"]["Enums"]["job_type_enum"]
            | null
          location: string
          offers_made_count?: number | null
          placed_at?: string | null
          priority?: Database["public"]["Enums"]["job_priority"] | null
          reference_id: string
          requirements: string
          revenue_forecast?: number | null
          salary?: string | null
          sector: string
          status?: string
          target_fill_date?: string | null
          target_start_date?: string | null
          time_to_fill_actual_days?: number | null
          time_to_fill_target_days?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          benefits?: string | null
          client_id?: string | null
          closed_at?: string | null
          closed_reason?: string | null
          created_at?: string
          created_by?: string | null
          cvs_submitted_count?: number | null
          description?: string
          exclusivity_expires_at?: string | null
          fee_percentage?: number | null
          hiring_manager_id?: string | null
          id?: string
          interviews_scheduled_count?: number | null
          job_source?: string | null
          job_type_category?:
            | Database["public"]["Enums"]["job_type_enum"]
            | null
          location?: string
          offers_made_count?: number | null
          placed_at?: string | null
          priority?: Database["public"]["Enums"]["job_priority"] | null
          reference_id?: string
          requirements?: string
          revenue_forecast?: number | null
          salary?: string | null
          sector?: string
          status?: string
          target_fill_date?: string | null
          target_start_date?: string | null
          time_to_fill_actual_days?: number | null
          time_to_fill_target_days?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_hiring_manager_id_fkey"
            columns: ["hiring_manager_id"]
            isOneToOne: false
            referencedRelation: "client_contacts"
            referencedColumns: ["id"]
          },
        ]
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
      parse_analytics: {
        Row: {
          ai_model: string
          confidence_scores: Json | null
          correlation_id: string
          created_at: string
          errors: string[] | null
          extracted_fields: Json | null
          extraction_method: string
          file_name: string
          file_size_bytes: number
          file_type: string
          id: string
          parse_time_ms: number
          retry_count: number
          success: boolean
          text_length: number
          warnings: string[] | null
        }
        Insert: {
          ai_model?: string
          confidence_scores?: Json | null
          correlation_id: string
          created_at?: string
          errors?: string[] | null
          extracted_fields?: Json | null
          extraction_method?: string
          file_name: string
          file_size_bytes?: number
          file_type: string
          id?: string
          parse_time_ms?: number
          retry_count?: number
          success?: boolean
          text_length?: number
          warnings?: string[] | null
        }
        Update: {
          ai_model?: string
          confidence_scores?: Json | null
          correlation_id?: string
          created_at?: string
          errors?: string[] | null
          extracted_fields?: Json | null
          extraction_method?: string
          file_name?: string
          file_size_bytes?: number
          file_type?: string
          id?: string
          parse_time_ms?: number
          retry_count?: number
          success?: boolean
          text_length?: number
          warnings?: string[] | null
        }
        Relationships: []
      }
      pipeline_activity: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          from_stage: string | null
          id: string
          note: string | null
          pipeline_id: string
          to_stage: string | null
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          from_stage?: string | null
          id?: string
          note?: string | null
          pipeline_id: string
          to_stage?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          from_stage?: string | null
          id?: string
          note?: string | null
          pipeline_id?: string
          to_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_activity_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "candidate_pipeline"
            referencedColumns: ["id"]
          },
        ]
      }
      placements: {
        Row: {
          actual_start_date: string | null
          candidate_name: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          day_rate: number | null
          fee_currency: string | null
          fee_percentage: number | null
          fee_value: number | null
          guarantee_expires_at: string | null
          guarantee_period_days: number | null
          id: string
          internal_notes: string | null
          invoice_date: string | null
          invoice_number: string | null
          invoice_paid: boolean | null
          invoice_paid_at: string | null
          invoice_raised: boolean | null
          invoice_raised_at: string | null
          job_title: string | null
          job_type: string
          notes: string | null
          payment_terms_days: number | null
          pipeline_id: string
          placed_by: string | null
          rebate_amount: number | null
          rebate_percentage: number | null
          rebate_reason: string | null
          rebate_trigger_date: string | null
          rebate_triggered: boolean | null
          salary: number | null
          sourced_by: string | null
          split_percentage: number | null
          split_with: string | null
          start_date: string
          status: string | null
          status_changed_at: string | null
          updated_at: string | null
        }
        Insert: {
          actual_start_date?: string | null
          candidate_name?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          day_rate?: number | null
          fee_currency?: string | null
          fee_percentage?: number | null
          fee_value?: number | null
          guarantee_expires_at?: string | null
          guarantee_period_days?: number | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_paid?: boolean | null
          invoice_paid_at?: string | null
          invoice_raised?: boolean | null
          invoice_raised_at?: string | null
          job_title?: string | null
          job_type?: string
          notes?: string | null
          payment_terms_days?: number | null
          pipeline_id: string
          placed_by?: string | null
          rebate_amount?: number | null
          rebate_percentage?: number | null
          rebate_reason?: string | null
          rebate_trigger_date?: string | null
          rebate_triggered?: boolean | null
          salary?: number | null
          sourced_by?: string | null
          split_percentage?: number | null
          split_with?: string | null
          start_date: string
          status?: string | null
          status_changed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_start_date?: string | null
          candidate_name?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          day_rate?: number | null
          fee_currency?: string | null
          fee_percentage?: number | null
          fee_value?: number | null
          guarantee_expires_at?: string | null
          guarantee_period_days?: number | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_paid?: boolean | null
          invoice_paid_at?: string | null
          invoice_raised?: boolean | null
          invoice_raised_at?: string | null
          job_title?: string | null
          job_type?: string
          notes?: string | null
          payment_terms_days?: number | null
          pipeline_id?: string
          placed_by?: string | null
          rebate_amount?: number | null
          rebate_percentage?: number | null
          rebate_reason?: string | null
          rebate_trigger_date?: string | null
          rebate_triggered?: boolean | null
          salary?: number | null
          sourced_by?: string | null
          split_percentage?: number | null
          split_with?: string | null
          start_date?: string
          status?: string | null
          status_changed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placements_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: true
            referencedRelation: "candidate_pipeline"
            referencedColumns: ["id"]
          },
        ]
      }
      rejection_reasons: {
        Row: {
          category: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          is_candidate_rejection: boolean | null
          reason: string
        }
        Insert: {
          category: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_candidate_rejection?: boolean | null
          reason: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_candidate_rejection?: boolean | null
          reason?: string
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
          managed_by: string | null
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
          managed_by?: string | null
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
          managed_by?: string | null
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
      get_match_success_rate: {
        Args: { days_back?: number; recruiter_id: string }
        Returns: {
          placements: number
          success_rate: number
          total_matches: number
        }[]
      }
      get_successful_skill_patterns: {
        Args: { min_placements?: number }
        Returns: {
          avg_final_score: number
          placements: number
          skill_combination: string[]
        }[]
      }
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
      client_status: "active" | "prospect" | "inactive" | "do_not_contact"
      company_size: "startup" | "sme" | "enterprise" | "multinational"
      contact_method: "email" | "phone" | "mobile"
      interaction_direction: "inbound" | "outbound"
      interaction_type:
        | "call"
        | "email"
        | "meeting"
        | "linkedin"
        | "note"
        | "proposal"
      job_priority: "low" | "medium" | "high" | "urgent"
      job_type_enum: "permanent" | "contract" | "temp" | "ftc"
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
        | "matching.view"
        | "matching.create"
        | "matching.history"
        | "clients.view"
        | "clients.create"
        | "clients.update"
        | "clients.delete"
        | "reports.view"
        | "reports.export"
        | "automation.view"
        | "automation.manage"
        | "calendar.view"
        | "calendar.sync"
      psl_status:
        | "target"
        | "applied"
        | "approved"
        | "active"
        | "lapsed"
        | "declined"
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
      client_status: ["active", "prospect", "inactive", "do_not_contact"],
      company_size: ["startup", "sme", "enterprise", "multinational"],
      contact_method: ["email", "phone", "mobile"],
      interaction_direction: ["inbound", "outbound"],
      interaction_type: [
        "call",
        "email",
        "meeting",
        "linkedin",
        "note",
        "proposal",
      ],
      job_priority: ["low", "medium", "high", "urgent"],
      job_type_enum: ["permanent", "contract", "temp", "ftc"],
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
        "matching.view",
        "matching.create",
        "matching.history",
        "clients.view",
        "clients.create",
        "clients.update",
        "clients.delete",
        "reports.view",
        "reports.export",
        "automation.view",
        "automation.manage",
        "calendar.view",
        "calendar.sync",
      ],
      psl_status: [
        "target",
        "applied",
        "approved",
        "active",
        "lapsed",
        "declined",
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
