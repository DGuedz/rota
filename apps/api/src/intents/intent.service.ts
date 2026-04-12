import { IntentRepository } from './intent.repository';
import { RotaEventBus } from '../events/event-bus';
import { EventSource, IntentStatus } from '@prisma/client';

export class IntentService {
  constructor(
    private repository: IntentRepository,
    private eventBus: RotaEventBus
  ) {}

  async createIntent(payload: any) {
    // 1. Validar e persistir Intent
    const intent = await this.repository.createIntent(payload);

    // 2. Emitir evento de domínio "intent.created"
    await this.eventBus.publish(
      'BACKEND' as EventSource,
      'intent.created',
      {
        intentId: intent.id,
        buyerAgentId: intent.buyerAgentId,
        skillId: intent.skillId,
        title: intent.title,
        status: intent.status,
      }
    );

    return intent;
  }

  async getIntent(id: string) {
    return this.repository.findById(id);
  }

  async listIntents() {
    return this.repository.findAll();
  }
}
