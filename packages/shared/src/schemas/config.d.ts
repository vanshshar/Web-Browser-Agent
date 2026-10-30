import { z } from 'zod';
export declare const AppConfigSchema: z.ZodObject<{
    GROQ_API_KEY: z.ZodString;
    GROQ_MODEL: z.ZodDefault<z.ZodString>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    API_PORT: z.ZodDefault<z.ZodNumber>;
    WEB_ORIGIN: z.ZodDefault<z.ZodString>;
    BROWSER_HEADLESS: z.ZodDefault<z.ZodEffects<z.ZodEnum<["true", "false"]>, boolean, "true" | "false">>;
    TASK_TIMEOUT_MS: z.ZodDefault<z.ZodNumber>;
    MAX_AGENT_ITERATIONS: z.ZodDefault<z.ZodNumber>;
    BROWSER_ACTION_TIMEOUT_MS: z.ZodDefault<z.ZodNumber>;
    MODEL_REQUEST_TIMEOUT_MS: z.ZodDefault<z.ZodNumber>;
    MAX_CONCURRENT_TASKS: z.ZodDefault<z.ZodNumber>;
    MAX_TASK_LENGTH: z.ZodDefault<z.ZodNumber>;
    MAX_RETRIES: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    GROQ_API_KEY: string;
    GROQ_MODEL: string;
    NODE_ENV: "development" | "production" | "test";
    API_PORT: number;
    WEB_ORIGIN: string;
    BROWSER_HEADLESS: boolean;
    TASK_TIMEOUT_MS: number;
    MAX_AGENT_ITERATIONS: number;
    BROWSER_ACTION_TIMEOUT_MS: number;
    MODEL_REQUEST_TIMEOUT_MS: number;
    MAX_CONCURRENT_TASKS: number;
    MAX_TASK_LENGTH: number;
    MAX_RETRIES: number;
}, {
    GROQ_API_KEY: string;
    GROQ_MODEL?: string | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    API_PORT?: number | undefined;
    WEB_ORIGIN?: string | undefined;
    BROWSER_HEADLESS?: "true" | "false" | undefined;
    TASK_TIMEOUT_MS?: number | undefined;
    MAX_AGENT_ITERATIONS?: number | undefined;
    BROWSER_ACTION_TIMEOUT_MS?: number | undefined;
    MODEL_REQUEST_TIMEOUT_MS?: number | undefined;
    MAX_CONCURRENT_TASKS?: number | undefined;
    MAX_TASK_LENGTH?: number | undefined;
    MAX_RETRIES?: number | undefined;
}>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
//# sourceMappingURL=config.d.ts.map