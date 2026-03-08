export interface KPIs {
  total_executions: number;
  total_success: number;
  total_failed: number;
  overall_success_rate: number;
  total_openai_cost_usd: number;
}

export interface DailySeries {
  date: string;
  executions: number;
  failed: number;
  openai_cost: number;
}

export interface SummaryResponse {
  period_days: number;
  kpis: KPIs;
  daily_series: DailySeries[];
  api_keys: ApiKey[];
}

export interface ApiKey {
  key_id: string;
  key_name: string;
  project_name: string;
  total_cost_usd: number;
  prompt_tokens: number;
  completion_tokens: number;
  num_requests: number;
}

export interface ModelBreakdown {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
  num_requests: number;
}

export interface DailyError {
  date: string;
  errors: number;
}

export interface WorkflowRow {
  workflow_id: string;
  workflow_name: string;
  total_executions: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
  avg_duration_ms: number;
  api_key_name: string | null;
  api_key_cost_usd: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  models: ModelBreakdown[];
  daily_errors: DailyError[];
  avg_cost_per_execution: number | null;
}

export interface WorkflowsResponse {
  period_days: number;
  workflows: WorkflowRow[];
}

export interface DailyPoint {
  date: string;
  total_executions: number;
  success_count: number;
  failed_count: number;
  openai_cost_usd: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export interface DailyResponse {
  period_days: number;
  series: DailyPoint[];
}
