"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intentRoutes = intentRoutes;
async function intentRoutes(fastify, options) {
    const { intentService } = options;
    fastify.post('/', async (request, reply) => {
        try {
            const intent = await intentService.createIntent(request.body);
            return reply.status(201).send(intent);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(400).send({ error: error.message });
        }
    });
    fastify.get('/:id', async (request, reply) => {
        try {
            const intent = await intentService.getIntent(request.params.id);
            if (!intent)
                return reply.status(404).send({ error: 'Intent not found' });
            return reply.send(intent);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
    fastify.get('/', async (request, reply) => {
        try {
            const intents = await intentService.listIntents();
            return reply.send(intents);
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
//# sourceMappingURL=intent.routes.js.map