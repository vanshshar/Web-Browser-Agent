"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_js_1 = require("./config/env.js");
const app_js_1 = require("./app.js");
const taskService_js_1 = require("./services/taskService.js");
async function main() {
    const config = (0, env_js_1.loadConfig)();
    console.log('[Server] Starting Browser Automation Agent API...');
    console.log(`[Server] Environment: ${config.NODE_ENV}`);
    console.log(`[Server] Groq model: ${config.GROQ_MODEL}`);
    const taskService = new taskService_js_1.TaskService();
    const app = (0, app_js_1.createApp)(taskService);
    const server = app.listen(config.API_PORT, () => {
        console.log(`[Server] API listening on port ${config.API_PORT}`);
        console.log(`[Server] Allowed origin: ${config.WEB_ORIGIN}`);
    });
    const shutdown = async () => {
        console.log('[Server] Shutting down gracefully...');
        await taskService.shutdown();
        server.close(() => {
            console.log('[Server] Server closed.');
            process.exit(0);
        });
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}
main().catch((err) => {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map