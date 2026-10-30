import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskStatus, TaskResult, TaskError } from '@browser-agent/shared';
import { AppError, ERROR_CODES } from '@browser-agent/shared';

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  createTask(description: string): Task {
    const task: Task = {
      id: uuidv4(),
      description,
      status: 'queued',
      createdAt: new Date().toISOString(),
      actionHistory: [],
    };
    this.tasks.set(task.id, task);
    return task;
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getTaskOrThrow(taskId: string): Task {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new AppError({
        code: ERROR_CODES.TASK_NOT_FOUND,
        statusCode: 404,
        message: `Task '${taskId}' not found.`,
        userMessage: 'The requested task was not found.',
      });
    }
    return task;
  }

  updateStatus(taskId: string, status: TaskStatus): void {
    const task = this.getTaskOrThrow(taskId);
    task.status = status;
    if (status === 'running' && !task.startedAt) {
      task.startedAt = new Date().toISOString();
    }
  }

  completeTask(taskId: string, result: TaskResult): void {
    const task = this.getTaskOrThrow(taskId);
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.result = result;
  }

  failTask(taskId: string, error: TaskError): void {
    const task = this.getTaskOrThrow(taskId);
    task.status = (error.code === ERROR_CODES.TASK_TIMEOUT)
      ? 'timed_out'
      : (error.code === ERROR_CODES.TASK_CANCELLED)
      ? 'cancelled'
      : 'failed';
    task.completedAt = new Date().toISOString();
    task.error = error;
  }

  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
      return false;
    }
    task.status = 'cancelled';
    task.completedAt = new Date().toISOString();
    return true;
  }

  getRunningCount(): number {
    let count = 0;
    for (const t of this.tasks.values()) {
      if (t.status === 'running' || t.status === 'queued') {
        count++;
      }
    }
    return count;
  }

  canAcceptTask(): boolean {
    return this.getRunningCount() < this.maxConcurrent;
  }
}

