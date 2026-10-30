/** Definition of a tool available to the agent */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/** Result returned from a tool execution */
export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  url?: string;
  title?: string;
}

/** A tool call requested by the model */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

