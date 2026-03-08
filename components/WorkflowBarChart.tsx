'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { WorkflowRow } from '@/types/dashboard';

interface Props {
  data: WorkflowRow[];
}

export default function WorkflowBarChart({ data }: Props) {
  const chartData = data.slice(0, 8).map((w) => ({
    name:
      w.workflow_name.length > 20
        ? w.workflow_name.slice(0, 20) + '…'
        : w.workflow_name,
    Executions: w.total_executions,
    Failed: w.failed_count,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: '#6b7280' }}
          width={130}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="Executions" fill="#6366f1" radius={[0, 4, 4, 0]} />
        <Bar dataKey="Failed" fill="#f87171" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
