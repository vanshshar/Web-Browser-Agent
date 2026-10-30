import { z } from 'zod';
import { DEFAULTS } from '../constants/index.js';

export const CreateTaskRequestSchema = z.object({
  task: z
    .string()
    .min(1, 'Task description must not be empty.')
    .max(
      DEFAULTS.MAX_TASK_LENGTH,
      `Task description must not exceed ${DEFAULTS.MAX_TASK_LENGTH} characters.`,
    ),
  confirmConsequentialActions: z.boolean().optional().default(false),
});

export const TaskIdParamSchema = z.object({
  taskId: z.string().uuid('Invalid task ID format.'),
});

