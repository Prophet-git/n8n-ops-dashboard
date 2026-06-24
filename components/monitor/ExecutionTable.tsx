import type { ExecutionRow } from '@/types/monitor';
import StatusDot from './StatusDot';
import { formatDuration, relativeTime } from '@/lib/time';

export default function ExecutionTable({ rows }: { rows: ExecutionRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-sm text-[#86868b] ring-1 ring-black/[0.04]">
        Sin ejecuciones registradas
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.04]">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[#f5f5f7] text-left text-[11px] uppercase tracking-wide text-[#86868b]">
            <th className="px-5 py-3 font-medium">Estado</th>
            <th className="px-5 py-3 font-medium">Cuándo</th>
            <th className="px-5 py-3 font-medium">Duración</th>
            <th className="px-5 py-3 font-medium">Error</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-[#fafafa] last:border-0">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <StatusDot status={r.status} size={8} />
                  <span className="capitalize text-[#1d1d1f]">{r.status}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-[#1d1d1f] tabular-nums">{relativeTime(r.started_at)}</td>
              <td className="px-5 py-3 text-[#1d1d1f] tabular-nums">{formatDuration(r.duration_ms)}</td>
              <td className="px-5 py-3 max-w-md truncate text-[#86868b]">{r.error_message || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
