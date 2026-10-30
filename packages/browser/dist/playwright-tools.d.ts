import type { ToolResult } from '@browser-agent/shared';
import { BrowserSession } from './browser-session.js';
export declare const TOOL_DEFINITIONS: ({
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                url: {
                    type: string;
                    description: string;
                };
                maxLength?: undefined;
                selector?: undefined;
                value?: undefined;
                key?: undefined;
                direction?: undefined;
                amount?: undefined;
                summary?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                maxLength: {
                    type: string;
                    description: string;
                };
                url?: undefined;
                selector?: undefined;
                value?: undefined;
                key?: undefined;
                direction?: undefined;
                amount?: undefined;
                summary?: undefined;
            };
            required?: undefined;
        };
    };
} | {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                selector: {
                    type: string;
                    description: string;
                };
                url?: undefined;
                maxLength?: undefined;
                value?: undefined;
                key?: undefined;
                direction?: undefined;
                amount?: undefined;
                summary?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                selector: {
                    type: string;
                    description: string;
                };
                value: {
                    type: string;
                    description: string;
                };
                url?: undefined;
                maxLength?: undefined;
                key?: undefined;
                direction?: undefined;
                amount?: undefined;
                summary?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                key: {
                    type: string;
                    description: string;
                };
                url?: undefined;
                maxLength?: undefined;
                selector?: undefined;
                value?: undefined;
                direction?: undefined;
                amount?: undefined;
                summary?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                direction: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                amount: {
                    type: string;
                    description: string;
                };
                url?: undefined;
                maxLength?: undefined;
                selector?: undefined;
                value?: undefined;
                key?: undefined;
                summary?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                url?: undefined;
                maxLength?: undefined;
                selector?: undefined;
                value?: undefined;
                key?: undefined;
                direction?: undefined;
                amount?: undefined;
                summary?: undefined;
            };
            required?: undefined;
        };
    };
} | {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                selector: {
                    type: string;
                    description: string;
                };
                url?: undefined;
                maxLength?: undefined;
                value?: undefined;
                key?: undefined;
                direction?: undefined;
                amount?: undefined;
                summary?: undefined;
            };
            required?: undefined;
        };
    };
} | {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                summary: {
                    type: string;
                    description: string;
                };
                url?: undefined;
                maxLength?: undefined;
                selector?: undefined;
                value?: undefined;
                key?: undefined;
                direction?: undefined;
                amount?: undefined;
            };
            required: string[];
        };
    };
})[];
export declare function executeTool(session: BrowserSession, toolName: string, rawArgs?: Record<string, unknown>): Promise<ToolResult>;
//# sourceMappingURL=playwright-tools.d.ts.map