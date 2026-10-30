import type { CreateTaskResponse, Task, HealthResponse } from '@/types';
export declare function createTask(taskDescription: string): Promise<CreateTaskResponse>;
export declare function getTaskStatus(taskId: string): Promise<Task>;
export declare function cancelTask(taskId: string): Promise<{
    taskId: string;
    status: string;
}>;
export declare function checkHealth(): Promise<HealthResponse>;
//# sourceMappingURL=api.d.ts.map