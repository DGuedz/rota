import { FastifyInstance } from 'fastify';
import { EscrowService } from './escrow.service';

export async function escrowRoutes(fastify: FastifyInstance, options: { escrowService: EscrowService }) {
  const { escrowService } = options;

  fastify.post('/init', async (request: any, reply) => {
    try {
      const result = await escrowService.initEscrow(request.body);
      return reply.status(201).send(result);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.post('/confirm-lock', async (request: any, reply) => {
    try {
      const { escrowTxId, txHash } = request.body;
      const result = await escrowService.confirmLock(escrowTxId, txHash);
      return reply.send(result);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.post('/:id/settle/build', async (request: any, reply) => {
    try {
      const { sourceAddress } = request.body;
      const result = await escrowService.buildSettle(request.params.id, sourceAddress);
      return reply.send(result);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.post('/:id/settle/confirm', async (request: any, reply) => {
    try {
      const { txHash } = request.body;
      const result = await escrowService.confirmSettle(request.params.id, txHash);
      return reply.send(result);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.post('/:id/slash/build', async (request: any, reply) => {
    try {
      const { sourceAddress, slashAmount } = request.body;
      const result = await escrowService.buildSlash(request.params.id, sourceAddress, slashAmount);
      return reply.send(result);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.post('/:id/slash/confirm', async (request: any, reply) => {
    try {
      const { txHash } = request.body;
      const result = await escrowService.confirmSlash(request.params.id, txHash);
      return reply.send(result);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });

  fastify.get('/:id', async (request: any, reply) => {
    try {
      const escrow = await escrowService.getEscrow(request.params.id);
      if (!escrow) return reply.status(404).send({ error: 'Escrow transaction not found' });
      return reply.send(escrow);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
