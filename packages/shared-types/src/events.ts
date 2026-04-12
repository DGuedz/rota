export type EventSource = 'github' | 'backend' | 'protocol' | 'settlement' | 'market';

export type EventType = 
  | 'github.push'
  | 'github.pr_merged'
  | 'github.release'
  | 'github.skill_folder_created'
  | 'github.readme_changed'
  | 'feature.ready'
  | 'issue.publishable'
  | 'protocol.stellar_update'
  | 'protocol.x402_update'
  | 'settlement.success'
  | 'settlement.dispute'
  | 'settlement.slash'
  | 'sla.failed'
  | string; // Permitir expansão futura

export interface RotaEvent {
  eventId: string;
  source: EventSource;
  type: EventType;
  payload: Record<string, any>;
  timestamp: string;
}
