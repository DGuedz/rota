import { RotaEvent, EventType } from '@rota/shared-types';

export interface DistributionTrigger {
  eventType: EventType;
  actionRequired: 'generate_changelog' | 'generate_release_notes' | 'normalize_docs' | 'validate_publish_checklist';
}

export const distributionTriggers: DistributionTrigger[] = [
  { eventType: 'github.push', actionRequired: 'normalize_docs' },
  { eventType: 'github.pr_merged', actionRequired: 'generate_changelog' },
  { eventType: 'github.release', actionRequired: 'generate_release_notes' },
  { eventType: 'github.skill_folder_created', actionRequired: 'validate_publish_checklist' },
  { eventType: 'github.readme_changed', actionRequired: 'normalize_docs' }
];

export function getRequiredAction(event: RotaEvent): DistributionTrigger['actionRequired'] | null {
  const trigger = distributionTriggers.find(t => t.eventType === event.type);
  return trigger ? trigger.actionRequired : null;
}
