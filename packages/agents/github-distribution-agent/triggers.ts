import { RotaEvent, EventType } from '@rota/shared-types';

export interface DistributionTrigger {
  eventType: EventType;
  actionRequired: 'update_docs_surface' | 'generate_changelog_entry' | 'generate_release_draft' | 'validate_skill_package';
}

export const distributionTriggers: DistributionTrigger[] = [
  { eventType: 'repo.push_main', actionRequired: 'update_docs_surface' },
  { eventType: 'repo.pr_merged', actionRequired: 'generate_changelog_entry' },
  { eventType: 'repo.release_draft', actionRequired: 'generate_release_draft' },
  { eventType: 'repo.skill_updated', actionRequired: 'validate_skill_package' },
  { eventType: 'repo.docs_changed', actionRequired: 'update_docs_surface' }
];

export function getRequiredAction(event: RotaEvent): DistributionTrigger['actionRequired'] | null {
  const trigger = distributionTriggers.find(t => t.eventType === event.type);
  return trigger ? trigger.actionRequired : null;
}
