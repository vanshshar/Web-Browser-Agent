import { describe, it, expect } from 'vitest';
import { TaskManager } from '../src/task-manager.js';
import { AppError, ERROR_CODES } from '@browser-agent/shared';

describe('TaskManager', () => {
  it('creates tasks in queued state with generated UUID', () => {
    const tm = new TaskManager(2);
    const task = tm.createTask('Test task prompt');

    expect(task.id).toBeDefined();
    expect(task.status).toBe('queued');
    expect(task.description).toBe('Test task prompt');
    expect(task.actionHistory).toEqual([]);
  });

  it('updates task status correctly', () => {
    const tm = new TaskManager(2);
    const task = tm.createTask('Test');
    tm.updateStatus(task.id, 'running');

    const fetched = tm.getTask(task.id);
    expect(fetched?.status).toBe('running');
    expect(fetched?.startedAt).toBeDefined();
  });

  it('completes task with results', () => {
    const tm = new TaskManager(2);
    const task = tm.createTask('Test');
    tm.completeTask(task.id, {
      summary: 'Done successfully.',
      finalUrl: 'https://example.com',
    });

    const fetched = tm.getTask(task.id);
    expect(fetched?.status).toBe('completed');
    expect(fetched?.result?.summary).toBe('Done successfully.');
    expect(fetched?.completedAt).toBeDefined();
  });

  it('enforces concurrency limit', () => {
    const tm = new TaskManager(1);
    expect(tm.canAcceptTask()).toBe(true);

    const task1 = tm.createTask('Task 1');
    tm.updateStatus(task1.id, 'running');

    expect(tm.canAcceptTask()).toBe(false);

    tm.completeTask(task1.id, { summary: 'finished' });
    expect(tm.canAcceptTask()).toBe(true);
  });

  it('throws TASK_NOT_FOUND when task does not exist', () => {
    const tm = new TaskManager(2);
    expect(() => tm.getTaskOrThrow('non-existent-id')).toThrow(AppError);
  });
});

