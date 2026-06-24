export type ProcessType = 'n8n' | 'launchd' | 'github_actions' | 'vercel';
export type ExecutionStatus = 'success' | 'failed' | 'running' | 'unknown';

export interface ProcessRow {
  id: string;
  type: ProcessType;
  external_id: string;
  name: string;
  last_status: ExecutionStatus;
  last_run_at: string | null;
  enabled: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProcessWithStats extends ProcessRow {
  runs_7d: number;
  success_rate_7d: number;
  runs_30d: number;
  success_rate_30d: number;
  last_failure_at: string | null;
}

export interface ExecutionRow {
  id: string;
  process_id: string;
  external_id: string | null;
  started_at: string;
  finished_at: string | null;
  status: ExecutionStatus;
  error_message: string | null;
  duration_ms: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DailyBucket {
  date: string;
  success: number;
  failed: number;
}
