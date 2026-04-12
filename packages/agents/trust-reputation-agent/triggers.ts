import { RotaEvent, EventType } from '@rota/shared-types';

export interface ReputationTrigger {
  eventType: EventType;
  actionRequired: 'process_success' | 'process_dispute' | 'process_slash' | 'process_sla_failure';
}

export const reputationTriggers: ReputationTrigger[] = [
  { eventType: 'settlement.success', actionRequired: 'process_success' },
  { eventType: 'settlement.dispute', actionRequired: 'process_dispute' },
  { eventType: 'settlement.slash', actionRequired: 'process_slash' },
  { eventType: 'sla.failed', actionRequired: 'process_sla_failure' }
];

export function getRequiredAction(event: RotaEvent): ReputationTrigger['actionRequired'] | null {
  const trigger = reputationTriggers.find(t => t.eventType === event.type);
  return trigger ? trigger.actionRequired : null;
}
