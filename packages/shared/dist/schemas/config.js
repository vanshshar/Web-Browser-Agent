"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigSchema = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../constants/index.js");
exports.AppConfigSchema = zod_1.z.object({
    GROQ_API_KEY: zod_1.z.string().min(1, 'GROQ_API_KEY is required.'),
    GROQ_MODEL: zod_1.z.string().min(1, 'GROQ_MODEL is required.'),
    NODE_ENV: zod_1.z
        .enum(['development', 'production', 'test'])
        .default('development'),
    API_PORT: zod_1.z.coerce.number().int().positive().default(index_js_1.DEFAULTS.API_PORT),
    WEB_ORIGIN: zod_1.z.string().url().default(index_js_1.DEFAULTS.WEB_ORIGIN),
    BROWSER_HEADLESS: zod_1.z
        .enum(['true', 'false'])
        .transform((v) => v === 'true')
        .default('true'),
    TASK_TIMEOUT_MS: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default(index_js_1.DEFAULTS.TASK_TIMEOUT_MS),
    MAX_AGENT_ITERATIONS: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default(index_js_1.DEFAULTS.MAX_AGENT_ITERATIONS),
    BROWSER_ACTION_TIMEOUT_MS: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default(index_js_1.DEFAULTS.BROWSER_ACTION_TIMEOUT_MS),
    MODEL_REQUEST_TIMEOUT_MS: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default(index_js_1.DEFAULTS.MODEL_REQUEST_TIMEOUT_MS),
    MAX_CONCURRENT_TASKS: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default(index_js_1.DEFAULTS.MAX_CONCURRENT_TASKS),
    MAX_TASK_LENGTH: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .default(index_js_1.DEFAULTS.MAX_TASK_LENGTH),
    MAX_RETRIES: zod_1.z.coerce
        .number()
        .int()
        .min(0)
        .default(index_js_1.DEFAULTS.MAX_RETRIES),
});
//# sourceMappingURL=config.js.map