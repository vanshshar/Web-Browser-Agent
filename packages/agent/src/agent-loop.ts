import { v4 as uuidv4 } from 'uuid';
import { GroqClient, type GroqMessage } from './groq-client.js';
import { SYSTEM_PROMPT } from './prompts/system.js';
import { TOOL_DEFINITIONS, executeRegisteredTool } from './tools/registry.js';
import type { BrowserSession } from '@browser-agent/browser';
import type { TaskAction } from '@browser-agent/shared';
import { AppError, ERROR_CODES } from '@browser-agent/shared';

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

export class AgentLoop {
  constructor(
    private groqClient: GroqClient,
    private config: AgentLoopConfig,
  ) {}

  async execute(
    taskDescription: string,
    session: BrowserSession,
    abortSignal?: AbortSignal,
  ): Promise<AgentLoopResult> {
    const actionHistory: TaskAction[] = [];
    const messages: GroqMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: taskDescription },
    ];

    const deadline = Date.now() + this.config.taskTimeoutMs;
    let iterations = 0;

    while (iterations < this.config.maxIterations) {
      if (abortSignal?.aborted) {
        throw new AppError({
          code: ERROR_CODES.TASK_CANCELLED,
          message: 'Task was cancelled by the user.',
          userMessage: 'Task was cancelled.',
        });
      }

      if (Date.now() > deadline) {
        throw new AppError({
          code: ERROR_CODES.TASK_TIMEOUT,
          message: `Task execution exceeded deadline of ${this.config.taskTimeoutMs}ms.`,
          userMessage: 'The task timed out before completing.',
        });
      }

      iterations++;

      const completion = await this.groqClient.createCompletion(messages, TOOL_DEFINITIONS);
      messages.push(completion.message);

      if (completion.message.tool_calls && completion.message.tool_calls.length > 0) {
        for (const toolCall of completion.message.tool_calls) {
          const actionId = uuidv4();
          const action: TaskAction = {
            id: actionId,
            toolName: toolCall.function.name,
            status: 'started',
            startedAt: new Date().toISOString(),
          };
          actionHistory.push(action);

          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(toolCall.function.arguments || '{}');
          } catch {
            args = {};
          }

          if (toolCall.function.name === 'finish_task') {
            const summary = typeof args.summary === 'string' ? args.summary : 'Task completed.';
            action.status = 'completed';
            action.completedAt = new Date().toISOString();
            action.summary = summary;

            let finalUrl: string | undefined;
            try {
              if (!session.isClosed()) {
                finalUrl = session.getPage().url();
              }
            } catch {}

            return {
              summary,
              finalUrl,
              actionHistory,
              iterationsUsed: iterations,
            };
          }

          try {
            const toolResult = await executeRegisteredTool(session, toolCall.function.name, args);

            action.status = toolResult.success ? 'completed' : 'failed';
            action.completedAt = new Date().toISOString();
            action.summary = toolResult.success
              ? `Action '${toolCall.function.name}' succeeded.`
              : toolResult.error || 'Action failed.';

            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            });
          } catch (err: any) {
            action.status = 'failed';
            action.completedAt = new Date().toISOString();
            action.errorCode = err instanceof AppError ? err.code : ERROR_CODES.INTERNAL_ERROR;
            action.summary = err instanceof Error ? err.message : String(err);

            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ success: false, error: action.summary }),
            });
          }
        }
      } else {
        const textContent = completion.message.content || 'Task finished without additional tool actions.';
        return {
          summary: textContent,
          actionHistory,
          iterationsUsed: iterations,
        };
      }
    }

    throw new AppError({
      code: ERROR_CODES.TASK_TIMEOUT,
      message: `Agent reached maximum allowable iterations (${this.config.maxIterations}) without finishing.`,
      userMessage: 'The task reached the maximum step limit without concluding.',
    });
  }
}

