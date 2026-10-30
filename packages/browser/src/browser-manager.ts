import { chromium, type Browser, type BrowserContext } from 'playwright';
import { BrowserSession } from './browser-session.js';
import { AppError, ERROR_CODES } from '@browser-agent/shared';

export interface BrowserManagerOptions {
  headless?: boolean;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private readonly headless: boolean;
  private readonly activeSessions: Map<string, BrowserSession> = new Map();

  constructor(opts?: BrowserManagerOptions) {
    this.headless = opts?.headless ?? true;
  }

  async initialize(): Promise<void> {
    if (this.browser && this.browser.isConnected()) {
      return;
    }

    try {
      this.browser = await chromium.launch({
        headless: this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
    } catch (err) {
      throw new AppError({
        code: ERROR_CODES.BROWSER_LAUNCH_FAILED,
        statusCode: 500,
        message: `Failed to launch Chromium browser: ${err instanceof Error ? err.message : String(err)}`,
        userMessage: 'The browser could not be started. Check Playwright browser installation.',
        cause: err,
      });
    }
  }

  async createSession(taskId: string, consequentialActionsConfirmed = false): Promise<BrowserSession> {
    await this.initialize();

    if (!this.browser) {
      throw new AppError({
        code: ERROR_CODES.BROWSER_LAUNCH_FAILED,
        message: 'Browser is not initialized.',
        userMessage: 'Browser engine is unavailable.',
      });
    }

    let context: BrowserContext;
    try {
      context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
    } catch (err) {
      throw new AppError({
        code: ERROR_CODES.BROWSER_LAUNCH_FAILED,
        message: `Failed to create browser context: ${err instanceof Error ? err.message : String(err)}`,
        userMessage: 'Failed to create isolated browser session.',
      });
    }

    const session = new BrowserSession(taskId, context, consequentialActionsConfirmed);
    await session.initialize();
    this.activeSessions.set(taskId, session);
    return session;
  }

  async closeSession(taskId: string): Promise<void> {
    const session = this.activeSessions.get(taskId);
    if (session) {
      this.activeSessions.delete(taskId);
      await session.close().catch(() => {});
    }
  }

  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  async shutdown(): Promise<void> {
    for (const [taskId, session] of this.activeSessions.entries()) {
      await session.close().catch(() => {});
      this.activeSessions.delete(taskId);
    }
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }
}

