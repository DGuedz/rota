"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentRepository = void 0;
const client_1 = require("@prisma/client");
class IntentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createIntent(data) {
        return this.prisma.intent.create({
            data: {
                ...data,
                status: client_1.IntentStatus.OPEN
            }
        });
    }
    async findById(id) {
        return this.prisma.intent.findUnique({
            where: { id },
            include: {
                buyerAgent: true,
                skill: true,
                rfq: true
            }
        });
    }
    async findAll() {
        return this.prisma.intent.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateStatus(id, status) {
        return this.prisma.intent.update({
            where: { id },
            data: { status }
        });
    }
}
exports.IntentRepository = IntentRepository;
//# sourceMappingURL=intent.repository.js.map