import type { ExecutionStatus } from '@/types/monitor';

const COLORS: Record<ExecutionStatus, string> = {
  success: '#34c759',
  failed: '#ff3b30',
  running: '#ff9500',
  unknown: '#8e8e93',
};

export default function StatusDot({
  status,
  size = 10,
  pulse,
}: {
  status: ExecutionStatus;
  size?: number;
  pulse?: boolean;
}) {
  return (
    <span
      className={`inline-block rounded-full ${pulse && status === 'running' ? 'animate-pulse' : ''}`}
      style={{
        width: size,
        height: size,
        background: COLORS[status],
        boxShadow: status === 'failed' ? `0 0 0 3px ${COLORS.failed}22` : undefined,
      }}
      aria-label={status}
    />
  );
}
