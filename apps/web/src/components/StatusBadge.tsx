import type { TaskStatus } from '@/types';

const STATUS_CONFIG: Record<
  TaskStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  queued: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Queued' },
  running: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', label: 'Running' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', label: 'Completed' },
  failed: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300', label: 'Failed' },
  cancelled: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', label: 'Cancelled' },
  timed_out: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', label: 'Timed Out' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.running;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${conf.bg} ${conf.text} ${conf.border}`}
    >
      {status === 'running' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
        </span>
      )}
      {conf.label}
    </span>
  );
}

