"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSchema = exports.TaskActionSchema = exports.TaskErrorSchema = exports.TaskResultSchema = exports.TaskStatusSchema = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../constants/index.js");
exports.TaskStatusSchema = zod_1.z.enum(index_js_1.TASK_STATUSES);
exports.TaskResultSchema = zod_1.z.object({
    summary: zod_1.z.string(),
    data: zod_1.z.unknown().optional(),
    finalUrl: zod_1.z.string().url().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.TaskErrorSchema = zod_1.z.object({
    code: zod_1.z.string(),
    message: zod_1.z.string(),
    taskId: zod_1.z.string().optional(),
});
exports.TaskActionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    toolName: zod_1.z.string(),
    status: zod_1.z.enum(['started', 'completed', 'failed']),
    startedAt: zod_1.z.string(),
    completedAt: zod_1.z.string().optional(),
    summary: zod_1.z.string().optional(),
    errorCode: zod_1.z.string().optional(),
});
exports.TaskSchema = zod_1.z.object({
    id: zod_1.z.string(),
    description: zod_1.z.string(),
    status: exports.TaskStatusSchema,
    createdAt: zod_1.z.string(),
    startedAt: zod_1.z.string().optional(),
    completedAt: zod_1.z.string().optional(),
    result: exports.TaskResultSchema.optional(),
    error: exports.TaskErrorSchema.optional(),
    actionHistory: zod_1.z.array(exports.TaskActionSchema),
});
//# sourceMappingURL=task.js.map