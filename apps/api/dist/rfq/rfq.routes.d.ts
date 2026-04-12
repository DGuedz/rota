import { FastifyInstance } from 'fastify';
import { RFQService } from './rfq.service';
import { BidService } from '../bids/bid.service';
export declare function rfqRoutes(fastify: FastifyInstance, options: {
    rfqService: RFQService;
    bidService: BidService;
}): Promise<void>;
//# sourceMappingURL=rfq.routes.d.ts.map