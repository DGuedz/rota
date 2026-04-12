import { RFQRepository } from './rfq.repository';
import { RotaEventBus } from '../events/event-bus';
import { EventSource } from '@prisma/client';

export class RFQService {
  constructor(
    private repository: RFQRepository,
    private eventBus: RotaEventBus
  ) {}

  async openRFQ(intentId: string, buyerAgentId: string, payload?: any) {
    const rfq = await this.repository.createRFQ(intentId, buyerAgentId, payload?.closesAt, payload?.broadcastPayload);

    await this.eventBus.publish(
      'BACKEND' as EventSource,
      'rfq.created',
      {
        rfqId: rfq.id,
        intentId: rfq.intentId,
        buyerAgentId: rfq.buyerAgentId,
      }
    );

    return rfq;
  }

  async getRFQ(id: string) {
    return this.repository.findById(id);
  }

  async awardRFQ(rfqId: string, bidId: string) {
    const rfq = await this.repository.awardRFQ(rfqId, bidId);

    await this.eventBus.publish(
      'BACKEND' as EventSource,
      'rfq.awarded',
      {
        rfqId: rfq.id,
        intentId: rfq.intentId,
        buyerAgentId: rfq.buyerAgentId,
        awardedBidId: bidId,
      }
    );

    return rfq;
  }

  async expireRFQ(rfqId: string) {
    const rfq = await this.repository.expireRFQ(rfqId);

    await this.eventBus.publish(
      'BACKEND' as EventSource,
      'rfq.expired',
      {
        rfqId: rfq.id,
        intentId: rfq.intentId,
      }
    );

    return rfq;
  }
}
