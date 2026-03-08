'use client';

import type { ApiKey } from '@/types/dashboard';

interface Props {
  keys: ApiKey[];
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export default function ApiKeyTable({ keys }: Props) {
  if (!keys || keys.length === 0) return null;

  const totalCost = keys.reduce((s, k) => s + k.total_cost_usd, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-3 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">API Key</th>
            <th className="pb-3 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Proyecto</th>
            <th className="pb-3 pr-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Requests</th>
            <th className="pb-3 pr-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tokens In</th>
            <th className="pb-3 pr-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tokens Out</th>
            <th className="pb-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Costo USD</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {keys.map((k) => {
            const pct = totalCost > 0 ? (k.total_cost_usd / totalCost) * 100 : 0;
            return (
              <tr key={k.key_id} className="hover:bg-gray-50">
                <td className="py-3 pr-4">
                  <span className="font-semibold text-gray-800">{k.key_name}</span>
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                    {k.project_name || '—'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right text-gray-600">{k.num_requests.toLocaleString()}</td>
                <td className="py-3 pr-4 text-right text-gray-600">{fmt(k.prompt_tokens)}</td>
                <td className="py-3 pr-4 text-right text-gray-600">{fmt(k.completion_tokens)}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-800 w-16 text-right">
                      ${k.total_cost_usd.toFixed(2)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
