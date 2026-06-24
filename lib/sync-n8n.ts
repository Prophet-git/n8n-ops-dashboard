import { supabase } from './supabase';
import type { ExecutionStatus } from '@/types/monitor';

const N8N_BASE = process.env.N8N_API_URL || 'https://n8ncurso-n8n.xhgix3.easypanel.host';
const N8N_KEY = process.env.N8N_API_KEY!;

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
}

interface N8nExecution {
  id: string;
  workflowId: string;
  status?: string;
  finished?: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string | null;
  data?: { resultData?: { error?: { message?: string } } };
}

async function n8nGet<T>(path: string): Promise<T> {
  const res = await fetch(`${N8N_BASE}${path}`, {
    headers: { 'X-N8N-API-KEY': N8N_KEY, Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`n8n ${path}: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

function mapStatus(e: N8nExecution): ExecutionStatus {
  if (e.status === 'success') return 'success';
  if (e.status === 'error' || e.status === 'failed' || e.status === 'crashed') return 'failed';
  if (e.status === 'running' || e.status === 'waiting') return 'running';
  if (e.finished === false) return 'running';
  return 'unknown';
}

export async function syncN8n() {
  const workflows = (await n8nGet<{ data: N8nWorkflow[] }>('/api/v1/workflows?active=true&limit=250')).data;

  await supabase.from('processes').upsert(
    workflows.map((w) => ({
      type: 'n8n' as const,
      external_id: w.id,
      name: w.name,
      enabled: w.active,
      metadata: { active: w.active },
    })),
    { onConflict: 'type,external_id' },
  );

  const { data: processes } = await supabase
    .from('processes')
    .select('id, external_id')
    .eq('type', 'n8n');

  const byExternal = new Map(processes?.map((p) => [p.external_id, p.id]) ?? []);

  const executions = (await n8nGet<{ data: N8nExecution[] }>('/api/v1/executions?limit=250')).data;

  const rows = executions
    .filter((e) => byExternal.has(e.workflowId))
    .map((e) => {
      const started = new Date(e.startedAt);
      const stopped = e.stoppedAt ? new Date(e.stoppedAt) : null;
      return {
        process_id: byExternal.get(e.workflowId)!,
        external_id: e.id,
        started_at: started.toISOString(),
        finished_at: stopped?.toISOString() ?? null,
        status: mapStatus(e),
        duration_ms: stopped ? stopped.getTime() - started.getTime() : null,
        error_message: e.data?.resultData?.error?.message ?? null,
        metadata: { mode: e.mode },
      };
    });

  if (rows.length > 0) {
    const { error } = await supabase.from('executions').upsert(rows, {
      onConflict: 'process_id,external_id',
    });
    if (error) throw new Error(`Supabase upsert: ${error.message}`);
  }

  return { workflows: workflows.length, executions: rows.length };
}
