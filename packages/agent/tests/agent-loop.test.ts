import { describe, it, expect, vi } from 'vitest';
import { AgentLoop } from '../src/agent-loop.js';
import type { GroqClient, GroqCompletionResult } from '../src/groq-client.js';
import type { BrowserSession } from '@browser-agent/browser';
import { AppError, ERROR_CODES } from '@browser-agent/shared';

describe('AgentLoop', () => {
  it('terminates immediately when model provides a direct text response', async () => {
    const mockGroq: Partial<GroqClient> = {
      createCompletion: vi.fn().mockResolvedValue({
        message: {
          role: 'assistant',
          content: 'Here is the summary of the requested information.',
        },
        finishReason: 'stop',
      } as GroqCompletionResult),
    };

    const mockSession: Partial<BrowserSession> = {
      isClosed: vi.fn().mockReturnValue(false),
      getPage: vi.fn(),
    };

    const loop = new AgentLoop(mockGroq as GroqClient, {
      maxIterations: 5,
      taskTimeoutMs: 10000,
    });

    const result = await loop.execute('Summarize something', mockSession as BrowserSession);

    expect(result.summary).toBe('Here is the summary of the requested information.');
    expect(result.iterationsUsed).toBe(1);
    expect(result.actionHistory.length).toBe(0);
  });

  it('completes the loop when finish_task is called by the model', async () => {
    let callCount = 0;
    const mockGroq: Partial<GroqClient> = {
      createCompletion: vi.fn().mockImplementation(async () => {
        callCount++;
        return {
          message: {
            role: 'assistant',
            content: null,
            tool_calls: [
              {
                id: 'call_1',
                type: 'function',
                function: {
                  name: 'finish_task',
                  arguments: JSON.stringify({ summary: 'Finished automation workflow.' }),
                },
              },
            ],
          },
          finishReason: 'tool_calls',
        } as GroqCompletionResult;
      }),
    };

    const mockSession: Partial<BrowserSession> = {
      isClosed: vi.fn().mockReturnValue(false),
      getPage: vi.fn().mockReturnValue({
        url: () => 'https://example.com/done',
      }),
    };

    const loop = new AgentLoop(mockGroq as GroqClient, {
      maxIterations: 5,
      taskTimeoutMs: 10000,
    });

    const result = await loop.execute('Do task', mockSession as BrowserSession);

    expect(result.summary).toBe('Finished automation workflow.');
    expect(result.finalUrl).toBe('https://example.com/done');
    expect(result.actionHistory.length).toBe(1);
    expect(result.actionHistory[0].status).toBe('completed');
  });

  it('throws TASK_CANCELLED when abort signal is triggered', async () => {
    const mockGroq: Partial<GroqClient> = {
      createCompletion: vi.fn(),
    };
    const mockSession: Partial<BrowserSession> = {
      isClosed: vi.fn().mockReturnValue(false),
    };

    const controller = new AbortController();
    controller.abort();

    const loop = new AgentLoop(mockGroq as GroqClient, {
      maxIterations: 5,
      taskTimeoutMs: 10000,
    });

    await expect(
      loop.execute('Do task', mockSession as BrowserSession, controller.signal),
    ).rejects.toThrowError(AppError);
  });

  it('throws TASK_TIMEOUT when maximum iterations are exceeded', async () => {
    const mockGroq: Partial<GroqClient> = {
      createCompletion: vi.fn().mockResolvedValue({
        message: {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call_loop',
              type: 'function',
              function: {
                name: 'scroll',
                arguments: JSON.stringify({ direction: 'down' }),
              },
            },
          ],
        },
        finishReason: 'tool_calls',
      } as GroqCompletionResult),
    };

    const mockSession: Partial<BrowserSession> = {
      getPage: vi.fn().mockReturnValue({
        setDefaultTimeout: vi.fn(),
        evaluate: vi.fn().mockResolvedValue(undefined),
      }),
    };

    const loop = new AgentLoop(mockGroq as GroqClient, {
      maxIterations: 2,
      taskTimeoutMs: 10000,
    });

    await expect(
      loop.execute('Scroll forever', mockSession as BrowserSession),
    ).rejects.toThrowError(AppError);
  });
});

