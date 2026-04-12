"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rfqRoutes = rfqRoutes;
async function rfqRoutes(fastify, options) {
    const { rfqService, bidService } = options;
    // RFQ Routes
    fastify.post('/:intentId/open', async (request, reply) => {
        try {
            const { buyerAgentId, closesAt, broadcastPayload } = request.body;
            const rfq = await rfqService.openRFQ(request.params.intentId, buyerAgentId, { closesAt, broadcastPayload });
            return reply.status(201).send(rfq);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(400).send({ error: error.message });
        }
    });
    fastify.get('/:id', async (request, reply) => {
        try {
            const rfq = await rfqService.getRFQ(request.params.id);
            if (!rfq)
                return reply.status(404).send({ error: 'RFQ not found' });
            return reply.send(rfq);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    fastify.post('/:id/award', async (request, reply) => {
        try {
            const { bidId } = request.body;
            const rfq = await rfqService.awardRFQ(request.params.id, bidId);
            return reply.send(rfq);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(400).send({ error: error.message });
        }
    });
    fastify.post('/:id/expire', async (request, reply) => {
        try {
            const rfq = await rfqService.expireRFQ(request.params.id);
            return reply.send(rfq);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(400).send({ error: error.message });
        }
    });
    // Bids Routes
    fastify.post('/:id/bids', async (request, reply) => {
        try {
            const { sellerAgentId, skillId, price, bondAmount, slaSeconds, quotePayload } = request.body;
            const bid = await bidService.submitBid(request.params.id, sellerAgentId, {
                skillId, price, bondAmount, slaSeconds, quotePayload
            });
            return reply.status(201).send(bid);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(400).send({ error: error.message });
        }
    });
    fastify.get('/:id/bids', async (request, reply) => {
        try {
            const bids = await bidService.getBidsForRFQ(request.params.id);
            return reply.send(bids);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
//# sourceMappingURL=rfq.routes.js.map