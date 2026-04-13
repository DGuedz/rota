"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingService = void 0;
const client_1 = require("@prisma/client");
class AccountingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Registra o início ou progresso de uma execução econômica (Paga ou Gratuita).
     */
    async logExecution(input, status) {
        return this.prisma.paymentExecutionLog.create({
            data: {
                skillId: input.skillId,
                paymentMode: input.paymentMode,
                paymentAssetCode: input.paymentAssetCode || 'USDC',
                paymentAssetIssuer: input.paymentAssetIssuer,
                amountCharged: input.amountCharged,
                x402TokenRef: input.x402TokenRef,
                x402VerificationRef: input.x402VerificationRef,
                buyerAgentId: input.buyerAgentId,
                paymentExecutionStatus: status,
                requestPayload: input.requestPayload,
            }
        });
    }
    /**
     * Atualiza um log existente com o status final (EXECUTED, FAILED) e métricas de latência.
     */
    async updateExecutionStatus(logId, status, latencyMs, responsePayload) {
        const updated = await this.prisma.paymentExecutionLog.update({
            where: { id: logId },
            data: {
                paymentExecutionStatus: status,
                executionLatencyMs: latencyMs,
                responsePayload,
            }
        });
        // Se finalizou, incrementa a métrica de uso na janela HOURLY
        await this.incrementSkillUsage(updated.skillId, updated.paymentMode, status);
        return updated;
    }
    /**
     * Captura o valor financeiro (Receita) e salva no banco de dados.
     * Utilizado quando um x402 é validado ou um Escrow é liquidado (Settled).
     */
    async captureRevenue(input) {
        const grossAmountNum = parseFloat(input.grossAmount);
        // Fee hipotético de protocolo de 2%
        const protocolFee = grossAmountNum * 0.02;
        const providerAmount = grossAmountNum - protocolFee;
        const event = await this.prisma.revenueEvent.create({
            data: {
                type: input.type,
                skillId: input.skillId,
                paymentExecutionLogId: input.paymentExecutionLogId,
                assetCode: input.assetCode || 'USDC',
                grossAmount: grossAmountNum,
                protocolFeeAmount: protocolFee,
                providerAmount: providerAmount,
                netAmount: providerAmount,
                metadata: input.metadata,
            }
        });
        // Incrementa métrica de receita
        await this.incrementRevenueMetric(input.skillId, grossAmountNum, protocolFee, providerAmount);
        return event;
    }
    /**
     * Aggregation Helper: Atualiza os contadores de uso (HOURLY)
     */
    async incrementSkillUsage(skillId, mode, status) {
        const now = new Date();
        // Trunca para o início da hora atual
        const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
        const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000);
        const isSuccess = status === client_1.PaymentExecutionStatus.EXECUTED;
        const isPaid = mode === client_1.PriceMode.PAID_PER_EXECUTION || mode === client_1.PriceMode.RFQ;
        await this.prisma.skillUsageMetric.upsert({
            where: {
                skillId_window_windowStart_windowEnd: {
                    skillId,
                    window: client_1.MetricWindow.HOURLY,
                    windowStart,
                    windowEnd
                }
            },
            update: {
                totalExecutions: { increment: 1 },
                successfulExecutions: { increment: isSuccess ? 1 : 0 },
                failedExecutions: { increment: isSuccess ? 0 : 1 },
                paidExecutions: { increment: isPaid ? 1 : 0 },
                freeExecutions: { increment: !isPaid ? 1 : 0 },
            },
            create: {
                skillId,
                window: client_1.MetricWindow.HOURLY,
                windowStart,
                windowEnd,
                totalExecutions: 1,
                successfulExecutions: isSuccess ? 1 : 0,
                failedExecutions: isSuccess ? 0 : 1,
                paidExecutions: isPaid ? 1 : 0,
                freeExecutions: !isPaid ? 1 : 0,
            }
        });
    }
    /**
     * Aggregation Helper: Atualiza os contadores de receita (HOURLY)
     */
    async incrementRevenueMetric(skillId, gross, protocol, provider) {
        const now = new Date();
        const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
        const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000);
        await this.prisma.skillUsageMetric.upsert({
            where: {
                skillId_window_windowStart_windowEnd: {
                    skillId,
                    window: client_1.MetricWindow.HOURLY,
                    windowStart,
                    windowEnd
                }
            },
            update: {
                grossRevenue: { increment: gross },
                protocolRevenue: { increment: protocol },
                providerRevenue: { increment: provider },
            },
            create: {
                skillId,
                window: client_1.MetricWindow.HOURLY,
                windowStart,
                windowEnd,
                grossRevenue: gross,
                protocolRevenue: protocol,
                providerRevenue: provider,
            }
        });
    }
}
exports.AccountingService = AccountingService;
//# sourceMappingURL=accounting.service.js.map