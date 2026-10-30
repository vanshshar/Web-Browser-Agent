"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskManager = void 0;
const uuid_1 = require("uuid");
const shared_1 = require("@browser-agent/shared");
class TaskManager {
    tasks = new Map();
    maxConcurrent;
    constructor(maxConcurrent = 3) {
        this.maxConcurrent = maxConcurrent;
    }
    createTask(description) {
        const task = {
            id: (0, uuid_1.v4)(),
            description,
            status: 'queued',
            createdAt: new Date().toISOString(),
            actionHistory: [],
        };
        this.tasks.set(task.id, task);
        return task;
    }
    getTask(taskId) {
        return this.tasks.get(taskId);
    }
    getTaskOrThrow(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new shared_1.AppError({
                code: shared_1.ERROR_CODES.TASK_NOT_FOUND,
                statusCode: 404,
                message: `Task '${taskId}' not found.`,
                userMessage: 'The requested task was not found.',
            });
        }
        return task;
    }
    updateStatus(taskId, status) {
        const task = this.getTaskOrThrow(taskId);
        task.status = status;
        if (status === 'running' && !task.startedAt) {
            task.startedAt = new Date().toISOString();
        }
    }
    completeTask(taskId, result) {
        const task = this.getTaskOrThrow(taskId);
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        task.result = result;
    }
    failTask(taskId, error) {
        const task = this.getTaskOrThrow(taskId);
        task.status = (error.code === shared_1.ERROR_CODES.TASK_TIMEOUT)
            ? 'timed_out'
            : (error.code === shared_1.ERROR_CODES.TASK_CANCELLED)
                ? 'cancelled'
                : 'failed';
        task.completedAt = new Date().toISOString();
        task.error = error;
    }
    cancelTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task)
            return false;
        if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
            return false;
        }
        task.status = 'cancelled';
        task.completedAt = new Date().toISOString();
        return true;
    }
    getRunningCount() {
        let count = 0;
        for (const t of this.tasks.values()) {
            if (t.status === 'running' || t.status === 'queued') {
                count++;
            }
        }
        return count;
    }
    canAcceptTask() {
        return this.getRunningCount() < this.maxConcurrent;
    }
}
exports.TaskManager = TaskManager;
//# sourceMappingURL=task-manager.js.map