import type { Page, BrowserContext } from 'playwright';

export class BrowserSession {
  readonly taskId: string;
  readonly consequentialActionsConfirmed: boolean;
  private context: BrowserContext;
  private page: Page | null = null;
  private closed = false;

  constructor(taskId: string, context: BrowserContext, consequentialActionsConfirmed = false) {
    this.taskId = taskId;
    this.context = context;
    this.consequentialActionsConfirmed = consequentialActionsConfirmed;
  }

  async initialize(): Promise<void> {
    if (this.closed) {
      throw new Error(`Cannot initialize closed session for task ${this.taskId}`);
    }
    this.page = await this.context.newPage();
  }

  getPage(): Page {
    if (this.closed || !this.page) {
      throw new Error(`BrowserSession is closed or not initialized for task ${this.taskId}`);
    }
    return this.page;
  }

  isClosed(): boolean {
    return this.closed;
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close().catch(() => {});
      }
    } finally {
      await this.context.close().catch(() => {});
      this.page = null;
    }
  }
}

