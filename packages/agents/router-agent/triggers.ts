export type EventSource = 'github' | 'backend' | 'protocol' | 'settlement' | 'market';

export interface RotaEvent {
  eventId: string;
  source: EventSource;
  type: string;
  payload: Record<string, any>;
  timestamp: string;
}

export interface TriggerDefinition {
  eventName: string;
  source: EventSource;
  targetAgent: string;
  debounceMs: number;
  retryStrategy: 'drop' | 'retry_with_backoff';
}

// Mapa de Gatilhos: Relaciona um evento recebido ao agente correspondente
export const supportedTriggers: TriggerDefinition[] = [
  // --- GitHub Distribution Agent ---
  { eventName: 'github.push', source: 'github', targetAgent: 'github-distribution-agent', debounceMs: 0, retryStrategy: 'drop' },
  { eventName: 'github.pr_merged', source: 'github', targetAgent: 'github-distribution-agent', debounceMs: 0, retryStrategy: 'drop' },
  { eventName: 'github.release', source: 'github', targetAgent: 'github-distribution-agent', debounceMs: 0, retryStrategy: 'drop' },
  { eventName: 'github.skill_folder_created', source: 'github', targetAgent: 'github-distribution-agent', debounceMs: 0, retryStrategy: 'drop' },
  
  // --- Skill Publisher Agent ---
  { eventName: 'feature.ready', source: 'github', targetAgent: 'skill-publisher-agent', debounceMs: 0, retryStrategy: 'drop' },
  { eventName: 'issue.publishable', source: 'github', targetAgent: 'skill-publisher-agent', debounceMs: 0, retryStrategy: 'drop' },
  
  // --- Protocol Watcher Agent ---
  { eventName: 'protocol.stellar_update', source: 'protocol', targetAgent: 'protocol-watcher-agent', debounceMs: 3600000, retryStrategy: 'drop' },
  { eventName: 'protocol.x402_update', source: 'protocol', targetAgent: 'protocol-watcher-agent', debounceMs: 3600000, retryStrategy: 'drop' },
  
  // --- Trust & Reputation Agent ---
  { eventName: 'settlement.success', source: 'settlement', targetAgent: 'trust-reputation-agent', debounceMs: 0, retryStrategy: 'retry_with_backoff' },
  { eventName: 'settlement.dispute', source: 'settlement', targetAgent: 'trust-reputation-agent', debounceMs: 0, retryStrategy: 'retry_with_backoff' },
  { eventName: 'settlement.slash', source: 'settlement', targetAgent: 'trust-reputation-agent', debounceMs: 0, retryStrategy: 'retry_with_backoff' },
  { eventName: 'sla.failed', source: 'backend', targetAgent: 'trust-reputation-agent', debounceMs: 0, retryStrategy: 'retry_with_backoff' }
];

export function resolveTrigger(event: RotaEvent): TriggerDefinition | undefined {
  return supportedTriggers.find(t => t.eventName === event.type && t.source === event.source);
}
