'use client';

import { TaskForm } from '@/components/TaskForm';
import { TaskResult } from '@/components/TaskResult';
import { StatusBadge } from '@/components/StatusBadge';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { useTask } from '@/hooks/useTask';

export default function HomePage() {
  const { task, isSubmitting, error, submitTask, cancelTask, reset } = useTask();

  const isTerminal = task && ['completed', 'failed', 'cancelled', 'timed_out'].includes(task.status);
  const isExecuting = task && (task.status === 'running' || task.status === 'queued');

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="text-center space-y-3">
        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold uppercase tracking-wider">
          TypeScript / Playwright / Groq
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Browser Automation Agent
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-base">
          Accepts natural-language instructions, plans navigation steps with Groq LLM inference,
          and executes multi-step workflows securely through Playwright.
        </p>
      </header>

      {/* Main Task Form */}
      <TaskForm
        onSubmit={submitTask}
        isSubmitting={isSubmitting}
        disabled={!!isExecuting}
      />

      {/* Global Form/API Error Display */}
      {error && <ErrorDisplay message={error} onDismiss={() => reset()} />}

      {/* Task Lifecycle View */}
      {task && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">
                ID: {task.id.slice(0, 8)}...
              </span>
              <StatusBadge status={task.status} />
            </div>

            {isExecuting && (
              <button
                onClick={cancelTask}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline transition"
              >
                Cancel Execution
              </button>
            )}
          </div>

          <TaskResult task={task} />

          {isTerminal && (
            <button
              onClick={reset}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium rounded-xl text-sm transition shadow-sm"
            >
              Start Another Task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

