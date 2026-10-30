"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITIONS = void 0;
exports.isValidTool = isValidTool;
exports.executeRegisteredTool = executeRegisteredTool;
const browser_1 = require("@browser-agent/browser");
Object.defineProperty(exports, "TOOL_DEFINITIONS", { enumerable: true, get: function () { return browser_1.TOOL_DEFINITIONS; } });
function isValidTool(name) {
    return browser_1.TOOL_DEFINITIONS.some((t) => t.function.name === name);
}
async function executeRegisteredTool(session, toolName, args) {
    return (0, browser_1.executeTool)(session, toolName, args);
}
//# sourceMappingURL=registry.js.map