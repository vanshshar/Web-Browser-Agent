'use client';

import { useState, type FormEvent } from 'react';

interface TaskFormProps {
  onSubmit: (description: string, confirmConsequentialActions: boolean) => Promise<void>;
  isSubmitting: boolean;
  disabled: boolean;
}

export function TaskForm({ onSubmit, isSubmitting, disabled }: TaskFormProps) {
  const [prompt, setPrompt] = useState('');
  const [confirmConsequentialActions, setConfirmConsequentialActions] = useState(false);
  const MAX_CHARS = 5000;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = prompt.trim();
    if (!clean || isSubmitting || disabled) return;
    await onSubmit(clean, confirmConsequentialActions);
  };

  const isValid = prompt.trim().length > 0 && prompt.length <= MAX_CHARS;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div>
        <label htmlFor="task-prompt" className="block text-sm font-semibold text-slate-800 mb-2">
          Natural Language Browser Task
        </label>
        <textarea
          id="task-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. 'Navigate to https://news.ycombinator.com, find the top article title, and summarize it.'"
          rows={4}
          maxLength={MAX_CHARS}
          disabled={isSubmitting || disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed resize-y transition"
        />
        <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
          <span>Explain the goal and any required parameters or URL clearly.</span>
          <span>
            {prompt.length} / {MAX_CHARS}
          </span>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={confirmConsequentialActions}
          onChange={(event) => setConfirmConsequentialActions(event.target.checked)}
          disabled={isSubmitting || disabled}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span>
          I explicitly authorize consequential actions such as purchases, submissions, sends, deletions, or account changes.
        </span>
      </label>

      <button
        type="submit"
        disabled={!isValid || isSubmitting || disabled}
        className="w-full py-3.5 px-6 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow transition flex justify-center items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Submitting Task...</span>
          </>
        ) : (
          <span>Execute Browser Workflow</span>
        )}
      </button>
    </form>
  );
}

