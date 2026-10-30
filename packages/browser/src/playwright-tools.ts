import { z } from 'zod';
import type { ToolResult } from '@browser-agent/shared';
import { AppError, ERROR_CODES, DEFAULTS } from '@browser-agent/shared';
import { BrowserSession } from './browser-session.js';
import { validateUrlAsync } from './url-validator.js';
import { extractPageState } from './page-state.js';

export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
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
    type: 'function' as const,
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
    type: 'function' as const,
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
    type: 'function' as const,
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
    type: 'function' as const,
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
    type: 'function' as const,
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
    type: 'function' as const,
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
    type: 'function' as const,
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
    type: 'function' as const,
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
    type: 'function' as const,
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

export async function executeTool(
  session: BrowserSession,
  toolName: string,
  rawArgs: Record<string, unknown> = {},
): Promise<ToolResult> {
  const page = session.getPage();
  page.setDefaultTimeout(DEFAULTS.BROWSER_ACTION_TIMEOUT_MS);

  try {
    switch (toolName) {
      case 'navigate': {
        const schema = z.object({ url: z.string().min(1) });
        const { url } = schema.parse(rawArgs);
        const { parsed } = await validateUrlAsync(url);

        await page.goto(parsed.toString(), {
          waitUntil: 'domcontentloaded',
          timeout: DEFAULTS.BROWSER_ACTION_TIMEOUT_MS,
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
        const schema = z.object({ maxLength: z.number().optional() });
        const { maxLength } = schema.parse(rawArgs);
        const state = await extractPageState(page, maxLength);

        return {
          success: true,
          url: state.url,
          title: state.title,
          data: state,
        };
      }

      case 'click': {
        const schema = z.object({ selector: z.string().min(1) });
        const { selector } = schema.parse(rawArgs);

        const locator = page.locator(selector).first();
        const elementDescription = await locator.evaluate((element) => {
          const el = element as HTMLElement;
          return {
            tagName: el.tagName.toLowerCase(),
            type: (el as HTMLInputElement).type?.toLowerCase() || '',
            text: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('value') || '').trim().toLowerCase(),
          };
        }).catch(() => null);

        const looksConsequential = elementDescription && (
          elementDescription.type === 'submit' ||
          elementDescription.type === 'button' && /(purchase|buy|checkout|pay|submit|send|delete|remove|confirm order|place order)/.test(elementDescription.text)
        );
        if (looksConsequential && !session.consequentialActionsConfirmed) {
          throw new AppError({
            code: ERROR_CODES.CONSEQUENTIAL_ACTION_REQUIRES_CONFIRMATION,
            statusCode: 403,
            message: 'Consequential form submission or account action requires explicit confirmation.',
            userMessage: 'This action can submit or change external data. Confirm consequential actions and retry.',
          });
        }

        await page.click(selector, { timeout: DEFAULTS.BROWSER_ACTION_TIMEOUT_MS });
        await page.waitForLoadState('domcontentloaded').catch(() => {});

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
        const schema = z.object({
          selector: z.string().min(1),
          value: z.string(),
        });
        const { selector, value } = schema.parse(rawArgs);

        await page.fill(selector, value, { timeout: DEFAULTS.BROWSER_ACTION_TIMEOUT_MS });

        return {
          success: true,
          data: {
            message: `Filled element '${selector}' successfully`,
          },
        };
      }

      case 'press_key': {
        const schema = z.object({ key: z.string().min(1) });
        const { key } = schema.parse(rawArgs);

        await page.keyboard.press(key);
        await page.waitForLoadState('domcontentloaded').catch(() => {});

        return {
          success: true,
          data: {
            message: `Pressed key '${key}'`,
          },
        };
      }

      case 'select_option': {
        const schema = z.object({
          selector: z.string().min(1),
          value: z.string(),
        });
        const { selector, value } = schema.parse(rawArgs);

        const selected = await page.selectOption(selector, value, {
          timeout: DEFAULTS.BROWSER_ACTION_TIMEOUT_MS,
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
        const schema = z.object({
          direction: z.enum(['up', 'down']),
          amount: z.number().positive().optional(),
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
        const schema = z.object({ selector: z.string().optional() });
        const { selector } = schema.parse(rawArgs);

        let extracted = '';
        if (selector) {
          extracted = await page.$eval(selector, (el) => el.textContent || '').catch(() => '');
        } else {
          extracted = await page.evaluate(() => document.body?.innerText || '').catch(() => '');
        }

        const trimmed = extracted.replace(/\s+/g, ' ').trim().slice(0, DEFAULTS.MAX_PAGE_CONTENT_LENGTH);

        return {
          success: true,
          data: {
            text: trimmed,
            length: trimmed.length,
          },
        };
      }

      case 'finish_task': {
        const schema = z.object({ summary: z.string().min(1) });
        const { summary } = schema.parse(rawArgs);

        return {
          success: true,
          data: { summary },
        };
      }

      default:
        throw new AppError({
          code: ERROR_CODES.UNSUPPORTED_TOOL,
          statusCode: 400,
          message: `Unknown or unsupported tool '${toolName}'.`,
          userMessage: `Action '${toolName}' is not supported.`,
        });
    }
  } catch (err) {
    if (err instanceof AppError) {
      return { success: false, error: err.userMessage || err.message };
    }
    if (err instanceof z.ZodError) {
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

