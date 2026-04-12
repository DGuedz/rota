export interface ExecutionLog {
  logId: string;
  agentId: string;
  eventId: string;
  action: string;
  level: 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  metadata: Record<string, any>;
  timestamp: string;
}
