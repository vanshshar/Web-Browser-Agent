"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const agent_1 = require("@browser-agent/agent");
const browser_1 = require("@browser-agent/browser");
const shared_1 = require("@browser-agent/shared");
const env_js_1 = require("../config/env.js");
class TaskService {
    taskManager;
    browserManager;
    groqClient;
    agentLoop;
    abortControllers = new Map();
    constructor() {
        const config = (0, env_js_1.getConfig)();
        this.taskManager = new agent_1.TaskManager(config.MAX_CONCURRENT_TASKS);
        this.browserManager = new browser_1.BrowserManager({ headless: config.BROWSER_HEADLESS });
        this.groqClient = new agent_1.GroqClient({
            apiKey: config.GROQ_API_KEY,
            model: config.GROQ_MODEL,
            requestTimeoutMs: config.MODEL_REQUEST_TIMEOUT_MS,
            maxRetries: config.MAX_RETRIES,
        });
        this.agentLoop = new agent_1.AgentLoop(this.groqClient, {
            maxIterations: config.MAX_AGENT_ITERATIONS,
            taskTimeoutMs: config.TASK_TIMEOUT_MS,
        });
    }
    async submitTask(description, confirmConsequentialActions = false) {
        if (!this.taskManager.canAcceptTask()) {
            throw new shared_1.AppError({
                code: shared_1.ERROR_CODES.CONCURRENCY_LIMIT_REACHED,
                statusCode: 429,
                message: 'Maximum concurrent tasks limit reached. Please wait for active tasks to complete.',
                userMessage: 'The server is currently processing the maximum number of simultaneous tasks. Please try again shortly.',
            });
        }
        const task = this.taskManager.createTask(description);
        this.runTaskLifecycle(task.id, description, confirmConsequentialActions).catch((err) => {
            console.error(`[TaskService] Background execution error on task ${task.id}:`, err);
        });
        return { taskId: task.id, status: task.status };
    }
    async runTaskLifecycle(taskId, description, confirmConsequentialActions) {
        const abortController = new AbortController();
        this.abortControllers.set(taskId, abortController);
        let session = null;
        try {
            this.taskManager.updateStatus(taskId, 'running');
            await this.browserManager.initialize();
            session = await this.browserManager.createSession(taskId, confirmConsequentialActions);
            const loopResult = await this.agentLoop.execute(description, session, abortController.signal);
            this.taskManager.completeTask(taskId, {
                summary: loopResult.summary,
                finalUrl: loopResult.finalUrl,
                metadata: { iterationsUsed: loopResult.iterationsUsed },
            });
            const updatedTask = this.taskManager.getTask(taskId);
            if (updatedTask) {
                updatedTask.actionHistory = loopResult.actionHistory;
            }
        }
        catch (err) {
            const appErr = err instanceof shared_1.AppError ? err : new shared_1.AppError({
                code: shared_1.ERROR_CODES.INTERNAL_ERROR,
                statusCode: 500,
                message: err instanceof Error ? err.message : String(err),
            });
            this.taskManager.failTask(taskId, {
                code: appErr.code,
                message: appErr.userMessage,
                taskId,
            });
        }
        finally {
            this.abortControllers.delete(taskId);
            if (session) {
                try {
                    await this.browserManager.closeSession(taskId);
                }
                catch (e) {
                    console.error(`[TaskService] Session cleanup failure for task ${taskId}:`, e);
                }
            }
        }
    }
    getTask(taskId) {
        return this.taskManager.getTaskOrThrow(taskId);
    }
    async cancelTask(taskId) {
        const task = this.taskManager.getTaskOrThrow(taskId);
        if (task.status !== 'running' && task.status !== 'queued') {
            return { taskId, status: task.status };
        }
        const controller = this.abortControllers.get(taskId);
        if (controller) {
            controller.abort();
        }
        this.taskManager.cancelTask(taskId);
        try {
            await this.browserManager.closeSession(taskId);
        }
        catch { }
        return { taskId, status: 'cancelled' };
    }
    async shutdown() {
        for (const controller of this.abortControllers.values()) {
            controller.abort();
        }
        await this.browserManager.shutdown();
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=taskService.js.map