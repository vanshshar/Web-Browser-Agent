"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const shared_1 = require("@browser-agent/shared");
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    if (err instanceof shared_1.AppError) {
        res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.userMessage,
                taskId: err.details?.taskId,
            },
        });
        return;
    }
    if (err instanceof zod_1.ZodError || (err && err.name === 'ZodError' && Array.isArray(err.issues))) {
        const issues = err.issues;
        res.status(400).json({
            error: {
                code: shared_1.ERROR_CODES.VALIDATION_ERROR,
                message: issues.map((i) => i.message).join('; '),
            },
        });
        return;
    }
    console.error('[API Internal Error]:', err);
    res.status(500).json({
        error: {
            code: shared_1.ERROR_CODES.INTERNAL_ERROR,
            message: 'An unexpected internal server error occurred.',
        },
    });
}
//# sourceMappingURL=errorHandler.js.map