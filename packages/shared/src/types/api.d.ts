import type { Task, TaskStatus, TaskError } from './task.js';
/** POST /api/tasks request body */
export interface CreateTaskRequest {
    task: string;
}
/** POST /api/tasks response */
export interface CreateTaskResponse {
    taskId: string;
    status: TaskStatus;
}
/** GET /api/tasks/:taskId response */
export type TaskStatusResponse = Task;
/** POST /api/tasks/:taskId/cancel response */
export interface CancelTaskResponse {
    taskId: string;
    status: TaskStatus;
}
/** GET /api/health response */
export interface HealthResponse {
    status: 'ok';
    timestamp: string;
}
/** Standard API error response */
export interface ApiErrorResponse {
    error: TaskError;
}
//# sourceMappingURL=api.d.ts.map