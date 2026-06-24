import { supabase } from '@/lib/supabase';
import type { ProcessWithStats } from '@/types/monitor';
import ProcessCard from '@/components/monitor/ProcessCard';
import { relativeTime } from '@/lib/time';

export const revalidate = 60;

const STATUS_ORDER: Record<string, number> = { failed: 0, running: 1, unknown: 2, success: 3 };

export default async function MonitorPage() {
  const { data, error } = await supabase
    .from('processes_with_stats')
    .select('*')
    .eq('enabled', true);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Sistemas</h1>
        <p className="mt-4 text-sm text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  const processes = (data ?? []) as ProcessWithStats[];
  processes.sort((a, b) => {
    const s = STATUS_ORDER[a.last_status] - STATUS_ORDER[b.last_status];
    if (s !== 0) return s;
    return (b.last_run_at ?? '').localeCompare(a.last_run_at ?? '');
  });

  const failed = processes.filter((p) => p.last_status === 'failed').length;
  const latestRun = processes.reduce<string | null>(
    (acc, p) => (p.last_run_at && (!acc || p.last_run_at > acc) ? p.last_run_at : acc),
    null,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[34px] font-semibold tracking-tight text-[#1d1d1f]">Sistemas</h1>
          <p className="mt-1 text-[15px] text-[#86868b]">
            {processes.length} procesos · {failed > 0 ? (
              <span className="text-[#ff3b30] font-medium">{failed} con falla</span>
            ) : (
              <span className="text-[#34c759]">todo OK</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wide text-[#86868b]">Última sync</div>
          <div className="text-[13px] tabular-nums text-[#1d1d1f]">{relativeTime(latestRun)}</div>
        </div>
      </header>

      {processes.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-black/[0.04]">
          <p className="text-[15px] text-[#86868b]">Sin procesos registrados todavía.</p>
          <p className="mt-2 text-[13px] text-[#86868b]">El cron se ejecuta cada 5 minutos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {processes.map((p) => (
            <ProcessCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
