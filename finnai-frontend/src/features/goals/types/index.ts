export type GoalType =
  | "emergency_reserve"
  | "travel"
  | "car"
  | "house"
  | "investment"
  | "education"
  | "shopping"
  | "custom";

export type GoalPriority = "low" | "medium" | "high";
export type GoalStatus = "active" | "completed" | "paused";

export type Goal = {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  goal_type: GoalType;
  target_amount_cents: number;
  current_amount_cents: number;
  target_date: string | null;
  priority: GoalPriority;
  status: GoalStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GoalCreateInput = {
  name: string;
  description?: string | null;
  goal_type: GoalType;
  target_amount_cents: number;
  current_amount_cents?: number;
  target_date?: string | null;
  priority?: GoalPriority;
};

export type GoalUpdateInput = Partial<GoalCreateInput> & {
  status?: GoalStatus;
  current_amount_cents?: number;
};

export type GoalsOverview = {
  active_count: number;
  completed_count: number;
  total_saved_cents: number;
  total_progress_percent: number;
};
