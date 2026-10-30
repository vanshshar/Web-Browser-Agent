import { TOOL_DEFINITIONS, BrowserSession } from '@browser-agent/browser';
import type { ToolResult } from '@browser-agent/shared';
export { TOOL_DEFINITIONS };
export declare function isValidTool(name: string): boolean;
export declare function executeRegisteredTool(session: BrowserSession, toolName: string, args: Record<string, unknown>): Promise<ToolResult>;
//# sourceMappingURL=registry.d.ts.map