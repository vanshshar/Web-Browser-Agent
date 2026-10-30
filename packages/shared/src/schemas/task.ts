import { z } from 'zod';
import { TASK_STATUSES } from '../constants/index.js';

export const TaskStatusSchema = z.enum(TASK_STATUSES);

export const TaskResultSchema = z.object({
  summary: z.string(),
  data: z.unknown().optional(),
  finalUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const TaskErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  taskId: z.string().optional(),
});

export const TaskActionSchema = z.object({
  id: z.string(),
  toolName: z.string(),
  status: z.enum(['started', 'completed', 'failed']),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  summary: z.string().optional(),
  errorCode: z.string().optional(),
});

export const TaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  status: TaskStatusSchema,
  createdAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  result: TaskResultSchema.optional(),
  error: TaskErrorSchema.optional(),
  actionHistory: z.array(TaskActionSchema),
});

