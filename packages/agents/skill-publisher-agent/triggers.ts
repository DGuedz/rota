import { RotaEvent, EventType } from '@rota/shared-types';

export interface PublisherTrigger {
  eventType: EventType;
  actionRequired: 'validate_skill_candidate' | 'generate_skill_package';
}

export const publisherTriggers: PublisherTrigger[] = [
  // Exemplo de trigger manual ou gerado por outro agente que sugere uma skill
  { eventType: 'skill.publish_requested', actionRequired: 'generate_skill_package' },
  // Exemplo de quando uma branch "feature/skill-*" sobe no repositório
  { eventType: 'repo.skill_candidate', actionRequired: 'validate_skill_candidate' }
];

export function getRequiredAction(event: RotaEvent): PublisherTrigger['actionRequired'] | null {
  const trigger = publisherTriggers.find(t => t.eventType === event.type);
  return trigger ? trigger.actionRequired : null;
}
