import type { Page, BrowserContext } from 'playwright';
export declare class BrowserSession {
    readonly taskId: string;
    readonly consequentialActionsConfirmed: boolean;
    private context;
    private page;
    private closed;
    constructor(taskId: string, context: BrowserContext, consequentialActionsConfirmed?: boolean);
    initialize(): Promise<void>;
    getPage(): Page;
    isClosed(): boolean;
    close(): Promise<void>;
}
//# sourceMappingURL=browser-session.d.ts.map