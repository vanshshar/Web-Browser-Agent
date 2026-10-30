'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createTask, getTaskStatus, cancelTask as cancelTaskApi } from '@/lib/api';
import type { Task, TaskStatus } from '@/types';

const POLL_INTERVAL_MS = 2000;
const TERMINAL_STATUSES: TaskStatus[] = ['completed', 'failed', 'cancelled', 'timed_out'];

export function useTask() {
  const [task, setTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const startPolling = useCallback(
    (taskId: string) => {
      stopPolling();
      pollTimerRef.current = setInterval(async () => {
        try {
          const updated = await getTaskStatus(taskId);
          setTask(updated);
          if (TERMINAL_STATUSES.includes(updated.status)) {
            stopPolling();
          }
        } catch (err) {
          console.error('[Polling error]:', err);
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling],
  );

  const submitTask = useCallback(
    async (description: string, confirmConsequentialActions = false) => {
      setError(null);
      setTask(null);
      setIsSubmitting(true);
      try {
        const response = await createTask(description, confirmConsequentialActions);
        setTask({
          id: response.taskId,
          description,
          status: response.status,
          createdAt: new Date().toISOString(),
          actionHistory: [],
        });
        startPolling(response.taskId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit task');
      } finally {
        setIsSubmitting(false);
      }
    },
    [startPolling],
  );

  const handleCancel = useCallback(async () => {
    if (!task) return;
    try {
      await cancelTaskApi(task.id);
      stopPolling();
      setTask((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel task');
    }
  }, [task, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setTask(null);
    setError(null);
    setIsSubmitting(false);
  }, [stopPolling]);

  return {
    task,
    isSubmitting,
    error,
    submitTask,
    cancelTask: handleCancel,
    reset,
  };
}

