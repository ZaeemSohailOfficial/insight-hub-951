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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      client_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      client_contracts: {
        Row: {
          budget: number
          client_id: string
          costing: number
          created_at: string
          end_date: string
          id: string
          is_renewal: boolean
          mou_details: string
          mou_files: Json
          profit: number
          renewal_date: string | null
          start_date: string
          timeline: string
        }
        Insert: {
          budget?: number
          client_id: string
          costing?: number
          created_at?: string
          end_date?: string
          id?: string
          is_renewal?: boolean
          mou_details?: string
          mou_files?: Json
          profit?: number
          renewal_date?: string | null
          start_date?: string
          timeline?: string
        }
        Update: {
          budget?: number
          client_id?: string
          costing?: number
          created_at?: string
          end_date?: string
          id?: string
          is_renewal?: boolean
          mou_details?: string
          mou_files?: Json
          profit?: number
          renewal_date?: string | null
          start_date?: string
          timeline?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          categories: string[]
          company: string
          created_at: string
          details: string
          email: string
          id: string
          name: string
          phone: string
          position: number
          status: string
        }
        Insert: {
          categories?: string[]
          company?: string
          created_at?: string
          details?: string
          email?: string
          id?: string
          name: string
          phone?: string
          position?: number
          status?: string
        }
        Update: {
          categories?: string[]
          company?: string
          created_at?: string
          details?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          position?: number
          status?: string
        }
        Relationships: []
      }
      employee_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      employee_contracts: {
        Row: {
          created_at: string
          employee_id: string
          end_date: string
          id: string
          is_renewal: boolean
          mou_details: string
          mou_files: Json
          salary: number
          start_date: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_date?: string
          id?: string
          is_renewal?: boolean
          mou_details?: string
          mou_files?: Json
          salary?: number
          start_date?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          is_renewal?: boolean
          mou_details?: string
          mou_files?: Json
          salary?: number
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          additional_info: string
          categories: string[]
          created_at: string
          email: string
          end_date: string
          id: string
          mou_details: string
          mou_files: Json
          name: string
          phone: string
          position: string
          salary: number
          start_date: string
          status: string
        }
        Insert: {
          additional_info?: string
          categories?: string[]
          created_at?: string
          email?: string
          end_date?: string
          id?: string
          mou_details?: string
          mou_files?: Json
          name: string
          phone?: string
          position?: string
          salary?: number
          start_date?: string
          status?: string
        }
        Update: {
          additional_info?: string
          categories?: string[]
          created_at?: string
          email?: string
          end_date?: string
          id?: string
          mou_details?: string
          mou_files?: Json
          name?: string
          phone?: string
          position?: string
          salary?: number
          start_date?: string
          status?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
          type?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      invoice_services: {
        Row: {
          cost: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          service: string
        }
        Insert: {
          cost?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id: string
          service?: string
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          service?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_services_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_account: string
          client_address: string
          client_brand: string
          client_cnic: string
          client_owner: string
          company_address: string
          company_email: string
          company_name: string
          company_phone: string
          company_type: string
          created_at: string
          founder_account: string
          founder_cnic: string
          founder_name: string
          id: string
          invoice_date: string
          invoice_number: string
          logo_data_url: string | null
          payment_terms: string
          title: string
          total_cost: number
        }
        Insert: {
          client_account?: string
          client_address?: string
          client_brand?: string
          client_cnic?: string
          client_owner?: string
          company_address?: string
          company_email?: string
          company_name?: string
          company_phone?: string
          company_type?: string
          created_at?: string
          founder_account?: string
          founder_cnic?: string
          founder_name?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          logo_data_url?: string | null
          payment_terms?: string
          title?: string
          total_cost?: number
        }
        Update: {
          client_account?: string
          client_address?: string
          client_brand?: string
          client_cnic?: string
          client_owner?: string
          company_address?: string
          company_email?: string
          company_name?: string
          company_phone?: string
          company_type?: string
          created_at?: string
          founder_account?: string
          founder_cnic?: string
          founder_name?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          logo_data_url?: string | null
          payment_terms?: string
          title?: string
          total_cost?: number
        }
        Relationships: []
      }
      personal_expenses: {
        Row: {
          category: string
          cost: number
          created_at: string
          date: string
          details: string
          id: string
          invoice_files: Json
          name: string
        }
        Insert: {
          category?: string
          cost?: number
          created_at?: string
          date?: string
          details?: string
          id?: string
          invoice_files?: Json
          name: string
        }
        Update: {
          category?: string
          cost?: number
          created_at?: string
          date?: string
          details?: string
          id?: string
          invoice_files?: Json
          name?: string
        }
        Relationships: []
      }
      task_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      task_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      task_items: {
        Row: {
          created_at: string
          custom_interval_days: number | null
          done: boolean
          id: string
          phase_id: string | null
          repeat_interval: string | null
          task_list_id: string
          task_type: string
          text: string
        }
        Insert: {
          created_at?: string
          custom_interval_days?: number | null
          done?: boolean
          id?: string
          phase_id?: string | null
          repeat_interval?: string | null
          task_list_id: string
          task_type?: string
          text?: string
        }
        Update: {
          created_at?: string
          custom_interval_days?: number | null
          done?: boolean
          id?: string
          phase_id?: string | null
          repeat_interval?: string | null
          task_list_id?: string
          task_type?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_items_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "task_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_items_task_list_id_fkey"
            columns: ["task_list_id"]
            isOneToOne: false
            referencedRelation: "task_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      task_lists: {
        Row: {
          category_id: string | null
          created_at: string
          folder_id: string | null
          id: string
          name: string
          position: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          name: string
          position?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_lists_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_lists_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "task_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      task_phases: {
        Row: {
          created_at: string
          id: string
          is_current: boolean
          name: string
          phase_number: number
          task_list_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_current?: boolean
          name?: string
          phase_number?: number
          task_list_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_current?: boolean
          name?: string
          phase_number?: number
          task_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_phases_task_list_id_fkey"
            columns: ["task_list_id"]
            isOneToOne: false
            referencedRelation: "task_lists"
            referencedColumns: ["id"]
          },
        ]
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
