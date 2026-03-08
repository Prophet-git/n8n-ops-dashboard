import type { SummaryResponse, WorkflowsResponse, DailyResponse } from '@/types/dashboard';

const N8N_BASE = process.env.N8N_WEBHOOK_BASE_URL;

if (!N8N_BASE && typeof window === 'undefined') {
  console.warn('N8N_WEBHOOK_BASE_URL is not set');
}

async function fetchN8n<T>(path: string): Promise<T> {
  const base = N8N_BASE || 'https://n8ncurso-n8n.xhgix3.easypanel.host';
  const url = `${base}${path}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`n8n API error: ${res.status} ${res.statusText} on ${path}`);
  }

  return res.json() as Promise<T>;
}

export function getSummary(): Promise<SummaryResponse> {
  return fetchN8n<SummaryResponse>('/webhook/dashboard/summary');
}

export function getWorkflows(): Promise<WorkflowsResponse> {
  return fetchN8n<WorkflowsResponse>('/webhook/dashboard/workflows');
}

export function getDaily(): Promise<DailyResponse> {
  return fetchN8n<DailyResponse>('/webhook/dashboard/daily');
}
