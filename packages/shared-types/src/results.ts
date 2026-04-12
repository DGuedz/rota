import { EventSource } from './events';

export interface RouteResult {
  eventId: string;
  source: EventSource | string;
  targetAgent: string | null;
  reason: string;
  dispatched: boolean;
}

export interface AgentAction {
  actionId: string;
  agentId: string;
  type: string;
  targetPath?: string;
  payload: Record<string, any>;
  status: 'pending' | 'success' | 'failed' | 'requires_approval';
}

export interface ExecutionResult {
  success: boolean;
  actionsPerformed: AgentAction[];
  generatedArtifacts: string[];
  error?: string;
  reason: string;
}
