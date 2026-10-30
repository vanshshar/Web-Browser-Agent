import type { CreateTaskResponse, Task, HealthResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function createTask(taskDescription: string, confirmConsequentialActions = false): Promise<CreateTaskResponse> {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: taskDescription, confirmConsequentialActions }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error?.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function getTaskStatus(taskId: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks/${taskId}`);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error?.message || `Failed to fetch task status (${res.status})`);
  }

  return res.json();
}

export async function cancelTask(taskId: string): Promise<{ taskId: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/tasks/${taskId}/cancel`, {
    method: 'POST',
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error?.message || `Failed to cancel task (${res.status})`);
  }

  return res.json();
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}

