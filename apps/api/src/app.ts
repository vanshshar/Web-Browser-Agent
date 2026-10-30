import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import { createTaskRouter } from './routes/tasks.js';
import { errorHandler } from './middleware/errorHandler.js';
import type { TaskService } from './services/taskService.js';
import { getConfig } from './config/env.js';

export function createApp(taskService: TaskService): express.Express {
  const config = getConfig();
  const app = express();

  app.use(cors({ origin: config.WEB_ORIGIN }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/tasks', createTaskRouter(taskService));

  app.use(errorHandler);

  return app;
}

