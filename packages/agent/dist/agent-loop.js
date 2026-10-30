"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLoop = void 0;
const uuid_1 = require("uuid");
const system_js_1 = require("./prompts/system.js");
const registry_js_1 = require("./tools/registry.js");
const shared_1 = require("@browser-agent/shared");
class AgentLoop {
    groqClient;
    config;
    constructor(groqClient, config) {
        this.groqClient = groqClient;
        this.config = config;
    }
    async execute(taskDescription, session, abortSignal) {
        const actionHistory = [];
        const messages = [
            { role: 'system', content: system_js_1.SYSTEM_PROMPT },
            { role: 'user', content: taskDescription },
        ];
        const deadline = Date.now() + this.config.taskTimeoutMs;
        let iterations = 0;
        while (iterations < this.config.maxIterations) {
            if (abortSignal?.aborted) {
                throw new shared_1.AppError({
                    code: shared_1.ERROR_CODES.TASK_CANCELLED,
                    message: 'Task was cancelled by the user.',
                    userMessage: 'Task was cancelled.',
                });
            }
            if (Date.now() > deadline) {
                throw new shared_1.AppError({
                    code: shared_1.ERROR_CODES.TASK_TIMEOUT,
                    message: `Task execution exceeded deadline of ${this.config.taskTimeoutMs}ms.`,
                    userMessage: 'The task timed out before completing.',
                });
            }
            iterations++;
            const completion = await this.groqClient.createCompletion(messages, registry_js_1.TOOL_DEFINITIONS);
            messages.push(completion.message);
            if (completion.message.tool_calls && completion.message.tool_calls.length > 0) {
                for (const toolCall of completion.message.tool_calls) {
                    const actionId = (0, uuid_1.v4)();
                    const action = {
                        id: actionId,
                        toolName: toolCall.function.name,
                        status: 'started',
                        startedAt: new Date().toISOString(),
                    };
                    actionHistory.push(action);
                    let args = {};
                    try {
                        args = JSON.parse(toolCall.function.arguments || '{}');
                    }
                    catch {
                        args = {};
                    }
                    if (toolCall.function.name === 'finish_task') {
                        const summary = typeof args.summary === 'string' ? args.summary : 'Task completed.';
                        action.status = 'completed';
                        action.completedAt = new Date().toISOString();
                        action.summary = summary;
                        let finalUrl;
                        try {
                            if (!session.isClosed()) {
                                finalUrl = session.getPage().url();
                            }
                        }
                        catch { }
                        return {
                            summary,
                            finalUrl,
                            actionHistory,
                            iterationsUsed: iterations,
                        };
                    }
                    try {
                        const toolResult = await (0, registry_js_1.executeRegisteredTool)(session, toolCall.function.name, args);
                        action.status = toolResult.success ? 'completed' : 'failed';
                        action.completedAt = new Date().toISOString();
                        action.summary = toolResult.success
                            ? `Action '${toolCall.function.name}' succeeded.`
                            : toolResult.error || 'Action failed.';
                        messages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify(toolResult),
                        });
                    }
                    catch (err) {
                        action.status = 'failed';
                        action.completedAt = new Date().toISOString();
                        action.errorCode = err instanceof shared_1.AppError ? err.code : shared_1.ERROR_CODES.INTERNAL_ERROR;
                        action.summary = err instanceof Error ? err.message : String(err);
                        messages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({ success: false, error: action.summary }),
                        });
                    }
                }
            }
            else {
                const textContent = completion.message.content || 'Task finished without additional tool actions.';
                return {
                    summary: textContent,
                    actionHistory,
                    iterationsUsed: iterations,
                };
            }
        }
        throw new shared_1.AppError({
            code: shared_1.ERROR_CODES.TASK_TIMEOUT,
            message: `Agent reached maximum allowable iterations (${this.config.maxIterations}) without finishing.`,
            userMessage: 'The task reached the maximum step limit without concluding.',
        });
    }
}
exports.AgentLoop = AgentLoop;
//# sourceMappingURL=agent-loop.js.map