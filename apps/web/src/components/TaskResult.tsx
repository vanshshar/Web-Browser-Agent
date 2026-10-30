import type { Task } from '@/types';

export function TaskResult({ task }: { task: Task }) {
  const isPending = task.status === 'running' || task.status === 'queued';

  if (isPending) {
    return (
      <div className="p-8 text-center bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
        <div className="flex justify-center items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-semibold text-blue-900 text-base">
            Browser Automation in Progress...
          </span>
        </div>
        <p className="text-sm text-blue-700">
          The agent is orchestrating browser actions through Playwright and reasoning via Groq.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Result Section */}
      {task.result && (
        <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl shadow-sm space-y-3">
          <h3 className="text-base font-semibold text-emerald-950 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Execution Result
          </h3>
          <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
            {task.result.summary}
          </p>
          {task.result.finalUrl && (
            <div className="text-xs text-slate-500 pt-2 border-t border-emerald-100 flex items-center gap-1.5">
              <span className="font-medium text-slate-600">Final Destination:</span>
              <a
                href={task.result.finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {task.result.finalUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Error Section */}
      {task.error && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm space-y-2">
          <h3 className="text-base font-semibold text-rose-950 flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Task Execution Failed
          </h3>
          <p className="text-rose-800 text-sm">{task.error.message}</p>
          <p className="text-xs text-rose-600/80 font-mono">Code: {task.error.code}</p>
        </div>
      )}

      {/* Action History */}
      {task.actionHistory && task.actionHistory.length > 0 && (
        <details className="group bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" open>
          <summary className="px-6 py-4 cursor-pointer select-none font-semibold text-slate-800 flex justify-between items-center group-hover:bg-slate-50 transition">
            <span>Action Audit Trail ({task.actionHistory.length} browser actions)</span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="px-6 pb-6 pt-2 space-y-3 border-t border-slate-100">
            {task.actionHistory.map((action, i) => (
              <div key={action.id || i} className="flex items-start gap-3 text-xs leading-relaxed">
                <span
                  className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                    action.status === 'completed'
                      ? 'bg-emerald-500'
                      : action.status === 'failed'
                      ? 'bg-rose-500'
                      : 'bg-blue-400'
                  }`}
                />
                <div className="flex-1">
                  <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                    {action.toolName}
                  </span>
                  {action.summary && (
                    <span className="text-slate-600 ml-2">{action.summary}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

