'use client';

import { useState } from 'react';
import type { WorkflowRow, DailyError } from '@/types/dashboard';

interface Props {
  rows: WorkflowRow[];
}

function fmt(n: number | null) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

function fmtCost(n: number | null) {
  if (n == null) return '—';
  if (n === 0) return '$0';
  if (n < 0.0001) return `$${n.toFixed(5)}`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 0.1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}

function ErrorSparkline({ data }: { data: DailyError[] }) {
  const last14 = data.slice(-14);
  const max = Math.max(...last14.map((d) => d.errors), 1);
  const W = 56, H = 18, barW = 3, gap = 1;
  return (
    <svg width={W} height={H} className="inline-block align-middle">
      {last14.map((d, i) => {
        const h = Math.max(Math.ceil((d.errors / max) * H), d.errors > 0 ? 2 : 1);
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={H - h}
            width={barW}
            height={h}
            fill={d.errors > 0 ? '#ef4444' : '#e5e7eb'}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

type SortKey = keyof Pick<
  WorkflowRow,
  'workflow_name' | 'total_executions' | 'success_rate' | 'failed_count' | 'avg_duration_ms' | 'api_key_cost_usd' | 'prompt_tokens' | 'completion_tokens' | 'avg_cost_per_execution'
>;

export default function WorkflowTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('total_executions');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    const mult = sortDir === 'asc' ? 1 : -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * mult;
    return String(aVal).localeCompare(String(bVal)) * mult;
  });

  const cols: { key: SortKey; label: string }[] = [
    { key: 'workflow_name', label: 'Workflow' },
    { key: 'total_executions', label: 'Ejecuciones' },
    { key: 'failed_count', label: 'Errores' },
    { key: 'success_rate', label: 'Success %' },
    { key: 'avg_duration_ms', label: 'Duración' },
    { key: 'prompt_tokens', label: 'Tokens In' },
    { key: 'completion_tokens', label: 'Tokens Out' },
    { key: 'api_key_cost_usd', label: 'Costo Total' },
    { key: 'avg_cost_per_execution', label: 'Costo/Ejec' },
  ];

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-gray-400 text-sm">
        Sin workflows con API Key de OpenAI en el período seleccionado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {cols.map((c) => (
              <th
                key={c.key}
                className="pb-3 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 select-none whitespace-nowrap"
                onClick={() => handleSort(c.key)}
              >
                {c.label}
                {sortKey === c.key && (
                  <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
            {/* Non-sortable columns */}
            <th className="pb-3 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              API Key
            </th>
            <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              Modelo
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((row) => {
            const primaryModel = row.models?.[0];
            const hasMultiModel = (row.models?.length ?? 0) > 1;

            return (
              <tr key={row.workflow_id} className="hover:bg-gray-50">
                {/* Workflow name */}
                <td className="py-3 pr-4 font-medium text-gray-800 max-w-[180px] truncate">
                  {row.workflow_name}
                </td>

                {/* Executions */}
                <td className="py-3 pr-4 text-gray-600">
                  {row.total_executions.toLocaleString()}
                </td>

                {/* Errors + sparkline */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={row.failed_count > 0 ? 'text-red-500 font-medium' : 'text-gray-400'}>
                      {row.failed_count}
                    </span>
                    {row.daily_errors?.length > 0 && (
                      <ErrorSparkline data={row.daily_errors} />
                    )}
                  </div>
                </td>

                {/* Success rate */}
                <td className="py-3 pr-4">
                  <span
                    className={
                      row.success_rate >= 95
                        ? 'text-green-600 font-medium'
                        : row.success_rate >= 80
                        ? 'text-yellow-600 font-medium'
                        : 'text-red-600 font-medium'
                    }
                  >
                    {row.success_rate.toFixed(1)}%
                  </span>
                </td>

                {/* Duration */}
                <td className="py-3 pr-4 text-gray-500 text-xs">
                  {row.avg_duration_ms >= 1000
                    ? `${(row.avg_duration_ms / 1000).toFixed(1)}s`
                    : `${row.avg_duration_ms}ms`}
                </td>

                {/* Tokens in */}
                <td className="py-3 pr-4 text-gray-600 text-right">{fmt(row.prompt_tokens)}</td>

                {/* Tokens out */}
                <td className="py-3 pr-4 text-gray-600 text-right">{fmt(row.completion_tokens)}</td>

                {/* Cost total */}
                <td className="py-3 pr-4 text-right">
                  <span className="font-semibold text-gray-800">
                    ${row.api_key_cost_usd?.toFixed(2)}
                  </span>
                </td>

                {/* Avg cost per execution */}
                <td className="py-3 pr-4 text-right">
                  <span className="text-gray-600 text-xs">
                    {fmtCost(row.avg_cost_per_execution)}
                  </span>
                </td>

                {/* API Key badge */}
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                    {row.api_key_name}
                  </span>
                </td>

                {/* Primary model */}
                <td className="py-3">
                  {primaryModel ? (
                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700 whitespace-nowrap">
                        {primaryModel.model.replace('gpt-', '')}
                      </span>
                      {hasMultiModel && (
                        <span className="text-xs text-gray-400">
                          +{row.models.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
