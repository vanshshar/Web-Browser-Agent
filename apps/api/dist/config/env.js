"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.getConfig = getConfig;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const shared_1 = require("@browser-agent/shared");
// Look for .env in current working dir or workspace root
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../../.env') });
let config = null;
function loadConfig() {
    const result = shared_1.AppConfigSchema.safeParse(process.env);
    if (!result.success) {
        const errorDetails = result.error.issues
            .map((i) => `${i.path.join('.')}: ${i.message}`)
            .join(', ');
        throw new Error(`Configuration validation failed: ${errorDetails}`);
    }
    config = result.data;
    return config;
}
function getConfig() {
    if (!config) {
        return loadConfig();
    }
    return config;
}
//# sourceMappingURL=env.js.map