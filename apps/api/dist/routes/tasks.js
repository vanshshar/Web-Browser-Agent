"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskRouter = createTaskRouter;
const express_1 = require("express");
const shared_1 = require("@browser-agent/shared");
const validateRequest_js_1 = require("../middleware/validateRequest.js");
function createTaskRouter(taskService) {
    const router = (0, express_1.Router)();
    // POST /api/tasks - create and start a new task
    router.post('/', (0, validateRequest_js_1.validateBody)(shared_1.CreateTaskRequestSchema), async (req, res, next) => {
        try {
            const { taskId, status } = await taskService.submitTask(req.body.task, req.body.confirmConsequentialActions === true);
            res.status(202).json({ taskId, status });
        }
        catch (err) {
            next(err);
        }
    });
    // GET /api/tasks/:taskId - retrieve task status and results
    router.get('/:taskId', (0, validateRequest_js_1.validateParams)(shared_1.TaskIdParamSchema), async (req, res, next) => {
        try {
            const task = taskService.getTask(req.params.taskId);
            res.json(task);
        }
        catch (err) {
            next(err);
        }
    });
    // POST /api/tasks/:taskId/cancel - cancel an active task
    router.post('/:taskId/cancel', (0, validateRequest_js_1.validateParams)(shared_1.TaskIdParamSchema), async (req, res, next) => {
        try {
            const result = await taskService.cancelTask(req.params.taskId);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    });
    return router;
}
//# sourceMappingURL=tasks.js.map