import { z } from 'zod';
export declare const CreateTaskRequestSchema: z.ZodObject<{
    task: z.ZodString;
    confirmConsequentialActions: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    task: string;
    confirmConsequentialActions: boolean;
}, {
    task: string;
    confirmConsequentialActions?: boolean | undefined;
}>;
export declare const TaskIdParamSchema: z.ZodObject<{
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taskId: string;
}, {
    taskId: string;
}>;
//# sourceMappingURL=api.d.ts.map