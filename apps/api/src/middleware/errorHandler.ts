import type { Request, Response, NextFunction } from 'express';
import { AppError, ERROR_CODES } from '@browser-agent/shared';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.userMessage,
        taskId: (err.details as any)?.taskId,
      },
    });
    return;
  }

  if (err instanceof ZodError || (err && err.name === 'ZodError' && Array.isArray((err as any).issues))) {
    const issues = (err as any).issues as Array<{ message: string }>;
    res.status(400).json({
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: issues.map((i) => i.message).join('; '),
      },
    });
    return;
  }

  console.error('[API Internal Error]:', err);
  res.status(500).json({
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'An unexpected internal server error occurred.',
    },
  });
}

