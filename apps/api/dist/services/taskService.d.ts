import type { Task } from '@browser-agent/shared';
export declare class TaskService {
    private taskManager;
    private browserManager;
    private groqClient;
    private agentLoop;
    private abortControllers;
    constructor();
    submitTask(description: string, confirmConsequentialActions?: boolean): Promise<{
        taskId: string;
        status: string;
    }>;
    private runTaskLifecycle;
    getTask(taskId: string): Task;
    cancelTask(taskId: string): Promise<{
        taskId: string;
        status: string;
    }>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=taskService.d.ts.map