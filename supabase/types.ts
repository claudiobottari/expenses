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
      households: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          household_id: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          household_id?: string | null;
          id?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          household_id?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: {
          created_at: string;
          currency: string;
          household_id: string;
          id: string;
          is_active: boolean;
          name: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          household_id: string;
          id?: string;
          is_active?: boolean;
          name: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          household_id?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          color: string | null;
          created_at: string;
          household_id: string;
          id: string;
          is_active: boolean;
          is_default: boolean;
          name: string;
          type: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          household_id: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          name: string;
          type?: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          household_id?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          name?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          amount: number;
          category_id: string;
          created_at: string;
          created_by: string;
          currency: string;
          date: string;
          description: string | null;
          household_id: string;
          id: string;
          updated_at: string;
          wallet_id: string;
        };
        Insert: {
          amount: number;
          category_id: string;
          created_at?: string;
          created_by: string;
          currency?: string;
          date?: string;
          description?: string | null;
          household_id: string;
          id?: string;
          updated_at?: string;
          wallet_id: string;
        };
        Update: {
          amount?: number;
          category_id?: string;
          created_at?: string;
          created_by?: string;
          currency?: string;
          date?: string;
          description?: string | null;
          household_id?: string;
          id?: string;
          updated_at?: string;
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      recurring_expenses: {
        Row: {
          amount: number;
          category_id: string;
          created_at: string;
          household_id: string;
          id: string;
          is_active: boolean;
          next_occurrence: string | null;
          recurrence_rule: string;
          wallet_id: string;
        };
        Insert: {
          amount: number;
          category_id: string;
          created_at?: string;
          household_id: string;
          id?: string;
          is_active?: boolean;
          next_occurrence?: string | null;
          recurrence_rule: string;
          wallet_id: string;
        };
        Update: {
          amount?: number;
          category_id?: string;
          created_at?: string;
          household_id?: string;
          id?: string;
          is_active?: boolean;
          next_occurrence?: string | null;
          recurrence_rule?: string;
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recurring_expenses_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recurring_expenses_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      attachments: {
        Row: {
          created_at: string;
          expense_id: string;
          id: string;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          expense_id: string;
          id?: string;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          expense_id?: string;
          id?: string;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_expense_id_fkey";
            columns: ["expense_id"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
