"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateParams = validateParams;
function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            next(result.error);
            return;
        }
        req.body = result.data;
        next();
    };
}
function validateParams(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            next(result.error);
            return;
        }
        req.params = result.data;
        next();
    };
}
//# sourceMappingURL=validateRequest.js.map