import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { DailyBucket, ExecutionRow, ProcessWithStats } from '@/types/monitor';
import StatusDot from '@/components/monitor/StatusDot';
import ExecutionTimeline from '@/components/monitor/ExecutionTimeline';
import ExecutionTable from '@/components/monitor/ExecutionTable';
import { formatDuration, relativeTime } from '@/lib/time';

export const revalidate = 30;

function externalLink(p: ProcessWithStats): string | null {
  if (p.type === 'n8n') {
    return `https://n8ncurso-n8n.xhgix3.easypanel.host/workflow/${p.external_id}`;
  }
  if (p.type === 'vercel' && p.metadata?.url) return String(p.metadata.url);
  if (p.type === 'github_actions' && p.metadata?.url) return String(p.metadata.url);
  return null;
}

function bucketByDay(executions: ExecutionRow[]): DailyBucket[] {
  const map = new Map<string, DailyBucket>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { date: key, success: 0, failed: 0 });
  }
  for (const e of executions) {
    const key = e.started_at.slice(0, 10);
    const b = map.get(key);
    if (!b) continue;
    if (e.status === 'success') b.success++;
    else if (e.status === 'failed') b.failed++;
  }
  return [...map.values()];
}

export default async function ProcessDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: process } = await supabase
    .from('processes_with_stats')
    .select('*')
    .eq('id', id)
    .single();

  if (!process) notFound();
  const p = process as ProcessWithStats;

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: execs } = await supabase
    .from('executions')
    .select('*')
    .eq('process_id', id)
    .gte('started_at', since.toISOString())
    .order('started_at', { ascending: false })
    .limit(500);

  const executions = (execs ?? []) as ExecutionRow[];
  const buckets = bucketByDay(executions);
  const avgDuration = executions.length
    ? executions.filter((e) => e.duration_ms).reduce((s, e) => s + (e.duration_ms ?? 0), 0) /
      (executions.filter((e) => e.duration_ms).length || 1)
    : null;

  const ext = externalLink(p);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/monitor" className="text-[13px] text-[#86868b] hover:text-[#1d1d1f]">
        ← Sistemas
      </Link>

      <header className="mt-4 mb-10">
        <div className="flex items-center gap-3">
          <StatusDot status={p.last_status} size={14} pulse />
          <h1 className="text-[34px] font-semibold tracking-tight text-[#1d1d1f]">{p.name}</h1>
        </div>
        <p className="mt-1 text-[15px] text-[#86868b]">
          {p.type} · {relativeTime(p.last_run_at)}
          {ext && (
            <>
              {' · '}
              <a href={ext} target="_blank" rel="noopener" className="text-[#0071e3] hover:underline">
                abrir origen ↗
              </a>
            </>
          )}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Éxito 7d" value={p.runs_7d > 0 ? `${p.success_rate_7d}%` : '—'} />
        <Stat label="Éxito 30d" value={p.runs_30d > 0 ? `${p.success_rate_30d}%` : '—'} />
        <Stat label="Corridas 30d" value={String(p.runs_30d)} />
        <Stat label="Duración prom." value={formatDuration(avgDuration)} />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-[13px] uppercase tracking-wide text-[#86868b]">Últimos 30 días</h2>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.04]">
          <ExecutionTimeline data={buckets} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-[13px] uppercase tracking-wide text-[#86868b]">Últimas ejecuciones</h2>
        <ExecutionTable rows={executions.slice(0, 50)} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.04]">
      <div className="text-[11px] uppercase tracking-wide text-[#86868b]">{label}</div>
      <div className="mt-2 text-[28px] font-light tabular-nums text-[#1d1d1f]">{value}</div>
    </div>
  );
}
