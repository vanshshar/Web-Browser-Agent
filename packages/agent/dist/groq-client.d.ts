export interface GroqConfig {
    apiKey: string;
    model: string;
    requestTimeoutMs?: number;
    maxRetries?: number;
}
export interface GroqMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
            name: string;
            arguments: string;
        };
    }>;
    tool_call_id?: string;
}
export interface GroqCompletionResult {
    message: GroqMessage;
    finishReason: string | null;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export declare class GroqClient {
    private client;
    private readonly model;
    private readonly requestTimeoutMs;
    private readonly maxRetries;
    constructor(config: GroqConfig);
    getModel(): string;
    createCompletion(messages: GroqMessage[], tools?: Array<{
        type: 'function';
        function: {
            name: string;
            description: string;
            parameters: object;
        };
    }>): Promise<GroqCompletionResult>;
}
//# sourceMappingURL=groq-client.d.ts.map