"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserManager = void 0;
const playwright_1 = require("playwright");
const browser_session_js_1 = require("./browser-session.js");
const shared_1 = require("@browser-agent/shared");
class BrowserManager {
    browser = null;
    headless;
    activeSessions = new Map();
    constructor(opts) {
        this.headless = opts?.headless ?? true;
    }
    async initialize() {
        if (this.browser && this.browser.isConnected()) {
            return;
        }
        try {
            this.browser = await playwright_1.chromium.launch({
                headless: this.headless,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                ],
            });
        }
        catch (err) {
            throw new shared_1.AppError({
                code: shared_1.ERROR_CODES.BROWSER_LAUNCH_FAILED,
                statusCode: 500,
                message: `Failed to launch Chromium browser: ${err instanceof Error ? err.message : String(err)}`,
                userMessage: 'The browser could not be started. Check Playwright browser installation.',
                cause: err,
            });
        }
    }
    async createSession(taskId, consequentialActionsConfirmed = false) {
        await this.initialize();
        if (!this.browser) {
            throw new shared_1.AppError({
                code: shared_1.ERROR_CODES.BROWSER_LAUNCH_FAILED,
                message: 'Browser is not initialized.',
                userMessage: 'Browser engine is unavailable.',
            });
        }
        let context;
        try {
            context = await this.browser.newContext({
                viewport: { width: 1280, height: 800 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            });
        }
        catch (err) {
            throw new shared_1.AppError({
                code: shared_1.ERROR_CODES.BROWSER_LAUNCH_FAILED,
                message: `Failed to create browser context: ${err instanceof Error ? err.message : String(err)}`,
                userMessage: 'Failed to create isolated browser session.',
            });
        }
        const session = new browser_session_js_1.BrowserSession(taskId, context, consequentialActionsConfirmed);
        await session.initialize();
        this.activeSessions.set(taskId, session);
        return session;
    }
    async closeSession(taskId) {
        const session = this.activeSessions.get(taskId);
        if (session) {
            this.activeSessions.delete(taskId);
            await session.close().catch(() => { });
        }
    }
    getActiveSessionCount() {
        return this.activeSessions.size;
    }
    async shutdown() {
        for (const [taskId, session] of this.activeSessions.entries()) {
            await session.close().catch(() => { });
            this.activeSessions.delete(taskId);
        }
        if (this.browser) {
            await this.browser.close().catch(() => { });
            this.browser = null;
        }
    }
}
exports.BrowserManager = BrowserManager;
//# sourceMappingURL=browser-manager.js.map