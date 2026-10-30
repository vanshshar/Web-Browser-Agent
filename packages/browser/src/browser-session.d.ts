import type { Page, BrowserContext } from 'playwright';
export declare class BrowserSession {
    readonly taskId: string;
    private context;
    private page;
    private closed;
    constructor(taskId: string, context: BrowserContext);
    initialize(): Promise<void>;
    getPage(): Page;
    isClosed(): boolean;
    close(): Promise<void>;
}
//# sourceMappingURL=browser-session.d.ts.map