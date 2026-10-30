import { ERROR_CODES } from '../constants/index.js';

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Application error with a structured code, safe user message,
 * and optional internal details.
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly details?: unknown;

  constructor(opts: {
    code: ErrorCode;
    message: string;
    userMessage?: string;
    statusCode?: number;
    details?: unknown;
    cause?: unknown;
  }) {
    super(opts.message, { cause: opts.cause });
    this.name = 'AppError';
    this.code = opts.code;
    this.statusCode = opts.statusCode ?? 500;
    this.userMessage = opts.userMessage ?? opts.message;
    this.details = opts.details;
  }
}

/** Map common error codes to HTTP status codes */
export function httpStatusForCode(code: ErrorCode): number {
  switch (code) {
    case ERROR_CODES.VALIDATION_ERROR:
    case ERROR_CODES.INVALID_URL:
    case ERROR_CODES.INVALID_TOOL_ARGUMENTS:
      return 400;
    case ERROR_CODES.URL_BLOCKED:
    case ERROR_CODES.CONSEQUENTIAL_ACTION_REQUIRES_CONFIRMATION:
      return 403;
    case ERROR_CODES.TASK_NOT_FOUND:
      return 404;
    case ERROR_CODES.TASK_TIMEOUT:
    case ERROR_CODES.MODEL_TIMEOUT:
      return 408;
    case ERROR_CODES.CONCURRENCY_LIMIT_REACHED:
      return 429;
    case ERROR_CODES.MODEL_CONFIGURATION_ERROR:
    case ERROR_CODES.UNSUPPORTED_TOOL:
      return 422;
    case ERROR_CODES.MODEL_REQUEST_FAILED:
    case ERROR_CODES.BROWSER_LAUNCH_FAILED:
    case ERROR_CODES.NAVIGATION_FAILED:
    case ERROR_CODES.BROWSER_ACTION_FAILED:
    case ERROR_CODES.INTERNAL_ERROR:
    default:
      return 500;
  }
}

