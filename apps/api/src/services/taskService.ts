import { TaskManager, GroqClient, AgentLoop } from '@browser-agent/agent';
import { BrowserManager, type BrowserSession } from '@browser-agent/browser';
import type { Task } from '@browser-agent/shared';
import { AppError, ERROR_CODES } from '@browser-agent/shared';
import { getConfig } from '../config/env.js';

export class TaskService {
  private taskManager: TaskManager;
  private browserManager: BrowserManager;
  private groqClient: GroqClient;
  private agentLoop: AgentLoop;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    const config = getConfig();
    this.taskManager = new TaskManager(config.MAX_CONCURRENT_TASKS);
    this.browserManager = new BrowserManager({ headless: config.BROWSER_HEADLESS });
    this.groqClient = new GroqClient({
      apiKey: config.GROQ_API_KEY,
      model: config.GROQ_MODEL,
      requestTimeoutMs: config.MODEL_REQUEST_TIMEOUT_MS,
      maxRetries: config.MAX_RETRIES,
    });
    this.agentLoop = new AgentLoop(this.groqClient, {
      maxIterations: config.MAX_AGENT_ITERATIONS,
      taskTimeoutMs: config.TASK_TIMEOUT_MS,
    });
  }

  async submitTask(description: string, confirmConsequentialActions = false): Promise<{ taskId: string; status: string }> {
    if (!this.taskManager.canAcceptTask()) {
      throw new AppError({
        code: ERROR_CODES.CONCURRENCY_LIMIT_REACHED,
        statusCode: 429,
        message: 'Maximum concurrent tasks limit reached. Please wait for active tasks to complete.',
        userMessage: 'The server is currently processing the maximum number of simultaneous tasks. Please try again shortly.',
      });
    }

    const task = this.taskManager.createTask(description);

    this.runTaskLifecycle(task.id, description, confirmConsequentialActions).catch((err) => {
      console.error(`[TaskService] Background execution error on task ${task.id}:`, err);
    });

    return { taskId: task.id, status: task.status };
  }

  private async runTaskLifecycle(
    taskId: string,
    description: string,
    confirmConsequentialActions: boolean,
  ): Promise<void> {
    const abortController = new AbortController();
    this.abortControllers.set(taskId, abortController);

    let session: BrowserSession | null = null;
    try {
      this.taskManager.updateStatus(taskId, 'running');

      await this.browserManager.initialize();
      session = await this.browserManager.createSession(taskId, confirmConsequentialActions);

      const loopResult = await this.agentLoop.execute(
        description,
        session,
        abortController.signal,
      );

      this.taskManager.completeTask(taskId, {
        summary: loopResult.summary,
        finalUrl: loopResult.finalUrl,
        metadata: { iterationsUsed: loopResult.iterationsUsed },
      });

      const updatedTask = this.taskManager.getTask(taskId);
      if (updatedTask) {
        updatedTask.actionHistory = loopResult.actionHistory;
      }
    } catch (err: any) {
      const appErr = err instanceof AppError ? err : new AppError({
        code: ERROR_CODES.INTERNAL_ERROR,
        statusCode: 500,
        message: err instanceof Error ? err.message : String(err),
      });

      this.taskManager.failTask(taskId, {
        code: appErr.code,
        message: appErr.userMessage,
        taskId,
      });
    } finally {
      this.abortControllers.delete(taskId);
      if (session) {
        try {
          await this.browserManager.closeSession(taskId);
        } catch (e) {
          console.error(`[TaskService] Session cleanup failure for task ${taskId}:`, e);
        }
      }
    }
  }

  getTask(taskId: string): Task {
    return this.taskManager.getTaskOrThrow(taskId);
  }

  async cancelTask(taskId: string): Promise<{ taskId: string; status: string }> {
    const task = this.taskManager.getTaskOrThrow(taskId);
    if (task.status !== 'running' && task.status !== 'queued') {
      return { taskId, status: task.status };
    }

    const controller = this.abortControllers.get(taskId);
    if (controller) {
      controller.abort();
    }

    this.taskManager.cancelTask(taskId);
    try {
      await this.browserManager.closeSession(taskId);
    } catch {}

    return { taskId, status: 'cancelled' };
  }

  async shutdown(): Promise<void> {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    await this.browserManager.shutdown();
  }
}

