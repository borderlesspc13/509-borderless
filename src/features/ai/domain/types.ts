import type { Permission } from "@/lib/rbac";

export type AiAgentId =
  | "global"
  | "patients"
  | "clinical-evolution"
  | "agenda"
  | "assessments"
  | "document-templates"
  | "reports"
  | "team";

export type AiMessageRole = "user" | "assistant" | "system";

export type AiChatMessage = {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
};

export type AiScreenContext = {
  route?: string;
  moduleLabel?: string;
  entityId?: string;
  entityLabel?: string;
  formSnapshot?: Record<string, string>;
  metadata?: Record<string, string>;
};

export type AiToolCallTrace = {
  name: string;
  status: "simulated" | "executed" | "blocked";
  summary: string;
};

export type AiAgentDefinition = {
  id: AiAgentId;
  name: string;
  description: string;
  moduleLabel: string;
  requiredPermissions: Permission[];
  model: string;
  quickPrompts: string[];
  tools: string[];
};

export type AiChatRequest = {
  agentId: AiAgentId;
  message: string;
  screenContext?: AiScreenContext;
  history?: AiChatMessage[];
};

export type AiChatResponse = {
  message: AiChatMessage;
  toolCalls: AiToolCallTrace[];
  mode: "mock" | "live";
  agentId: AiAgentId;
};

export type AiChatCompletionInput = {
  systemPrompt: string;
  messages: Array<{ role: AiMessageRole; content: string }>;
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
  model: string;
};

export type AiChatCompletionResult = {
  content: string;
  toolCalls: AiToolCallTrace[];
};
