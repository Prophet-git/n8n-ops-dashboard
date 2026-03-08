'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SummaryResponse, WorkflowsResponse } from '@/types/dashboard';
import KpiCard from './KpiCard';
import DailyCostChart from './DailyCostChart';
import WorkflowBarChart from './WorkflowBarChart';
import WorkflowTable from './WorkflowTable';
import ApiKeyTable from './ApiKeyTable';

type Preset = '7' | '30' | '90';

interface DateRange {
  preset: Preset | 'custom';
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

function rangeToParams(range: DateRange) {
  const start = Math.floor(new Date(range.from + 'T00:00:00').getTime() / 1000);
  const end = Math.floor(new Date(range.to + 'T23:59:59').getTime() / 1000);
  return `start=${start}&end=${end}`;
}

function periodLabel(range: DateRange) {
  if (range.preset === '7') return 'Últimos 7 días';
  if (range.preset === '30') return 'Últimos 30 días';
  if (range.preset === '90') return 'Últimos 90 días';
  return `${range.from} → ${range.to}`;
}

export default function DashboardContent() {
  const today = todayStr();
  const [range, setRange] = useState<DateRange>({
    preset: '30',
    from: daysAgoStr(30),
    to: today,
  });
  const [customFrom, setCustomFrom] = useState(daysAgoStr(30));
  const [customTo, setCustomTo] = useState(today);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const params = rangeToParams(r);
      const [s, w] = await Promise.all([
        fetch(`/api/summary?${params}`).then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
        }),
        fetch(`/api/workflows?${params}`).then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
        }),
      ]);
      setSummary(s);
      setWorkflows(w);
    } catch {
      setError('No se pudo obtener datos. Verificá que los workflows API estén activos en n8n.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function applyPreset(preset: Preset) {
    const days = parseInt(preset);
    const newRange: DateRange = { preset, from: daysAgoStr(days), to: today };
    setRange(newRange);
    fetchData(newRange);
  }

  function applyCustom() {
    if (!customFrom || !customTo || customFrom > customTo) return;
    const newRange: DateRange = { preset: 'custom', from: customFrom, to: customTo };
    setRange(newRange);
    fetchData(newRange);
  }

  if (error) {
    return (
      <main className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <h2 className="font-semibold text-lg mb-1">Error conectando con n8n</h2>
          <p className="text-sm">{error}</p>
        </div>
      </main>
    );
  }

  const { kpis, daily_series, api_keys } = summary ?? {
    kpis: { total_executions: 0, total_success: 0, total_failed: 0, overall_success_rate: 0, total_openai_cost_usd: 0 },
    daily_series: [],
    api_keys: [],
  };

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">n8n Operations Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {periodLabel(range)} · {loading ? 'Cargando...' : 'Actualizado'}
          </p>
        </div>

        {/* Date range picker */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Presets */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(['7', '30', '90'] as Preset[]).map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  range.preset === p
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}d
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              max={customTo || today}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <span className="text-gray-400 text-xs">→</span>
            <input
              type="date"
              value={customTo}
              min={customFrom}
              max={today}
              onChange={(e) => setCustomTo(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              onClick={applyCustom}
              disabled={!customFrom || !customTo || customFrom > customTo}
              className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Aplicar
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Live
          </span>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Cargando datos...
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="Total Executions"
              value={kpis.total_executions.toLocaleString()}
              subtitle={periodLabel(range)}
            />
            <KpiCard
              label="Success Rate"
              value={`${kpis.overall_success_rate.toFixed(1)}%`}
              variant={kpis.overall_success_rate >= 95 ? 'success' : 'danger'}
            />
            <KpiCard
              label="Failed Executions"
              value={kpis.total_failed.toLocaleString()}
              variant={kpis.total_failed > 0 ? 'danger' : 'default'}
            />
            <KpiCard
              label="OpenAI Spend"
              value={`$${kpis.total_openai_cost_usd.toFixed(2)}`}
              subtitle={periodLabel(range)}
            />
          </div>

          {/* OpenAI por API Key */}
          {api_keys && api_keys.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">
                  Costo OpenAI por API Key
                </h2>
                <span className="text-xs text-gray-400">
                  Total: ${kpis.total_openai_cost_usd.toFixed(2)} · {periodLabel(range)}
                </span>
              </div>
              <ApiKeyTable keys={api_keys} />
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Tendencia Diaria — Costo OpenAI &amp; Ejecuciones
              </h2>
              <DailyCostChart data={daily_series} />
            </div>
            {workflows && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  Ejecuciones por Workflow (Top 8)
                </h2>
                <WorkflowBarChart data={workflows.workflows} />
              </div>
            )}
          </div>

          {/* Workflow Table */}
          {workflows && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">
                  Workflows con IA — Consumo y Rendimiento
                </h2>
                <span className="text-xs text-gray-400">
                  Solo workflows con API Key de OpenAI · {periodLabel(range)}
                </span>
              </div>
              <WorkflowTable rows={workflows.workflows} />
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <p className="text-xs text-center text-gray-400 pb-4">
        Datos en vivo desde n8n API y OpenAI ·{' '}
        <a
          href="https://n8ncurso-n8n.xhgix3.easypanel.host"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Ver instancia n8n
        </a>
      </p>
    </main>
  );
}
