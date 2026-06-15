export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          profile: "ADMIN" | "SUPERVISOR" | "RECEPCAO" | "AT1" | "AT2";
          is_master: boolean;
          professional_council: string | null;
          professional_role: string | null;
          birth_date: string | null;
          cpf: string | null;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          profile: "ADMIN" | "SUPERVISOR" | "RECEPCAO" | "AT1" | "AT2";
          is_master?: boolean;
          professional_council?: string | null;
          professional_role?: string | null;
          birth_date?: string | null;
          cpf?: string | null;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          profile?: "ADMIN" | "SUPERVISOR" | "RECEPCAO" | "AT1" | "AT2";
          is_master?: boolean;
          professional_council?: string | null;
          professional_role?: string | null;
          birth_date?: string | null;
          cpf?: string | null;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string | null;
          guardian_name: string | null;
          guardian_phone: string | null;
          guardian_email: string | null;
          diagnosis: string | null;
          cpf: string | null;
          notes: string | null;
          status: "active" | "inactive" | "discharged";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date?: string | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          guardian_email?: string | null;
          diagnosis?: string | null;
          cpf?: string | null;
          notes?: string | null;
          status?: "active" | "inactive" | "discharged";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          guardian_email?: string | null;
          diagnosis?: string | null;
          cpf?: string | null;
          notes?: string | null;
          status?: "active" | "inactive" | "discharged";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      evaluations: {
        Row: {
          id: string;
          patient_id: string;
          title: string;
          instrument: string | null;
          evaluation_date: string;
          content_html: string;
          status: "draft" | "finalized";
          professional_name: string;
          professional_role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          title: string;
          instrument?: string | null;
          evaluation_date: string;
          content_html?: string;
          status?: "draft" | "finalized";
          professional_name: string;
          professional_role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          title?: string;
          instrument?: string | null;
          evaluation_date?: string;
          content_html?: string;
          status?: "draft" | "finalized";
          professional_name?: string;
          professional_role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      therapeutic_plans: {
        Row: {
          id: string;
          patient_id: string;
          title: string;
          goals_html: string;
          strategies_html: string;
          start_date: string;
          end_date: string | null;
          status: "draft" | "active" | "completed" | "archived";
          professional_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          title: string;
          goals_html?: string;
          strategies_html?: string;
          start_date: string;
          end_date?: string | null;
          status?: "draft" | "active" | "completed" | "archived";
          professional_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          title?: string;
          goals_html?: string;
          strategies_html?: string;
          start_date?: string;
          end_date?: string | null;
          status?: "draft" | "active" | "completed" | "archived";
          professional_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patient_documents: {
        Row: {
          id: string;
          patient_id: string;
          title: string;
          document_type: string;
          file_url: string | null;
          notes: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          title: string;
          document_type?: string;
          file_url?: string | null;
          notes?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          title?: string;
          document_type?: string;
          file_url?: string | null;
          notes?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      clinical_evolution_records: {
        Row: {
          id: string;
          patient_id: string;
          patient_name: string;
          session_date: string;
          content_html: string;
          status: "draft" | "finalized";
          professional_name: string;
          professional_role: string;
          professional_council: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          patient_name: string;
          session_date: string;
          content_html?: string;
          status?: "draft" | "finalized";
          professional_name: string;
          professional_role: string;
          professional_council?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          patient_name?: string;
          session_date?: string;
          content_html?: string;
          status?: "draft" | "finalized";
          professional_name?: string;
          professional_role?: string;
          professional_council?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agenda_audit_logs: {
        Row: {
          id: string;
          performed_at: string;
          user_name: string;
          user_profile: string;
          action_label: string;
          patient_name: string;
          from_description: string;
          to_description: string;
          appointment_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          performed_at?: string;
          user_name: string;
          user_profile: string;
          action_label: string;
          patient_name: string;
          from_description: string;
          to_description: string;
          appointment_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          performed_at?: string;
          user_name?: string;
          user_profile?: string;
          action_label?: string;
          patient_name?: string;
          from_description?: string;
          to_description?: string;
          appointment_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      internal_messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      internal_notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "patient_waiting" | "new_message";
          title: string;
          body: string;
          metadata: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "patient_waiting" | "new_message";
          title: string;
          body: string;
          metadata?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "patient_waiting" | "new_message";
          title?: string;
          body?: string;
          metadata?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_presence: {
        Row: {
          user_id: string;
          last_seen_at: string;
        };
        Insert: {
          user_id: string;
          last_seen_at?: string;
        };
        Update: {
          user_id?: string;
          last_seen_at?: string;
        };
        Relationships: [];
      };
      agenda_events: {
        Row: {
          id: string;
          patient_name: string;
          patient_id: string | null;
          professional_name: string;
          professional_user_id: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          status: "confirmado" | "agendado" | "em_espera" | "cancelado";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          patient_name: string;
          patient_id?: string | null;
          professional_name: string;
          professional_user_id?: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          status?: "confirmado" | "agendado" | "em_espera" | "cancelado";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_name?: string;
          patient_id?: string | null;
          professional_name?: string;
          professional_user_id?: string | null;
          event_date?: string;
          start_time?: string;
          end_time?: string;
          status?: "confirmado" | "agendado" | "em_espera" | "cancelado";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assessment_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          evaluation_type: "acquisition" | "reduction";
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          evaluation_type?: "acquisition" | "reduction";
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          evaluation_type?: "acquisition" | "reduction";
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assessment_levels: {
        Row: {
          id: string;
          template_id: string;
          code: string;
          sort_order: number;
          description: string;
          age_range: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          code: string;
          sort_order: number;
          description: string;
          age_range?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          code?: string;
          sort_order?: number;
          description?: string;
          age_range?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      assessment_skills: {
        Row: {
          id: string;
          template_id: string;
          code: string;
          sort_order: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          code: string;
          sort_order: number;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          code?: string;
          sort_order?: number;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      assessment_score_groups: {
        Row: {
          id: string;
          template_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      assessment_scores: {
        Row: {
          id: string;
          template_id: string;
          group_id: string;
          code: string;
          sort_order: number;
          score_type: string | null;
          description: string;
          value: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          group_id: string;
          code: string;
          sort_order: number;
          score_type?: string | null;
          description: string;
          value?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          group_id?: string;
          code?: string;
          sort_order?: number;
          score_type?: string | null;
          description?: string;
          value?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

export type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

export type EvaluationRow = Database["public"]["Tables"]["evaluations"]["Row"];

export type TherapeuticPlanRow =
  Database["public"]["Tables"]["therapeutic_plans"]["Row"];

export type PatientDocumentRow =
  Database["public"]["Tables"]["patient_documents"]["Row"];

export type ClinicalEvolutionRecordRow =
  Database["public"]["Tables"]["clinical_evolution_records"]["Row"];

export type AgendaAuditLogRow =
  Database["public"]["Tables"]["agenda_audit_logs"]["Row"];

export type AgendaAuditLogInsert =
  Database["public"]["Tables"]["agenda_audit_logs"]["Insert"];

export type InternalMessageRow =
  Database["public"]["Tables"]["internal_messages"]["Row"];

export type InternalNotificationRow =
  Database["public"]["Tables"]["internal_notifications"]["Row"];

export type UserPresenceRow =
  Database["public"]["Tables"]["user_presence"]["Row"];

export type AgendaEventRow =
  Database["public"]["Tables"]["agenda_events"]["Row"];

export type AssessmentTemplateRow =
  Database["public"]["Tables"]["assessment_templates"]["Row"];

export type AssessmentLevelRow =
  Database["public"]["Tables"]["assessment_levels"]["Row"];

export type AssessmentSkillRow =
  Database["public"]["Tables"]["assessment_skills"]["Row"];

export type AssessmentScoreGroupRow =
  Database["public"]["Tables"]["assessment_score_groups"]["Row"];

export type AssessmentScoreRow =
  Database["public"]["Tables"]["assessment_scores"]["Row"];
