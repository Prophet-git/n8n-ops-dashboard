interface KpiCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'danger' | 'success';
  subtitle?: string;
}

export default function KpiCard({ label, value, variant = 'default', subtitle }: KpiCardProps) {
  const valueColor =
    variant === 'danger'
      ? 'text-red-600'
      : variant === 'success'
      ? 'text-green-600'
      : 'text-gray-900';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${valueColor}`}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}
