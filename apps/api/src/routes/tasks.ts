import { Router } from 'express';
import { CreateTaskRequestSchema, TaskIdParamSchema } from '@browser-agent/shared';
import { validateBody, validateParams } from '../middleware/validateRequest.js';
import type { TaskService } from '../services/taskService.js';

export function createTaskRouter(taskService: TaskService): Router {
  const router = Router();

  // POST /api/tasks - create and start a new task
  router.post('/', validateBody(CreateTaskRequestSchema), async (req, res, next) => {
    try {
      const { taskId, status } = await taskService.submitTask(
        req.body.task,
        req.body.confirmConsequentialActions === true,
      );
      res.status(202).json({ taskId, status });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/tasks/:taskId - retrieve task status and results
  router.get('/:taskId', validateParams(TaskIdParamSchema), async (req, res, next) => {
    try {
      const task = taskService.getTask(req.params.taskId);
      res.json(task);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/tasks/:taskId/cancel - cancel an active task
  router.post('/:taskId/cancel', validateParams(TaskIdParamSchema), async (req, res, next) => {
    try {
      const result = await taskService.cancelTask(req.params.taskId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

