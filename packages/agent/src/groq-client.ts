import Groq from 'groq-sdk';
import { AppError, ERROR_CODES } from '@browser-agent/shared';

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
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

export interface GroqCompletionResult {
  message: GroqMessage;
  finishReason: string | null;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export class GroqClient {
  private client: Groq;
  private readonly model: string;
  private readonly requestTimeoutMs: number;
  private readonly maxRetries: number;

  constructor(config: GroqConfig) {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new AppError({
        code: ERROR_CODES.MODEL_CONFIGURATION_ERROR,
        statusCode: 422,
        message: 'GROQ_API_KEY is not configured or is empty.',
        userMessage: 'Groq API key is missing. Please configure GROQ_API_KEY in your environment.',
      });
    }

    this.model = config.model;
    this.requestTimeoutMs = config.requestTimeoutMs ?? 60000;
    this.maxRetries = config.maxRetries ?? 2;

    this.client = new Groq({
      apiKey: config.apiKey,
      maxRetries: this.maxRetries,
      timeout: this.requestTimeoutMs,
    });
  }

  getModel(): string {
    return this.model;
  }

  async createCompletion(
    messages: GroqMessage[],
    tools?: Array<{ type: 'function'; function: { name: string; description: string; parameters: object } }>,
  ): Promise<GroqCompletionResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any,
        tools: tools as any,
        tool_choice: tools && tools.length > 0 ? 'auto' : undefined,
      });

      const choice = response.choices[0];
      if (!choice || !choice.message) {
        throw new AppError({
          code: ERROR_CODES.MODEL_REQUEST_FAILED,
          statusCode: 502,
          message: 'Groq returned an empty response choice.',
          userMessage: 'The AI model returned an empty response.',
        });
      }

      const msg = choice.message;
      return {
        message: {
          role: msg.role as any,
          content: msg.content ?? null,
          tool_calls: msg.tool_calls as any,
        },
        finishReason: choice.finish_reason ?? null,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      const message = err?.message || String(err);
      const status = err?.status;

      if (status === 401 || message.includes('API key') || message.includes('auth')) {
        throw new AppError({
          code: ERROR_CODES.MODEL_CONFIGURATION_ERROR,
          statusCode: 401,
          message: `Groq authentication failed: ${message}`,
          userMessage: 'Invalid Groq API key.',
          cause: err,
        });
      }

      if (status === 429 || message.includes('rate limit')) {
        throw new AppError({
          code: ERROR_CODES.MODEL_REQUEST_FAILED,
          statusCode: 429,
          message: `Groq rate limit exceeded: ${message}`,
          userMessage: 'AI provider rate limit reached. Please try again shortly.',
          cause: err,
        });
      }

      if (message.includes('timeout') || err?.code === 'ETIMEDOUT') {
        throw new AppError({
          code: ERROR_CODES.MODEL_TIMEOUT,
          statusCode: 408,
          message: `Groq request timed out after ${this.requestTimeoutMs}ms.`,
          userMessage: 'Model request timed out.',
          cause: err,
        });
      }

      throw new AppError({
        code: ERROR_CODES.MODEL_REQUEST_FAILED,
        statusCode: 502,
        message: `Groq completion failed: ${message}`,
        userMessage: 'Failed to communicate with AI provider.',
        cause: err,
      });
    }
  }
}

