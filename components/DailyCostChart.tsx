'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DailySeries } from '@/types/dashboard';

interface Props {
  data: DailySeries[];
}

export default function DailyCostChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis
          yAxisId="cost"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={(v: number) => `$${v.toFixed(2)}`}
          width={55}
        />
        <YAxis
          yAxisId="exec"
          orientation="right"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          width={40}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'openai_cost') return [`$${value.toFixed(4)}`, 'OpenAI Cost'];
            if (name === 'executions') return [value, 'Executions'];
            return [value, name];
          }}
          labelFormatter={(label: string) => `Date: ${label}`}
        />
        <Legend
          formatter={(value) =>
            value === 'openai_cost' ? 'OpenAI Cost (USD)' : 'Executions'
          }
        />
        <Line
          yAxisId="cost"
          type="monotone"
          dataKey="openai_cost"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          yAxisId="exec"
          type="monotone"
          dataKey="executions"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
