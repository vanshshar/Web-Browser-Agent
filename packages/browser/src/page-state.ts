import type { Page } from 'playwright';
import { DEFAULTS } from '@browser-agent/shared';

export interface InteractiveElement {
  tag: string;
  type?: string;
  name?: string;
  role?: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
  selector: string;
  value?: string;
}

export interface PageState {
  url: string;
  title: string;
  content: string;
  interactiveElements: InteractiveElement[];
}

export async function extractPageState(
  page: Page,
  maxLength: number = DEFAULTS.MAX_PAGE_CONTENT_LENGTH,
): Promise<PageState> {
  const url = page.url();
  const title = await page.title().catch(() => '');

  const { content, interactiveElements } = await page.evaluate((maxTextLen) => {
    // 1. Extract visible text while stripping script, style, noscript, etc.
    const clone = document.body ? document.body.cloneNode(true) as HTMLElement : null;
    let fullText = '';
    if (clone) {
      const nonContent = clone.querySelectorAll('script, style, noscript, svg, iframe');
      nonContent.forEach((node) => node.remove());
      fullText = (clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim();
    }

    const truncatedContent = fullText.length > maxTextLen
      ? fullText.slice(0, maxTextLen) + '... [truncated]'
      : fullText;

    // 2. Discover interactive elements
    const elements: {
      tag: string;
      type?: string;
      name?: string;
      role?: string;
      text?: string;
      placeholder?: string;
      ariaLabel?: string;
      selector: string;
      value?: string;
    }[] = [];

    const nodes = document.querySelectorAll<HTMLElement>(
      'button, a[href], input, textarea, select, [role="button"], [role="link"], [role="textbox"]'
    );

    let count = 0;
    for (const el of Array.from(nodes)) {
      if (count >= 50) break; // Limit elements count to keep context bounded
      // Basic visibility check
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        continue;
      }

      const tag = el.tagName.toLowerCase();
      const type = (el as HTMLInputElement).type || undefined;
      const name = (el as HTMLInputElement).name || undefined;
      const role = el.getAttribute('role') || undefined;
      const text = (el.innerText || el.textContent || '').trim().slice(0, 80) || undefined;
      const placeholder = (el as HTMLInputElement).placeholder || undefined;
      const ariaLabel = el.getAttribute('aria-label') || undefined;
      const value = (el as HTMLInputElement).value ? String((el as HTMLInputElement).value).slice(0, 80) : undefined;

      // Build a stable CSS selector
      let selector = '';
      if (el.id) {
        selector = `#${CSS.escape(el.id)}`;
      } else if (name && tag !== 'a') {
        selector = `${tag}[name="${CSS.escape(name)}"]`;
      } else if (placeholder) {
        selector = `${tag}[placeholder="${CSS.escape(placeholder)}"]`;
      } else if (ariaLabel) {
        selector = `[aria-label="${CSS.escape(ariaLabel)}"]`;
      } else if (tag === 'a' && el.getAttribute('href')) {
        const href = el.getAttribute('href')!;
        selector = `a[href="${CSS.escape(href)}"]`;
      } else if (text && text.length < 30) {
        selector = `${tag}:has-text("${text}")`;
      } else {
        selector = tag;
      }

      elements.push({
        tag,
        type,
        name,
        role,
        text,
        placeholder,
        ariaLabel,
        selector,
        value,
      });
      count++;
    }

    return { content: truncatedContent, interactiveElements: elements };
  }, maxLength).catch(() => ({
    content: '[Failed to extract DOM state from page]',
    interactiveElements: [],
  }));

  return {
    url,
    title,
    content,
    interactiveElements,
  };
}

