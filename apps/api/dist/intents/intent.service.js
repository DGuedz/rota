"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentService = void 0;
class IntentService {
    repository;
    eventBus;
    constructor(repository, eventBus) {
        this.repository = repository;
        this.eventBus = eventBus;
    }
    async createIntent(payload) {
        // 1. Validar e persistir Intent
        const intent = await this.repository.createIntent(payload);
        // 2. Emitir evento de domínio "intent.created"
        await this.eventBus.publish('BACKEND', 'intent.created', {
            intentId: intent.id,
            buyerAgentId: intent.buyerAgentId,
            skillId: intent.skillId,
            title: intent.title,
            status: intent.status,
        });
        return intent;
    }
    async getIntent(id) {
        return this.repository.findById(id);
    }
    async listIntents() {
        return this.repository.findAll();
    }
}
exports.IntentService = IntentService;
//# sourceMappingURL=intent.service.js.map