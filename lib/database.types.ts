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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string | null
          created_at: string
          finished_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          status: string
          target_finish_date: string | null
          title: string
          total_pages: number | null
          user_id: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          target_finish_date?: string | null
          title: string
          total_pages?: number | null
          user_id: string
        }
        Update: {
          author?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          target_finish_date?: string | null
          title?: string
          total_pages?: number | null
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          archived: boolean
          category: string | null
          created_at: string
          default_unit: string
          id: string
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean
          category?: string | null
          created_at?: string
          default_unit?: string
          id?: string
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean
          category?: string | null
          created_at?: string
          default_unit?: string
          id?: string
          name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      peptide_cycles: {
        Row: {
          created_at: string
          dose: number | null
          dose_unit: string | null
          end_date: string | null
          frequency: string | null
          id: string
          notes: string | null
          peptide_id: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dose?: number | null
          dose_unit?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          peptide_id: string
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          dose?: number | null
          dose_unit?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          peptide_id?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peptide_cycles_peptide_id_fkey"
            columns: ["peptide_id"]
            isOneToOne: false
            referencedRelation: "peptides"
            referencedColumns: ["id"]
          },
        ]
      }
      peptide_doses: {
        Row: {
          amount: number | null
          amount_unit: string | null
          cycle_id: string
          id: string
          notes: string | null
          side_effects: string | null
          taken_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          amount_unit?: string | null
          cycle_id: string
          id?: string
          notes?: string | null
          side_effects?: string | null
          taken_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          amount_unit?: string | null
          cycle_id?: string
          id?: string
          notes?: string | null
          side_effects?: string | null
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peptide_doses_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "peptide_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      peptides: {
        Row: {
          archived: boolean
          created_at: string
          default_dose: number | null
          dose_unit: string
          id: string
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          default_dose?: number | null
          dose_unit?: string
          id?: string
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          default_dose?: number | null
          dose_unit?: string
          id?: string
          name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reading_sessions: {
        Row: {
          book_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          pages_read: number | null
          read_on: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          pages_read?: number | null
          read_on?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          pages_read?: number | null
          read_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      sets: {
        Row: {
          exercise_id: string
          id: string
          is_warmup: boolean
          notes: string | null
          performed_at: string
          reps: number | null
          rpe: number | null
          session_id: string
          set_number: number
          user_id: string
          weight: number | null
        }
        Insert: {
          exercise_id: string
          id?: string
          is_warmup?: boolean
          notes?: string | null
          performed_at?: string
          reps?: number | null
          rpe?: number | null
          session_id: string
          set_number: number
          user_id: string
          weight?: number | null
        }
        Update: {
          exercise_id?: string
          id?: string
          is_warmup?: boolean
          notes?: string | null
          performed_at?: string
          reps?: number | null
          rpe?: number | null
          session_id?: string
          set_number?: number
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      daily_activity: {
        Row: {
          activity_date: string | null
          had_peptide: boolean | null
          had_reading: boolean | null
          had_workout: boolean | null
          user_id: string | null
        }
        Relationships: []
      }
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
    Enums: {},
  },
} as const
