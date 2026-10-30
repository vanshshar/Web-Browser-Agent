import { z } from 'zod';
export declare const TaskStatusSchema: z.ZodEnum<["queued", "running", "completed", "failed", "cancelled", "timed_out"]>;
export declare const TaskResultSchema: z.ZodObject<{
    summary: z.ZodString;
    data: z.ZodOptional<z.ZodUnknown>;
    finalUrl: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    summary: string;
    data?: unknown;
    finalUrl?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    summary: string;
    data?: unknown;
    finalUrl?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const TaskErrorSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    taskId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    message: string;
    taskId?: string | undefined;
}, {
    code: string;
    message: string;
    taskId?: string | undefined;
}>;
export declare const TaskActionSchema: z.ZodObject<{
    id: z.ZodString;
    toolName: z.ZodString;
    status: z.ZodEnum<["started", "completed", "failed"]>;
    startedAt: z.ZodString;
    completedAt: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    errorCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "failed" | "started";
    id: string;
    toolName: string;
    startedAt: string;
    summary?: string | undefined;
    completedAt?: string | undefined;
    errorCode?: string | undefined;
}, {
    status: "completed" | "failed" | "started";
    id: string;
    toolName: string;
    startedAt: string;
    summary?: string | undefined;
    completedAt?: string | undefined;
    errorCode?: string | undefined;
}>;
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<["queued", "running", "completed", "failed", "cancelled", "timed_out"]>;
    createdAt: z.ZodString;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    result: z.ZodOptional<z.ZodObject<{
        summary: z.ZodString;
        data: z.ZodOptional<z.ZodUnknown>;
        finalUrl: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        data?: unknown;
        finalUrl?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        summary: string;
        data?: unknown;
        finalUrl?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        taskId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        taskId?: string | undefined;
    }, {
        code: string;
        message: string;
        taskId?: string | undefined;
    }>>;
    actionHistory: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        toolName: z.ZodString;
        status: z.ZodEnum<["started", "completed", "failed"]>;
        startedAt: z.ZodString;
        completedAt: z.ZodOptional<z.ZodString>;
        summary: z.ZodOptional<z.ZodString>;
        errorCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "completed" | "failed" | "started";
        id: string;
        toolName: string;
        startedAt: string;
        summary?: string | undefined;
        completedAt?: string | undefined;
        errorCode?: string | undefined;
    }, {
        status: "completed" | "failed" | "started";
        id: string;
        toolName: string;
        startedAt: string;
        summary?: string | undefined;
        completedAt?: string | undefined;
        errorCode?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    status: "queued" | "running" | "completed" | "failed" | "cancelled" | "timed_out";
    id: string;
    description: string;
    createdAt: string;
    actionHistory: {
        status: "completed" | "failed" | "started";
        id: string;
        toolName: string;
        startedAt: string;
        summary?: string | undefined;
        completedAt?: string | undefined;
        errorCode?: string | undefined;
    }[];
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    result?: {
        summary: string;
        data?: unknown;
        finalUrl?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    } | undefined;
    error?: {
        code: string;
        message: string;
        taskId?: string | undefined;
    } | undefined;
}, {
    status: "queued" | "running" | "completed" | "failed" | "cancelled" | "timed_out";
    id: string;
    description: string;
    createdAt: string;
    actionHistory: {
        status: "completed" | "failed" | "started";
        id: string;
        toolName: string;
        startedAt: string;
        summary?: string | undefined;
        completedAt?: string | undefined;
        errorCode?: string | undefined;
    }[];
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    result?: {
        summary: string;
        data?: unknown;
        finalUrl?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    } | undefined;
    error?: {
        code: string;
        message: string;
        taskId?: string | undefined;
    } | undefined;
}>;
//# sourceMappingURL=task.d.ts.map