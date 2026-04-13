import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
type ReputationRoutesDeps = {
    prisma: PrismaClient;
};
export declare function registerReputationRoutes(fastify: FastifyInstance, deps: ReputationRoutesDeps): Promise<void>;
export {};
//# sourceMappingURL=reputation.routes.d.ts.map