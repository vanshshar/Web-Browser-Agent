import type { Page } from 'playwright';
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
export declare function extractPageState(page: Page, maxLength?: number): Promise<PageState>;
//# sourceMappingURL=page-state.d.ts.map