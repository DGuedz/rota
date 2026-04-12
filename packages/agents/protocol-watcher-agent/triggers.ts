import { RotaEvent, EventType } from '@rota/shared-types';

export interface WatcherTrigger {
  eventType: EventType;
  actionRequired: 'analyze_stellar_update' | 'analyze_x402_update' | 'analyze_mcp_update';
}

export const watcherTriggers: WatcherTrigger[] = [
  { eventType: 'protocol.stellar_update', actionRequired: 'analyze_stellar_update' },
  { eventType: 'protocol.x402_update', actionRequired: 'analyze_x402_update' },
  { eventType: 'protocol.mcp_update', actionRequired: 'analyze_mcp_update' }
];

export function getRequiredAction(event: RotaEvent): WatcherTrigger['actionRequired'] | null {
  const trigger = watcherTriggers.find(t => t.eventType === event.type);
  return trigger ? trigger.actionRequired : null;
}
