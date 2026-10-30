"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqClient = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const shared_1 = require("@browser-agent/shared");
class GroqClient {
    client;
    model;
    requestTimeoutMs;
    maxRetries;
    constructor(config) {
        if (!config.apiKey || config.apiKey.trim().length === 0) {
            throw new shared_1.AppError({
                code: shared_1.ERROR_CODES.MODEL_CONFIGURATION_ERROR,
                statusCode: 422,
                message: 'GROQ_API_KEY is not configured or is empty.',
                userMessage: 'Groq API key is missing. Please configure GROQ_API_KEY in your environment.',
            });
        }
        this.model = config.model;
        this.requestTimeoutMs = config.requestTimeoutMs ?? 60000;
        this.maxRetries = config.maxRetries ?? 2;
        this.client = new groq_sdk_1.default({
            apiKey: config.apiKey,
            maxRetries: this.maxRetries,
            timeout: this.requestTimeoutMs,
        });
    }
    getModel() {
        return this.model;
    }
    async createCompletion(messages, tools) {
        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: messages,
                tools: tools,
                tool_choice: tools && tools.length > 0 ? 'auto' : undefined,
            });
            const choice = response.choices[0];
            if (!choice || !choice.message) {
                throw new shared_1.AppError({
                    code: shared_1.ERROR_CODES.MODEL_REQUEST_FAILED,
                    statusCode: 502,
                    message: 'Groq returned an empty response choice.',
                    userMessage: 'The AI model returned an empty response.',
                });
            }
            const msg = choice.message;
            return {
                message: {
                    role: msg.role,
                    content: msg.content ?? null,
                    tool_calls: msg.tool_calls,
                },
                finishReason: choice.finish_reason ?? null,
                usage: response.usage
                    ? {
                        promptTokens: response.usage.prompt_tokens,
                        completionTokens: response.usage.completion_tokens,
                        totalTokens: response.usage.total_tokens,
                    }
                    : undefined,
            };
        }
        catch (err) {
            if (err instanceof shared_1.AppError)
                throw err;
            const message = err?.message || String(err);
            const status = err?.status;
            if (status === 401 || message.includes('API key') || message.includes('auth')) {
                throw new shared_1.AppError({
                    code: shared_1.ERROR_CODES.MODEL_CONFIGURATION_ERROR,
                    statusCode: 401,
                    message: `Groq authentication failed: ${message}`,
                    userMessage: 'Invalid Groq API key.',
                    cause: err,
                });
            }
            if (status === 429 || message.includes('rate limit')) {
                throw new shared_1.AppError({
                    code: shared_1.ERROR_CODES.MODEL_REQUEST_FAILED,
                    statusCode: 429,
                    message: `Groq rate limit exceeded: ${message}`,
                    userMessage: 'AI provider rate limit reached. Please try again shortly.',
                    cause: err,
                });
            }
            if (message.includes('timeout') || err?.code === 'ETIMEDOUT') {
                throw new shared_1.AppError({
                    code: shared_1.ERROR_CODES.MODEL_TIMEOUT,
                    statusCode: 408,
                    message: `Groq request timed out after ${this.requestTimeoutMs}ms.`,
                    userMessage: 'Model request timed out.',
                    cause: err,
                });
            }
            throw new shared_1.AppError({
                code: shared_1.ERROR_CODES.MODEL_REQUEST_FAILED,
                statusCode: 502,
                message: `Groq completion failed: ${message}`,
                userMessage: 'Failed to communicate with AI provider.',
                cause: err,
            });
        }
    }
}
exports.GroqClient = GroqClient;
//# sourceMappingURL=groq-client.js.map