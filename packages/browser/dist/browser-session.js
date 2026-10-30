"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserSession = void 0;
class BrowserSession {
    taskId;
    consequentialActionsConfirmed;
    context;
    page = null;
    closed = false;
    constructor(taskId, context, consequentialActionsConfirmed = false) {
        this.taskId = taskId;
        this.context = context;
        this.consequentialActionsConfirmed = consequentialActionsConfirmed;
    }
    async initialize() {
        if (this.closed) {
            throw new Error(`Cannot initialize closed session for task ${this.taskId}`);
        }
        this.page = await this.context.newPage();
    }
    getPage() {
        if (this.closed || !this.page) {
            throw new Error(`BrowserSession is closed or not initialized for task ${this.taskId}`);
        }
        return this.page;
    }
    isClosed() {
        return this.closed;
    }
    async close() {
        if (this.closed)
            return;
        this.closed = true;
        try {
            if (this.page && !this.page.isClosed()) {
                await this.page.close().catch(() => { });
            }
        }
        finally {
            await this.context.close().catch(() => { });
            this.page = null;
        }
    }
}
exports.BrowserSession = BrowserSession;
//# sourceMappingURL=browser-session.js.map