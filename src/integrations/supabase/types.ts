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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cell_interest: {
        Row: {
          cell_id: string | null
          created_at: string
          id: string
          name: string
          neighborhood: string | null
          phone: string
        }
        Insert: {
          cell_id?: string | null
          created_at?: string
          id?: string
          name: string
          neighborhood?: string | null
          phone: string
        }
        Update: {
          cell_id?: string | null
          created_at?: string
          id?: string
          name?: string
          neighborhood?: string | null
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "cell_interest_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "cells"
            referencedColumns: ["id"]
          },
        ]
      }
      cells: {
        Row: {
          address: string | null
          coleader_name: string | null
          created_at: string
          email: string | null
          id: string
          leader_name: string | null
          meeting_day: string | null
          meeting_time: string | null
          name: string
          neighborhood: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          coleader_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          leader_name?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          name: string
          neighborhood?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          coleader_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          leader_name?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          name?: string
          neighborhood?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          contact_email: string | null
          contact_whatsapp: string | null
          created_at: string
          description: string | null
          id: string
          leader_name: string | null
          name: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          leader_name?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          leader_name?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      devotionals: {
        Row: {
          author: string | null
          bible_book: string | null
          body: string | null
          created_at: string
          download_url: string | null
          id: string
          is_published: boolean
          published_on: string | null
          tags: string[]
          theme: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author?: string | null
          bible_book?: string | null
          body?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          is_published?: boolean
          published_on?: string | null
          tags?: string[]
          theme?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author?: string | null
          bible_book?: string | null
          body?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          is_published?: boolean
          published_on?: string | null
          tags?: string[]
          theme?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_published: boolean
          location: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kids_contents: {
        Row: {
          body: string | null
          created_at: string
          download_url: string | null
          id: string
          is_published: boolean
          tags: string[]
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          is_published?: boolean
          tags?: string[]
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          is_published?: boolean
          tags?: string[]
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          location: string | null
          pix_key: string | null
          status: Database["public"]["Enums"]["mission_status"]
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          pix_key?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          pix_key?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cell_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          ministry: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cell_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          ministry?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cell_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          ministry?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      studies: {
        Row: {
          author: string | null
          bible_book: string | null
          body: string | null
          created_at: string
          download_url: string | null
          id: string
          is_published: boolean
          published_on: string | null
          tags: string[]
          theme: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author?: string | null
          bible_book?: string | null
          body?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          is_published?: boolean
          published_on?: string | null
          tags?: string[]
          theme?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author?: string | null
          bible_book?: string | null
          body?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          is_published?: boolean
          published_on?: string | null
          tags?: string[]
          theme?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          body: string | null
          created_at: string
          happened_on: string | null
          id: string
          person_name: string | null
          status: Database["public"]["Enums"]["moderation_status"]
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          happened_on?: string | null
          id?: string
          person_name?: string | null
          status?: Database["public"]["Enums"]["moderation_status"]
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          happened_on?: string | null
          id?: string
          person_name?: string | null
          status?: Database["public"]["Enums"]["moderation_status"]
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "member"
      mission_status: "active" | "completed"
      moderation_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "editor", "member"],
      mission_status: ["active", "completed"],
      moderation_status: ["pending", "approved", "rejected"],
    },
  },
} as const
