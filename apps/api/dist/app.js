"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const health_js_1 = __importDefault(require("./routes/health.js"));
const tasks_js_1 = require("./routes/tasks.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const env_js_1 = require("./config/env.js");
function createApp(taskService) {
    const config = (0, env_js_1.getConfig)();
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: config.WEB_ORIGIN }));
    app.use(express_1.default.json({ limit: '100kb' }));
    app.use('/api/health', health_js_1.default);
    app.use('/api/tasks', (0, tasks_js_1.createTaskRouter)(taskService));
    app.use(errorHandler_js_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map