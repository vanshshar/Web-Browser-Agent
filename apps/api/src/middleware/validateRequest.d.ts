import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
export declare function validateBody(schema: ZodSchema): (req: Request, _res: Response, next: NextFunction) => void;
export declare function validateParams(schema: ZodSchema): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validateRequest.d.ts.map