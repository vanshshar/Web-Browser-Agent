import type { Task, TaskStatus, TaskResult, TaskError } from '@browser-agent/shared';
export declare class TaskManager {
    private tasks;
    private maxConcurrent;
    constructor(maxConcurrent?: number);
    createTask(description: string): Task;
    getTask(taskId: string): Task | undefined;
    getTaskOrThrow(taskId: string): Task;
    updateStatus(taskId: string, status: TaskStatus): void;
    completeTask(taskId: string, result: TaskResult): void;
    failTask(taskId: string, error: TaskError): void;
    cancelTask(taskId: string): boolean;
    getRunningCount(): number;
    canAcceptTask(): boolean;
}
//# sourceMappingURL=task-manager.d.ts.map