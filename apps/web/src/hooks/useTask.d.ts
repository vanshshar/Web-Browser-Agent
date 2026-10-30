export declare function useTask(): {
    task: any;
    isSubmitting: boolean;
    error: string | null;
    submitTask: (description: string) => Promise<void>;
    cancelTask: () => Promise<void>;
    reset: () => void;
};
//# sourceMappingURL=useTask.d.ts.map