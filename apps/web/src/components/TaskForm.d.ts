interface TaskFormProps {
    onSubmit: (description: string) => Promise<void>;
    isSubmitting: boolean;
    disabled: boolean;
}
export declare function TaskForm({ onSubmit, isSubmitting, disabled }: TaskFormProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=TaskForm.d.ts.map