"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITIONS = void 0;
exports.executeTool = executeTool;
const zod_1 = require("zod");
const shared_1 = require("@browser-agent/shared");
const url_validator_js_1 = require("./url-validator.js");
const page_state_js_1 = require("./page-state.js");
exports.TOOL_DEFINITIONS = [
    {
        type: 'function',
        function: {
            name: 'navigate',
            description: 'Navigate to an allowed HTTP or HTTPS URL. Returns the destination URL, page title, and navigation status.',
            parameters: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'The absolute HTTP or HTTPS URL to visit.' },
                },
                required: ['url'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_page_state',
            description: 'Inspect the current page to observe visible text content, current URL, page title, and interactive elements (buttons, inputs, links).',
            parameters: {
                type: 'object',
                properties: {
                    maxLength: { type: 'number', description: 'Optional maximum character length for extracted text content.' },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'click',
            description: 'Click an element identified by CSS selector or accessible name/text.',
            parameters: {
                type: 'object',
                properties: {
                    selector: { type: 'string', description: 'CSS selector or text selector (e.g. button:has-text("Search"), #submit-btn, a[href="/login"]).' },
                },
                required: ['selector'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'fill',
            description: 'Fill an input or textarea form element with text.',
            parameters: {
                type: 'object',
                properties: {
                    selector: { type: 'string', description: 'CSS selector of the form input field.' },
                    value: { type: 'string', description: 'The text value to enter.' },
                },
                required: ['selector', 'value'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'press_key',
            description: 'Press a keyboard key (e.g. Enter, Tab, ArrowDown, Escape).',
            parameters: {
                type: 'object',
                properties: {
                    key: { type: 'string', description: 'Key name like "Enter", "Tab", "Escape", "ArrowDown".' },
                },
                required: ['key'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'select_option',
            description: 'Select an option in a <select> dropdown element by value or label.',
            parameters: {
                type: 'object',
                properties: {
                    selector: { type: 'string', description: 'CSS selector of the <select> element.' },
                    value: { type: 'string', description: 'The option value or visible text to select.' },
                },
                required: ['selector', 'value'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'scroll',
            description: 'Scroll the active page up or down.',
            parameters: {
                type: 'object',
                properties: {
                    direction: { type: 'string', enum: ['up', 'down'], description: 'Scroll direction.' },
                    amount: { type: 'number', description: 'Scroll distance in pixels (default: 500).' },
                },
                required: ['direction'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'screenshot',
            description: 'Capture a screenshot of the visible viewport.',
            parameters: {
                type: 'object',
                properties: {},
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'extract_text',
            description: 'Extract text content from a specific element or the entire page.',
            parameters: {
                type: 'object',
                properties: {
                    selector: { type: 'string', description: 'Optional CSS selector to extract text from a specific container.' },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'finish_task',
            description: 'Conclude the browser task and present the final summary/answer to the user.',
            parameters: {
                type: 'object',
                properties: {
                    summary: { type: 'string', description: 'Comprehensive summary of what was accomplished and the extracted information/result.' },
                },
                required: ['summary'],
            },
        },
    },
];
async function executeTool(session, toolName, rawArgs = {}) {
    const page = session.getPage();
    page.setDefaultTimeout(shared_1.DEFAULTS.BROWSER_ACTION_TIMEOUT_MS);
    try {
        switch (toolName) {
            case 'navigate': {
                const schema = zod_1.z.object({ url: zod_1.z.string().min(1) });
                const { url } = schema.parse(rawArgs);
                const { parsed } = await (0, url_validator_js_1.validateUrlAsync)(url);
                await page.goto(parsed.toString(), {
                    waitUntil: 'domcontentloaded',
                    timeout: shared_1.DEFAULTS.BROWSER_ACTION_TIMEOUT_MS,
                });
                const currentUrl = page.url();
                const title = await page.title().catch(() => '');
                return {
                    success: true,
                    url: currentUrl,
                    title,
                    data: {
                        message: `Successfully navigated to ${currentUrl}`,
                        url: currentUrl,
                        title,
                    },
                };
            }
            case 'get_page_state': {
                const schema = zod_1.z.object({ maxLength: zod_1.z.number().optional() });
                const { maxLength } = schema.parse(rawArgs);
                const state = await (0, page_state_js_1.extractPageState)(page, maxLength);
                return {
                    success: true,
                    url: state.url,
                    title: state.title,
                    data: state,
                };
            }
            case 'click': {
                const schema = zod_1.z.object({ selector: zod_1.z.string().min(1) });
                const { selector } = schema.parse(rawArgs);
                const locator = page.locator(selector).first();
                const elementDescription = await locator.evaluate((element) => {
                    const el = element;
                    return {
                        tagName: el.tagName.toLowerCase(),
                        type: el.type?.toLowerCase() || '',
                        text: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('value') || '').trim().toLowerCase(),
                    };
                }).catch(() => null);
                const looksConsequential = elementDescription && (elementDescription.type === 'submit' ||
                    elementDescription.type === 'button' && /(purchase|buy|checkout|pay|submit|send|delete|remove|confirm order|place order)/.test(elementDescription.text));
                if (looksConsequential && !session.consequentialActionsConfirmed) {
                    throw new shared_1.AppError({
                        code: shared_1.ERROR_CODES.CONSEQUENTIAL_ACTION_REQUIRES_CONFIRMATION,
                        statusCode: 403,
                        message: 'Consequential form submission or account action requires explicit confirmation.',
                        userMessage: 'This action can submit or change external data. Confirm consequential actions and retry.',
                    });
                }
                await page.click(selector, { timeout: shared_1.DEFAULTS.BROWSER_ACTION_TIMEOUT_MS });
                await page.waitForLoadState('domcontentloaded').catch(() => { });
                const currentUrl = page.url();
                const title = await page.title().catch(() => '');
                return {
                    success: true,
                    url: currentUrl,
                    title,
                    data: {
                        message: `Clicked element '${selector}'`,
                        url: currentUrl,
                        title,
                    },
                };
            }
            case 'fill': {
                const schema = zod_1.z.object({
                    selector: zod_1.z.string().min(1),
                    value: zod_1.z.string(),
                });
                const { selector, value } = schema.parse(rawArgs);
                await page.fill(selector, value, { timeout: shared_1.DEFAULTS.BROWSER_ACTION_TIMEOUT_MS });
                return {
                    success: true,
                    data: {
                        message: `Filled element '${selector}' successfully`,
                    },
                };
            }
            case 'press_key': {
                const schema = zod_1.z.object({ key: zod_1.z.string().min(1) });
                const { key } = schema.parse(rawArgs);
                await page.keyboard.press(key);
                await page.waitForLoadState('domcontentloaded').catch(() => { });
                return {
                    success: true,
                    data: {
                        message: `Pressed key '${key}'`,
                    },
                };
            }
            case 'select_option': {
                const schema = zod_1.z.object({
                    selector: zod_1.z.string().min(1),
                    value: zod_1.z.string(),
                });
                const { selector, value } = schema.parse(rawArgs);
                const selected = await page.selectOption(selector, value, {
                    timeout: shared_1.DEFAULTS.BROWSER_ACTION_TIMEOUT_MS,
                });
                return {
                    success: true,
                    data: {
                        message: `Selected option on '${selector}'`,
                        selected,
                    },
                };
            }
            case 'scroll': {
                const schema = zod_1.z.object({
                    direction: zod_1.z.enum(['up', 'down']),
                    amount: zod_1.z.number().positive().optional(),
                });
                const { direction, amount = 500 } = schema.parse(rawArgs);
                const deltaY = direction === 'down' ? amount : -amount;
                await page.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), deltaY);
                return {
                    success: true,
                    data: {
                        message: `Scrolled ${direction} by ${amount}px`,
                    },
                };
            }
            case 'screenshot': {
                const buffer = await page.screenshot({ fullPage: false });
                const base64 = buffer.toString('base64');
                return {
                    success: true,
                    data: {
                        message: 'Screenshot captured successfully',
                        format: 'image/png;base64',
                        preview: base64.slice(0, 100) + '... [truncated base64]',
                    },
                };
            }
            case 'extract_text': {
                const schema = zod_1.z.object({ selector: zod_1.z.string().optional() });
                const { selector } = schema.parse(rawArgs);
                let extracted = '';
                if (selector) {
                    extracted = await page.$eval(selector, (el) => el.textContent || '').catch(() => '');
                }
                else {
                    extracted = await page.evaluate(() => document.body?.innerText || '').catch(() => '');
                }
                const trimmed = extracted.replace(/\s+/g, ' ').trim().slice(0, shared_1.DEFAULTS.MAX_PAGE_CONTENT_LENGTH);
                return {
                    success: true,
                    data: {
                        text: trimmed,
                        length: trimmed.length,
                    },
                };
            }
            case 'finish_task': {
                const schema = zod_1.z.object({ summary: zod_1.z.string().min(1) });
                const { summary } = schema.parse(rawArgs);
                return {
                    success: true,
                    data: { summary },
                };
            }
            default:
                throw new shared_1.AppError({
                    code: shared_1.ERROR_CODES.UNSUPPORTED_TOOL,
                    statusCode: 400,
                    message: `Unknown or unsupported tool '${toolName}'.`,
                    userMessage: `Action '${toolName}' is not supported.`,
                });
        }
    }
    catch (err) {
        if (err instanceof shared_1.AppError) {
            return { success: false, error: err.userMessage || err.message };
        }
        if (err instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: `Invalid tool arguments: ${err.issues.map((i) => i.message).join(', ')}`,
            };
        }
        return {
            success: false,
            error: `Tool execution failed: ${err instanceof Error ? err.message : String(err)}`,
        };
    }
}
//# sourceMappingURL=playwright-tools.js.map