import Link from 'next/link';
import type { ProcessWithStats, ProcessType } from '@/types/monitor';
import StatusDot from './StatusDot';
import { relativeTime } from '@/lib/time';

const TYPE_LABEL: Record<ProcessType, string> = {
  n8n: 'n8n',
  launchd: 'Cron',
  github_actions: 'GitHub',
  vercel: 'Vercel',
};

const TYPE_COLOR: Record<ProcessType, string> = {
  n8n: 'bg-[#ea4b71]/10 text-[#ea4b71]',
  launchd: 'bg-[#5856d6]/10 text-[#5856d6]',
  github_actions: 'bg-[#1a1a1a]/10 text-[#1a1a1a]',
  vercel: 'bg-black/10 text-black',
};

export default function ProcessCard({ p }: { p: ProcessWithStats }) {
  const rate = p.success_rate_7d;
  const rateColor =
    rate >= 95 ? 'text-[#34c759]' : rate >= 80 ? 'text-[#ff9500]' : 'text-[#ff3b30]';

  return (
    <Link
      href={`/monitor/${p.id}`}
      className="group block rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusDot status={p.last_status} size={12} pulse />
          <h3 className="font-semibold text-[15px] text-[#1d1d1f] truncate">{p.name}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLOR[p.type]}`}>
          {TYPE_LABEL[p.type]}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className={`text-3xl font-light tabular-nums ${rateColor}`}>
            {p.runs_7d > 0 ? `${rate}%` : '—'}
          </div>
          <div className="mt-0.5 text-[11px] text-[#86868b]">éxito · 7d</div>
        </div>
        <div className="text-right">
          <div className="text-[13px] tabular-nums text-[#1d1d1f]">{p.runs_7d}</div>
          <div className="mt-0.5 text-[11px] text-[#86868b]">{relativeTime(p.last_run_at)}</div>
        </div>
      </div>
    </Link>
  );
}
