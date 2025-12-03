export type UUID = string;

export type Household = {
  id: UUID;
  name: string;
  created_at: string;
};

export type Profile = {
  id: UUID;
  household_id: UUID | null;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

export type Wallet = {
  id: UUID;
  household_id: UUID;
  name: string;
  currency: string;
  is_active: boolean;
  created_at: string;
};

export type Category = {
  id: UUID;
  household_id: UUID;
  name: string;
  type: "expense" | "income";
  color: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
};

export type Expense = {
  id: UUID;
  household_id: UUID;
  wallet_id: UUID;
  category_id: UUID;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  created_by: UUID;
  created_at: string;
  updated_at: string;
};

export type RecurringExpense = {
  id: UUID;
  household_id: UUID;
  wallet_id: UUID;
  category_id: UUID;
  amount: number;
  recurrence_rule: string;
  next_occurrence: string | null;
  is_active: boolean;
  created_at: string;
};

export type Attachment = {
  id: UUID;
  expense_id: UUID;
  storage_path: string;
  created_at: string;
};

export type ExpenseInsert = Omit<
  Expense,
  "id" | "created_at" | "updated_at" | "created_by" | "household_id"
>;

export type Database = {
  public: {
    Tables: {
      households: { Row: Household };
      profiles: { Row: Profile };
      wallets: { Row: Wallet };
      categories: { Row: Category };
      expenses: { Row: Expense };
      recurring_expenses: { Row: RecurringExpense };
      attachments: { Row: Attachment };
    };
  };
};
