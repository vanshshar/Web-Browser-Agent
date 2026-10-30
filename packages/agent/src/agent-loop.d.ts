import { GroqClient } from './groq-client.js';
import type { BrowserSession } from '@browser-agent/browser';
import type { TaskAction } from '@browser-agent/shared';
export interface AgentLoopConfig {
    maxIterations: number;
    taskTimeoutMs: number;
}
export interface AgentLoopResult {
    summary: string;
    finalUrl?: string;
    actionHistory: TaskAction[];
    iterationsUsed: number;
}
export declare class AgentLoop {
    private groqClient;
    private config;
    constructor(groqClient: GroqClient, config: AgentLoopConfig);
    execute(taskDescription: string, session: BrowserSession, abortSignal?: AbortSignal): Promise<AgentLoopResult>;
}
//# sourceMappingURL=agent-loop.d.ts.map