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
          profile:
            | "ADMIN"
            | "SUPERVISOR"
            | "RECEPCAO"
            | "AT1"
            | "AT2"
            | "FAMILIA";
          is_master: boolean;
          professional_council: string | null;
          professional_role: string | null;
          birth_date: string | null;
          cpf: string | null;
          status: "active" | "inactive";
          patient_id: string | null;
          slot_duration_minutes: number;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          profile:
            | "ADMIN"
            | "SUPERVISOR"
            | "RECEPCAO"
            | "AT1"
            | "AT2"
            | "FAMILIA";
          is_master?: boolean;
          professional_council?: string | null;
          professional_role?: string | null;
          birth_date?: string | null;
          cpf?: string | null;
          status?: "active" | "inactive";
          patient_id?: string | null;
          slot_duration_minutes?: number;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          profile?:
            | "ADMIN"
            | "SUPERVISOR"
            | "RECEPCAO"
            | "AT1"
            | "AT2"
            | "FAMILIA";
          is_master?: boolean;
          professional_council?: string | null;
          professional_role?: string | null;
          birth_date?: string | null;
          cpf?: string | null;
          status?: "active" | "inactive";
          patient_id?: string | null;
          slot_duration_minutes?: number;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      professional_availability: {
        Row: {
          id: string;
          user_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professional_availability_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      family_portal_notices: {
        Row: {
          id: string;
          patient_id: string;
          title: string;
          content: string;
          author_name: string;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          title: string;
          content: string;
          author_name: string;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          title?: string;
          content?: string;
          author_name?: string;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "family_portal_notices_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      home_activities: {
        Row: {
          id: string;
          patient_id: string;
          title: string;
          description: string;
          instructions: string | null;
          created_by_name: string;
          created_by_user_id: string | null;
          is_published: boolean;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          title: string;
          description: string;
          instructions?: string | null;
          created_by_name: string;
          created_by_user_id?: string | null;
          is_published?: boolean;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          title?: string;
          description?: string;
          instructions?: string | null;
          created_by_name?: string;
          created_by_user_id?: string | null;
          is_published?: boolean;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "home_activities_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      professional_patient_assignments: {
        Row: {
          id: string;
          professional_id: string;
          patient_id: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          patient_id: string;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          professional_id?: string;
          patient_id?: string;
          assigned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professional_patient_assignments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      patients: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string | null;
          guardian_name: string | null;
          guardian_name_2: string | null;
          guardian_phone: string | null;
          guardian_email: string | null;
          diagnosis: string | null;
          cpf: string | null;
          notes: string | null;
          zip_code: string | null;
          state: string | null;
          city: string | null;
          street: string | null;
          neighborhood: string | null;
          address_complement: string | null;
          gender: string | null;
          marital_status: string | null;
          rg: string | null;
          rg_issuer: string | null;
          profession: string | null;
          website: string | null;
          birthplace: string | null;
          contact: string | null;
          phone: string | null;
          health_plan: string | null;
          health_plan_identifier: string | null;
          support_level: string | null;
          status: "active" | "inactive" | "discharged";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date?: string | null;
          guardian_name?: string | null;
          guardian_name_2?: string | null;
          guardian_phone?: string | null;
          guardian_email?: string | null;
          diagnosis?: string | null;
          cpf?: string | null;
          notes?: string | null;
          zip_code?: string | null;
          state?: string | null;
          city?: string | null;
          street?: string | null;
          neighborhood?: string | null;
          address_complement?: string | null;
          gender?: string | null;
          marital_status?: string | null;
          rg?: string | null;
          rg_issuer?: string | null;
          profession?: string | null;
          website?: string | null;
          birthplace?: string | null;
          contact?: string | null;
          phone?: string | null;
          health_plan?: string | null;
          health_plan_identifier?: string | null;
          support_level?: string | null;
          status?: "active" | "inactive" | "discharged";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string | null;
          guardian_name?: string | null;
          guardian_name_2?: string | null;
          guardian_phone?: string | null;
          guardian_email?: string | null;
          diagnosis?: string | null;
          cpf?: string | null;
          notes?: string | null;
          zip_code?: string | null;
          state?: string | null;
          city?: string | null;
          street?: string | null;
          neighborhood?: string | null;
          address_complement?: string | null;
          gender?: string | null;
          marital_status?: string | null;
          rg?: string | null;
          rg_issuer?: string | null;
          profession?: string | null;
          website?: string | null;
          birthplace?: string | null;
          contact?: string | null;
          phone?: string | null;
          health_plan?: string | null;
          health_plan_identifier?: string | null;
          support_level?: string | null;
          status?: "active" | "inactive" | "discharged";
          avatar_url?: string | null;
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
          total_score: number | null;
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
          total_score?: number | null;
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
          total_score?: number | null;
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
          type: "patient_waiting" | "new_message" | "chat_message";
          title: string;
          body: string;
          metadata: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "patient_waiting" | "new_message" | "chat_message";
          title: string;
          body: string;
          metadata?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "patient_waiting" | "new_message" | "chat_message";
          title?: string;
          body?: string;
          metadata?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      chat_conversations: {
        Row: {
          id: string;
          type: "direct" | "group";
          name: string | null;
          direct_pair_key: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: "direct" | "group";
          name?: string | null;
          direct_pair_key?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: "direct" | "group";
          name?: string | null;
          direct_pair_key?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_conversation_members: {
        Row: {
          conversation_id: string;
          user_id: string;
          role: "owner" | "member";
          joined_at: string;
          last_read_at: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          role?: "owner" | "member";
          joined_at?: string;
          last_read_at?: string;
        };
        Update: {
          conversation_id?: string;
          user_id?: string;
          role?: "owner" | "member";
          joined_at?: string;
          last_read_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
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
      user_terms: {
        Row: {
          id: string;
          user_id: string;
          term_type: string;
          accepted_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          term_type: string;
          accepted_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          term_type?: string;
          accepted_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
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
          status: "confirmado" | "agendado" | "em_espera" | "chamado" | "cancelado";
          valor_sessao: number | null;
          payment_status: "pendente" | "pago" | "cancelado";
          payment_link_url: string | null;
          queue_number: number | null;
          room_name: string | null;
          called_at: string | null;
          care_type: "ABA" | "CONVENTIONAL";
          appointment_type:
            | "avaliacao"
            | "evolucao_diaria"
            | "planejamento"
            | "sessao"
            | "supervisao"
            | "suporte_escolar"
            | "visita"
            | null;
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
          status?: "confirmado" | "agendado" | "em_espera" | "chamado" | "cancelado";
          valor_sessao?: number | null;
          payment_status?: "pendente" | "pago" | "cancelado";
          payment_link_url?: string | null;
          queue_number?: number | null;
          room_name?: string | null;
          called_at?: string | null;
          care_type?: "ABA" | "CONVENTIONAL";
          appointment_type?:
            | "avaliacao"
            | "evolucao_diaria"
            | "planejamento"
            | "sessao"
            | "supervisao"
            | "suporte_escolar"
            | "visita"
            | null;
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
          status?: "confirmado" | "agendado" | "em_espera" | "chamado" | "cancelado";
          valor_sessao?: number | null;
          payment_status?: "pendente" | "pago" | "cancelado";
          payment_link_url?: string | null;
          queue_number?: number | null;
          room_name?: string | null;
          called_at?: string | null;
          care_type?: "ABA" | "CONVENTIONAL";
          appointment_type?:
            | "avaliacao"
            | "evolucao_diaria"
            | "planejamento"
            | "sessao"
            | "supervisao"
            | "suporte_escolar"
            | "visita"
            | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conventional_evolution_records: {
        Row: {
          id: string;
          patient_id: string;
          patient_name: string;
          session_date: string;
          content_html: string;
          status: "draft" | "finalized";
          professional_id: string;
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
          professional_id: string;
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
          professional_id?: string;
          professional_name?: string;
          professional_role?: string;
          professional_council?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conventional_evolution_records_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      parent_orientations: {
        Row: {
          id: string;
          patient_id: string;
          title: string;
          content_html: string;
          pei_url: string | null;
          pei_label: string | null;
          author_name: string;
          author_user_id: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          title: string;
          content_html?: string;
          pei_url?: string | null;
          pei_label?: string | null;
          author_name: string;
          author_user_id?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          title?: string;
          content_html?: string;
          pei_url?: string | null;
          pei_label?: string | null;
          author_name?: string;
          author_user_id?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "parent_orientations_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
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
      pedi_continuous_scores: {
        Row: {
          id: string;
          area: "self_care" | "mobility" | "social_function";
          raw_score: number;
          continuous_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          area: "self_care" | "mobility" | "social_function";
          raw_score: number;
          continuous_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          area?: "self_care" | "mobility" | "social_function";
          raw_score?: number;
          continuous_score?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      pedi_normative_scores: {
        Row: {
          id: string;
          area: "self_care" | "mobility" | "social_function";
          age_months_min: number;
          age_months_max: number;
          raw_score: number;
          normative_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          area: "self_care" | "mobility" | "social_function";
          age_months_min: number;
          age_months_max: number;
          raw_score: number;
          normative_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          area?: "self_care" | "mobility" | "social_function";
          age_months_min?: number;
          age_months_max?: number;
          raw_score?: number;
          normative_score?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      sensory_profile_normative_table: {
        Row: {
          id: string;
          age_band:
            | "infant_0_6m"
            | "toddler_7_35m"
            | "child_3_14y"
            | "school";
          quadrant: "seeking" | "avoiding" | "sensitivity" | "registration";
          mean_score: number;
          sd_score: number;
          typical_max_sd: number;
          definite_min_sd: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          age_band:
            | "infant_0_6m"
            | "toddler_7_35m"
            | "child_3_14y"
            | "school";
          quadrant: "seeking" | "avoiding" | "sensitivity" | "registration";
          mean_score: number;
          sd_score: number;
          typical_max_sd?: number;
          definite_min_sd?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          age_band?:
            | "infant_0_6m"
            | "toddler_7_35m"
            | "child_3_14y"
            | "school";
          quadrant?: "seeking" | "avoiding" | "sensitivity" | "registration";
          mean_score?: number;
          sd_score?: number;
          typical_max_sd?: number;
          definite_min_sd?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      ebai_normative_table: {
        Row: {
          id: string;
          raw_score: number;
          t_score: number;
          classification: "leve" | "moderado" | "severo";
          created_at: string;
        };
        Insert: {
          id?: string;
          raw_score: number;
          t_score: number;
          classification: "leve" | "moderado" | "severo";
          created_at?: string;
        };
        Update: {
          id?: string;
          raw_score?: number;
          t_score?: number;
          classification?: "leve" | "moderado" | "severo";
          created_at?: string;
        };
        Relationships: [];
      };
      clinical_area_report_training_samples: {
        Row: {
          id: string;
          clinical_area: string;
          sort_order: number;
          title: string;
          body_text: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinical_area: string;
          sort_order: number;
          title: string;
          body_text: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinical_area?: string;
          sort_order?: number;
          title?: string;
          body_text?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clinical_area_ai_memory: {
        Row: {
          clinical_area: string;
          pattern_summary: string;
          style_guidelines: string;
          section_outline: string;
          sample_count: number;
          status: "not_started" | "collecting" | "ready" | "stale";
          trained_at: string | null;
          trained_by: string | null;
          updated_at: string;
        };
        Insert: {
          clinical_area: string;
          pattern_summary?: string;
          style_guidelines?: string;
          section_outline?: string;
          sample_count?: number;
          status?: "not_started" | "collecting" | "ready" | "stale";
          trained_at?: string | null;
          trained_by?: string | null;
          updated_at?: string;
        };
        Update: {
          clinical_area?: string;
          pattern_summary?: string;
          style_guidelines?: string;
          section_outline?: string;
          sample_count?: number;
          status?: "not_started" | "collecting" | "ready" | "stale";
          trained_at?: string | null;
          trained_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      document_templates: {
        Row: {
          id: string;
          name: string;
          category: string;
          body_html: string;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          body_html?: string;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          body_html?: string;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          name: string;
          registration_type: "catalog" | "learner";
          protocol: string | null;
          specialty: string | null;
          skill: string | null;
          milestone_coding: string | null;
          teaching_type: string;
          targets_per_session: number;
          attempts_per_target: number;
          patient_id: string | null;
          visibility: "private" | "public";
          status: "active" | "inactive";
          teaching_procedure: string | null;
          instruction_sd: string | null;
          objective: string | null;
          hint_step: string | null;
          correction_procedure: string | null;
          learning_criterion: string | null;
          materials_used: string | null;
          observations: string | null;
          evolution_primary_correct_pct: number | null;
          evolution_primary_sessions: number | null;
          evolution_secondary_correct_pct: number | null;
          evolution_secondary_sessions: number | null;
          correction_primary_incorrect_pct: number | null;
          correction_primary_sessions: number | null;
          correction_secondary_incorrect_pct: number | null;
          correction_secondary_sessions: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          registration_type?: "catalog" | "learner";
          protocol?: string | null;
          specialty?: string | null;
          skill?: string | null;
          milestone_coding?: string | null;
          teaching_type: string;
          targets_per_session?: number;
          attempts_per_target?: number;
          patient_id?: string | null;
          visibility?: "private" | "public";
          status?: "active" | "inactive";
          teaching_procedure?: string | null;
          instruction_sd?: string | null;
          objective?: string | null;
          hint_step?: string | null;
          correction_procedure?: string | null;
          learning_criterion?: string | null;
          materials_used?: string | null;
          observations?: string | null;
          evolution_primary_correct_pct?: number | null;
          evolution_primary_sessions?: number | null;
          evolution_secondary_correct_pct?: number | null;
          evolution_secondary_sessions?: number | null;
          correction_primary_incorrect_pct?: number | null;
          correction_primary_sessions?: number | null;
          correction_secondary_incorrect_pct?: number | null;
          correction_secondary_sessions?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          registration_type?: "catalog" | "learner";
          protocol?: string | null;
          specialty?: string | null;
          skill?: string | null;
          milestone_coding?: string | null;
          teaching_type?: string;
          targets_per_session?: number;
          attempts_per_target?: number;
          patient_id?: string | null;
          visibility?: "private" | "public";
          status?: "active" | "inactive";
          teaching_procedure?: string | null;
          instruction_sd?: string | null;
          objective?: string | null;
          hint_step?: string | null;
          correction_procedure?: string | null;
          learning_criterion?: string | null;
          materials_used?: string | null;
          observations?: string | null;
          evolution_primary_correct_pct?: number | null;
          evolution_primary_sessions?: number | null;
          evolution_secondary_correct_pct?: number | null;
          evolution_secondary_sessions?: number | null;
          correction_primary_incorrect_pct?: number | null;
          correction_primary_sessions?: number | null;
          correction_secondary_incorrect_pct?: number | null;
          correction_secondary_sessions?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programs_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      program_targets: {
        Row: {
          id: string;
          program_id: string;
          target_group: string | null;
          sort_order: number;
          target_name: string;
          situation: "active" | "inactive" | "acquired" | "maintenance";
          start_date: string | null;
          maintenances: string | null;
          acquired_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          target_group?: string | null;
          sort_order?: number;
          target_name: string;
          situation?: "active" | "inactive" | "acquired" | "maintenance";
          start_date?: string | null;
          maintenances?: string | null;
          acquired_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          target_group?: string | null;
          sort_order?: number;
          target_name?: string;
          situation?: "active" | "inactive" | "acquired" | "maintenance";
          start_date?: string | null;
          maintenances?: string | null;
          acquired_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "program_targets_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      program_criteria: {
        Row: {
          id: string;
          program_id: string;
          position: number;
          acronym: string | null;
          degree: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          position?: number;
          acronym?: string | null;
          degree: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          position?: number;
          acronym?: string | null;
          degree?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "program_criteria_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      program_files: {
        Row: {
          id: string;
          program_id: string;
          file_name: string;
          file_extension: string | null;
          file_size: number;
          file_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          file_name: string;
          file_extension?: string | null;
          file_size?: number;
          file_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          file_name?: string;
          file_extension?: string | null;
          file_size?: number;
          file_url?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "program_files_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      clinic_settings: {
        Row: {
          id: string;
          nome_clinica: string;
          cnpj: string | null;
          endereco_completo: string | null;
          logo_url: string | null;
          stripe_api_key: string | null;
          mercado_pago_api_key: string | null;
          trade_name: string | null;
          company_code: string | null;
          plan_name: string | null;
          phone: string | null;
          mobile_phone: string | null;
          municipal_registration: string | null;
          state_registration: string | null;
          email: string | null;
          contact_name: string | null;
          website: string | null;
          zip_code: string | null;
          state: string | null;
          city: string | null;
          street: string | null;
          neighborhood: string | null;
          address_complement: string | null;
          whatsapp_guardian_confirmation: boolean;
          whatsapp_professional_notification: boolean;
          appointment_notification_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome_clinica?: string;
          cnpj?: string | null;
          endereco_completo?: string | null;
          logo_url?: string | null;
          stripe_api_key?: string | null;
          mercado_pago_api_key?: string | null;
          trade_name?: string | null;
          company_code?: string | null;
          plan_name?: string | null;
          phone?: string | null;
          mobile_phone?: string | null;
          municipal_registration?: string | null;
          state_registration?: string | null;
          email?: string | null;
          contact_name?: string | null;
          website?: string | null;
          zip_code?: string | null;
          state?: string | null;
          city?: string | null;
          street?: string | null;
          neighborhood?: string | null;
          address_complement?: string | null;
          whatsapp_guardian_confirmation?: boolean;
          whatsapp_professional_notification?: boolean;
          appointment_notification_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome_clinica?: string;
          cnpj?: string | null;
          endereco_completo?: string | null;
          logo_url?: string | null;
          stripe_api_key?: string | null;
          mercado_pago_api_key?: string | null;
          trade_name?: string | null;
          company_code?: string | null;
          plan_name?: string | null;
          phone?: string | null;
          mobile_phone?: string | null;
          municipal_registration?: string | null;
          state_registration?: string | null;
          email?: string | null;
          contact_name?: string | null;
          website?: string | null;
          zip_code?: string | null;
          state?: string | null;
          city?: string | null;
          street?: string | null;
          neighborhood?: string | null;
          address_complement?: string | null;
          whatsapp_guardian_confirmation?: boolean;
          whatsapp_professional_notification?: boolean;
          appointment_notification_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_or_create_direct_conversation: {
        Args: {
          p_other_user_id: string;
        };
        Returns: string;
      };
      build_direct_pair_key: {
        Args: {
          p_user_id_1: string;
          p_user_id_2: string;
        };
        Returns: string;
      };
      is_chat_conversation_member: {
        Args: {
          p_conversation_id: string;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

export type ProfessionalAvailabilityRow =
  Database["public"]["Tables"]["professional_availability"]["Row"];

export type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

export type FamilyPortalNoticeRow =
  Database["public"]["Tables"]["family_portal_notices"]["Row"];

export type HomeActivityRow =
  Database["public"]["Tables"]["home_activities"]["Row"];

export type ProfessionalPatientAssignmentRow =
  Database["public"]["Tables"]["professional_patient_assignments"]["Row"];

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

export type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];

export type ProgramTargetRow =
  Database["public"]["Tables"]["program_targets"]["Row"];

export type ProgramCriterionRow =
  Database["public"]["Tables"]["program_criteria"]["Row"];

export type ProgramFileRow =
  Database["public"]["Tables"]["program_files"]["Row"];

export type AssessmentLevelRow =
  Database["public"]["Tables"]["assessment_levels"]["Row"];

export type AssessmentSkillRow =
  Database["public"]["Tables"]["assessment_skills"]["Row"];

export type AssessmentScoreGroupRow =
  Database["public"]["Tables"]["assessment_score_groups"]["Row"];

export type AssessmentScoreRow =
  Database["public"]["Tables"]["assessment_scores"]["Row"];

export type DocumentTemplateRow =
  Database["public"]["Tables"]["document_templates"]["Row"];

export type ClinicSettingsRow =
  Database["public"]["Tables"]["clinic_settings"]["Row"];

export type ChatConversationRow =
  Database["public"]["Tables"]["chat_conversations"]["Row"];

export type ChatConversationMemberRow =
  Database["public"]["Tables"]["chat_conversation_members"]["Row"];

export type ChatMessageRow =
  Database["public"]["Tables"]["chat_messages"]["Row"];

export type ConventionalEvolutionRecordRow =
  Database["public"]["Tables"]["conventional_evolution_records"]["Row"];

export type ParentOrientationRow =
  Database["public"]["Tables"]["parent_orientations"]["Row"];

export type PediContinuousScoreRow =
  Database["public"]["Tables"]["pedi_continuous_scores"]["Row"];

export type PediNormativeScoreRow =
  Database["public"]["Tables"]["pedi_normative_scores"]["Row"];

export type SensoryProfileNormativeRow =
  Database["public"]["Tables"]["sensory_profile_normative_table"]["Row"];

export type EbaiNormativeRow =
  Database["public"]["Tables"]["ebai_normative_table"]["Row"];

export type ClinicalAreaReportTrainingSampleRow =
  Database["public"]["Tables"]["clinical_area_report_training_samples"]["Row"];

export type ClinicalAreaAiMemoryRow =
  Database["public"]["Tables"]["clinical_area_ai_memory"]["Row"];

export type CareType = "ABA" | "CONVENTIONAL";
