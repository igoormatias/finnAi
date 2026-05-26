export type CategoryType = "income" | "expense";
export type AccountType = "checking" | "savings" | "wallet" | "credit_card" | "investment";
export type TransactionType = "income" | "expense";
export type RecurrenceRule = "weekly" | "monthly" | "yearly";
export type TransactionSort = "newest" | "oldest" | "amount_asc" | "amount_desc";

export type PaginatedResponse<T> = {
  total: number;
  items: T[];
  limit: number;
  offset: number;
};

export type Category = {
  id: string;
  workspace_id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  is_fixed: boolean;
  created_at: string;
  updated_at: string;
};

export type Account = {
  id: string;
  workspace_id: string;
  name: string;
  type: AccountType;
  initial_balance_cents: number;
  current_balance_cents: number;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  workspace_id: string;
  account_id: string;
  category_id: string;
  created_by: string;
  type: TransactionType;
  amount_cents: number;
  description: string;
  notes: string | null;
  transaction_date: string;
  is_recurring: boolean;
  recurrence_rule: RecurrenceRule | null;
  created_at: string;
  updated_at: string;
};

export type CategoryCreateInput = {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  is_fixed?: boolean;
};

export type CategoryUpdateInput = Partial<Omit<CategoryCreateInput, "type">> & {
  type?: never;
};

export type AccountCreateInput = {
  name: string;
  type: AccountType;
  initial_balance_cents?: number;
};

export type AccountUpdateInput = {
  name?: string;
  type?: AccountType;
};

export type TransactionCreateInput = {
  account_id: string;
  category_id: string;
  type: TransactionType;
  amount_cents: number;
  description?: string;
  notes?: string | null;
  transaction_date: string;
  is_recurring?: boolean;
  recurrence_rule?: RecurrenceRule | null;
};

export type TransactionUpdateInput = Partial<TransactionCreateInput>;

export type TransactionsFilters = {
  limit: number;
  offset: number;
  sort: TransactionSort;
  type?: TransactionType;
  category_id?: string;
  account_id?: string;
  start_date?: string;
  end_date?: string;
  amount_min_cents?: number;
  amount_max_cents?: number;
  recurring?: boolean;
  search?: string;
};

