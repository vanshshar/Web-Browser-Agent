import { TASK_STATUSES } from '../constants/index.js';

/** Task status union type */
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Structured task result */
export interface TaskResult {
  summary: string;
  data?: unknown;
  finalUrl?: string;
  metadata?: Record<string, unknown>;
}

/** Structured task error */
export interface TaskError {
  code: string;
  message: string;
  taskId?: string;
}

/** Record of a single tool action within a task */
export interface TaskAction {
  id: string;
  toolName: string;
  status: 'started' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  summary?: string;
  errorCode?: string;
}

/** Complete task representation */
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

