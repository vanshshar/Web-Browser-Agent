import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import healthRouter from '../src/routes/health.js';
import { createTaskRouter } from '../src/routes/tasks.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import type { TaskService } from '../src/services/taskService.js';
import { AppError, ERROR_CODES } from '@browser-agent/shared';

describe('API Routes', () => {
  it('GET /api/health returns 200 and ok status', async () => {
    const app = express();
    app.use('/api/health', healthRouter);

    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  it('POST /api/tasks validates required prompt and rejects empty body', async () => {
    const mockTaskService = { submitTask: vi.fn() } as unknown as TaskService;
    const app = express();
    app.use(express.json());
    app.use('/api/tasks', createTaskRouter(mockTaskService));
    app.use(errorHandler);

    const response = await request(app).post('/api/tasks').send({});
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('POST /api/tasks accepts valid task and returns 202 with taskId', async () => {
    const mockTaskService = {
      submitTask: vi.fn().mockResolvedValue({ taskId: '11111111-1111-4111-8111-111111111111', status: 'queued' }),
    } as unknown as TaskService;
    const app = express();
    app.use(express.json());
    app.use('/api/tasks', createTaskRouter(mockTaskService));
    app.use(errorHandler);

    const response = await request(app)
      .post('/api/tasks')
      .send({ task: 'Navigate to https://example.com', confirmConsequentialActions: false });

    expect(response.status).toBe(202);
    expect(response.body.taskId).toBe('11111111-1111-4111-8111-111111111111');
    expect(response.body.status).toBe('queued');
    expect(mockTaskService.submitTask).toHaveBeenCalledWith(
      'Navigate to https://example.com',
      false,
    );
  });

  it('GET /api/tasks/:taskId returns task data or 404 for unknown task', async () => {
    const mockTaskService = {
      getTask: vi.fn().mockImplementation((id: string) => {
        if (id === '11111111-1111-4111-8111-111111111111') {
          return { id, description: 'Sample task', status: 'completed', createdAt: new Date().toISOString(), actionHistory: [] };
        }
        throw new AppError({ code: ERROR_CODES.TASK_NOT_FOUND, statusCode: 404, message: 'Task not found' });
      }),
    } as unknown as TaskService;
    const app = express();
    app.use('/api/tasks', createTaskRouter(mockTaskService));
    app.use(errorHandler);

    const found = await request(app).get('/api/tasks/11111111-1111-4111-8111-111111111111');
    expect(found.status).toBe(200);
    expect(found.body.id).toBe('11111111-1111-4111-8111-111111111111');

    const notFound = await request(app).get('/api/tasks/00000000-0000-4000-8000-000000000000');
    expect(notFound.status).toBe(404);
    expect(notFound.body.error.code).toBe(ERROR_CODES.TASK_NOT_FOUND);
  });
});
