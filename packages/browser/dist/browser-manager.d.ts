import { BrowserSession } from './browser-session.js';
export interface BrowserManagerOptions {
    headless?: boolean;
}
export declare class BrowserManager {
    private browser;
    private readonly headless;
    private readonly activeSessions;
    constructor(opts?: BrowserManagerOptions);
    initialize(): Promise<void>;
    createSession(taskId: string, consequentialActionsConfirmed?: boolean): Promise<BrowserSession>;
    closeSession(taskId: string): Promise<void>;
    getActiveSessionCount(): number;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=browser-manager.d.ts.map