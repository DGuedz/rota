import { RotaEvent, EventType } from '@rota/shared-types';

export interface PublisherTrigger {
  eventType: EventType;
  actionRequired: 'package_skill' | 'update_schema' | 'propose_pricing';
}

export const publisherTriggers: PublisherTrigger[] = [
  { eventType: 'issue.publishable', actionRequired: 'package_skill' },
  { eventType: 'feature.ready', actionRequired: 'package_skill' },
  { eventType: 'github.skill_folder_created', actionRequired: 'package_skill' }
];

export function getRequiredAction(event: RotaEvent): PublisherTrigger['actionRequired'] | null {
  const trigger = publisherTriggers.find(t => t.eventType === event.type);
  return trigger ? trigger.actionRequired : null;
}
