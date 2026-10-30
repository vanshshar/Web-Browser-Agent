"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskIdParamSchema = exports.CreateTaskRequestSchema = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../constants/index.js");
exports.CreateTaskRequestSchema = zod_1.z.object({
    task: zod_1.z
        .string()
        .min(1, 'Task description must not be empty.')
        .max(index_js_1.DEFAULTS.MAX_TASK_LENGTH, `Task description must not exceed ${index_js_1.DEFAULTS.MAX_TASK_LENGTH} characters.`),
    confirmConsequentialActions: zod_1.z.boolean().optional().default(false),
});
exports.TaskIdParamSchema = zod_1.z.object({
    taskId: zod_1.z.string().uuid('Invalid task ID format.'),
});
//# sourceMappingURL=api.js.map