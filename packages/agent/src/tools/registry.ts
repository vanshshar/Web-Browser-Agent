import { executeTool, TOOL_DEFINITIONS, BrowserSession } from '@browser-agent/browser';
import type { ToolResult } from '@browser-agent/shared';

export { TOOL_DEFINITIONS };

export function isValidTool(name: string): boolean {
  return TOOL_DEFINITIONS.some((t) => t.function.name === name);
}

export async function executeRegisteredTool(
  session: BrowserSession,
  toolName: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  return executeTool(session, toolName, args);
}

