import { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Interface customizada que as rotas pagas podem declarar.
 */
export interface X402RouteConfig {
    requiresPayment: boolean;
    price?: string;
}
export declare function x402Middleware(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
//# sourceMappingURL=x402.middleware.d.ts.map