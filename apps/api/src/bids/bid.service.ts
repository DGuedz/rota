import { BidRepository } from './bid.repository';
import { RotaEventBus } from '../events/event-bus';
import { EventSource } from '@prisma/client';

export class BidService {
  constructor(
    private repository: BidRepository,
    private eventBus: RotaEventBus
  ) {}

  async submitBid(rfqId: string, sellerAgentId: string, payload: any) {
    const bid = await this.repository.createBid({
      rfqId,
      sellerAgentId,
      skillId: payload.skillId,
      price: payload.price,
      bondAmount: payload.bondAmount,
      slaSeconds: payload.slaSeconds,
      quotePayload: payload.quotePayload
    });

    await this.eventBus.publish(
      'BACKEND' as EventSource,
      'rfq.bid_submitted',
      {
        bidId: bid.id,
        rfqId: bid.rfqId,
        sellerAgentId: bid.sellerAgentId,
        price: bid.price,
      }
    );

    return bid;
  }

  async getBidsForRFQ(rfqId: string) {
    return this.repository.findByRfq(rfqId);
  }
}
