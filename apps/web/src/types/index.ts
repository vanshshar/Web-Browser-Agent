export type TaskStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timed_out';

export interface TaskResult {
  summary: string;
  data?: unknown;
  finalUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface TaskError {
  code: string;
  message: string;
  taskId?: string;
}

export interface TaskAction {
  id: string;
  toolName: string;
  status: 'started' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  summary?: string;
  errorCode?: string;
}

export interface Task {
  id: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: TaskResult;
  error?: TaskError;
  actionHistory: TaskAction[];
}

export interface CreateTaskResponse {
  taskId: string;
  status: TaskStatus;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

