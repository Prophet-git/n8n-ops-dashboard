'use client';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { DailyBucket } from '@/types/monitor';

export default function ExecutionTimeline({ data }: { data: DailyBucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#f5f5f7" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#86868b' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(d) => {
            const dt = new Date(d);
            return `${dt.getDate()}/${dt.getMonth() + 1}`;
          }}
        />
        <YAxis tick={{ fontSize: 11, fill: '#86868b' }} tickLine={false} axisLine={false} width={28} />
        <Tooltip
          contentStyle={{
            border: 'none',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            fontSize: 12,
          }}
          labelFormatter={(d) => new Date(d as string).toLocaleDateString('es-AR')}
        />
        <Bar dataKey="success" stackId="a" fill="#34c759" radius={[0, 0, 0, 0]} />
        <Bar dataKey="failed" stackId="a" fill="#ff3b30" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
