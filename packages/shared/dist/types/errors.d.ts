import { ERROR_CODES } from '../constants/index.js';
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
/**
 * Application error with a structured code, safe user message,
 * and optional internal details.
 */
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly statusCode: number;
    readonly userMessage: string;
    readonly details?: unknown;
    constructor(opts: {
        code: ErrorCode;
        message: string;
        userMessage?: string;
        statusCode?: number;
        details?: unknown;
        cause?: unknown;
    });
}
/** Map common error codes to HTTP status codes */
export declare function httpStatusForCode(code: ErrorCode): number;
//# sourceMappingURL=errors.d.ts.map