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
      cases: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          summary_ai: string | null;
          public_token: string | null;
          created_at: string;
          updated_at: string | null;
        };

        Insert: {
          id?: string;
          tenant_id: string;
          client_id: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          summary_ai?: string | null;
          public_token?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };

        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          summary_ai?: string | null;
          public_token?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };

        Relationships: [];
      };

      clients: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          auth_user_id: string | null;
          type: string;
          name: string;
          email: string | null;
          phone: string | null;
          document: string | null;
          created_at: string;
          updated_at: string | null;
        };

        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          auth_user_id?: string | null;
          type: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          document?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };

        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          auth_user_id?: string | null;
          type?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          document?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };

        Relationships: [];
      };

      messages: {
        Row: {
          id: string;
          tenant_id: string;
          case_id: string;
          sender_type: string;
          content: string;
          created_at: string;
        };

        Insert: {
          id?: string;
          tenant_id: string;
          case_id: string;
          sender_type: string;
          content: string;
          created_at?: string;
        };

        Update: {
          id?: string;
          tenant_id?: string;
          case_id?: string;
          sender_type?: string;
          content?: string;
          created_at?: string;
        };

        Relationships: [];
      };

      case_documents: {
        Row: {
          id: string;
          tenant_id: string;
          case_id: string;
          sender_type: string;
          file_name: string;
          storage_path: string | null;
          file_size: number | null;
          file_type: string | null;
          created_at: string;
        };

        Insert: {
          id?: string;
          tenant_id: string;
          case_id: string;
          sender_type: string;
          file_name: string;
          storage_path?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          created_at?: string;
        };

        Update: {
          id?: string;
          tenant_id?: string;
          case_id?: string;
          sender_type?: string;
          file_name?: string;
          storage_path?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          created_at?: string;
        };

        Relationships: [];
      };

      case_notes: {
        Row: {
          id: string;
          tenant_id: string;
          case_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };

        Insert: {
          id?: string;
          tenant_id: string;
          case_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };

        Update: {
          id?: string;
          tenant_id?: string;
          case_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };

        Relationships: [];
      };

      case_tasks: {
        Row: {
          id: string;
          tenant_id: string;
          case_id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          assigned_to: string | null;
          created_by: string;
          created_at: string;
          updated_at: string | null;
        };

        Insert: {
          id?: string;
          tenant_id: string;
          case_id: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          assigned_to?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string | null;
        };

        Update: {
          id?: string;
          tenant_id?: string;
          case_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          assigned_to?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string | null;
        };

        Relationships: [];
      };

      tenant_public_settings: {
        Row: {
          id: string;
          tenant_id: string;
          public_title: string | null;
          public_subtitle: string | null;
          public_description: string | null;
          whatsapp_number: string | null;
          practice_areas: string[];
          form_intro: string | null;
          is_public_active: boolean;
          created_at: string;
          updated_at: string | null;
        };

        Insert: {
          id?: string;
          tenant_id: string;
          public_title?: string | null;
          public_subtitle?: string | null;
          public_description?: string | null;
          whatsapp_number?: string | null;
          practice_areas?: string[];
          form_intro?: string | null;
          is_public_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };

        Update: {
          id?: string;
          tenant_id?: string;
          public_title?: string | null;
          public_subtitle?: string | null;
          public_description?: string | null;
          whatsapp_number?: string | null;
          practice_areas?: string[];
          form_intro?: string | null;
          is_public_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };

        Relationships: [];
      };

      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: string;
          created_at: string;
          updated_at: string | null;
        };

        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role: string;
          created_at?: string;
          updated_at?: string | null;
        };

        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string | null;
        };

        Relationships: [];
      };

      tenant_members: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: string;
          is_active: boolean;
          created_at: string;
        };

        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role: string;
          is_active?: boolean;
          created_at?: string;
        };

        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
        };

        Relationships: [];
      };

      tenants: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string | null;
          plan: string;
          active: boolean;
          created_at: string;
        };

        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug?: string | null;
          plan?: string;
          active?: boolean;
          created_at?: string;
        };

        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string | null;
          plan?: string;
          active?: boolean;
          created_at?: string;
        };

        Relationships: [];
      };
    };

    Views: Record<string, never>;

    Functions: Record<string, never>;

    Enums: Record<string, never>;
  };
};