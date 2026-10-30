import { z } from 'zod';
import { DEFAULTS } from '../constants/index.js';

export const AppConfigSchema = z.object({
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required.'),
  GROQ_MODEL: z.string().min(1, 'GROQ_MODEL is required.'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  API_PORT: z.coerce.number().int().positive().default(DEFAULTS.API_PORT),
  WEB_ORIGIN: z.string().url().default(DEFAULTS.WEB_ORIGIN),
  BROWSER_HEADLESS: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default('true'),
  TASK_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULTS.TASK_TIMEOUT_MS),
  MAX_AGENT_ITERATIONS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULTS.MAX_AGENT_ITERATIONS),
  BROWSER_ACTION_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULTS.BROWSER_ACTION_TIMEOUT_MS),
  MODEL_REQUEST_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULTS.MODEL_REQUEST_TIMEOUT_MS),
  MAX_CONCURRENT_TASKS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULTS.MAX_CONCURRENT_TASKS),
  MAX_TASK_LENGTH: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULTS.MAX_TASK_LENGTH),
  MAX_RETRIES: z.coerce
    .number()
    .int()
    .min(0)
    .default(DEFAULTS.MAX_RETRIES),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

