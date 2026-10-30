"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.httpStatusForCode = httpStatusForCode;
const index_js_1 = require("../constants/index.js");
/**
 * Application error with a structured code, safe user message,
 * and optional internal details.
 */
class AppError extends Error {
    code;
    statusCode;
    userMessage;
    details;
    constructor(opts) {
        super(opts.message, { cause: opts.cause });
        this.name = 'AppError';
        this.code = opts.code;
        this.statusCode = opts.statusCode ?? 500;
        this.userMessage = opts.userMessage ?? opts.message;
        this.details = opts.details;
    }
}
exports.AppError = AppError;
/** Map common error codes to HTTP status codes */
function httpStatusForCode(code) {
    switch (code) {
        case index_js_1.ERROR_CODES.VALIDATION_ERROR:
        case index_js_1.ERROR_CODES.INVALID_URL:
        case index_js_1.ERROR_CODES.INVALID_TOOL_ARGUMENTS:
            return 400;
        case index_js_1.ERROR_CODES.URL_BLOCKED:
        case index_js_1.ERROR_CODES.CONSEQUENTIAL_ACTION_REQUIRES_CONFIRMATION:
            return 403;
        case index_js_1.ERROR_CODES.TASK_NOT_FOUND:
            return 404;
        case index_js_1.ERROR_CODES.TASK_TIMEOUT:
        case index_js_1.ERROR_CODES.MODEL_TIMEOUT:
            return 408;
        case index_js_1.ERROR_CODES.CONCURRENCY_LIMIT_REACHED:
            return 429;
        case index_js_1.ERROR_CODES.MODEL_CONFIGURATION_ERROR:
        case index_js_1.ERROR_CODES.UNSUPPORTED_TOOL:
            return 422;
        case index_js_1.ERROR_CODES.MODEL_REQUEST_FAILED:
        case index_js_1.ERROR_CODES.BROWSER_LAUNCH_FAILED:
        case index_js_1.ERROR_CODES.NAVIGATION_FAILED:
        case index_js_1.ERROR_CODES.BROWSER_ACTION_FAILED:
        case index_js_1.ERROR_CODES.INTERNAL_ERROR:
        default:
            return 500;
    }
}
//# sourceMappingURL=errors.js.map