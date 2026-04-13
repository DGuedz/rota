import { PrismaClient, PaymentExecutionStatus, PriceMode, RevenueEventType } from '@prisma/client';
export interface CreatePaymentLogInput {
    skillId: string;
    paymentMode: PriceMode;
    paymentAssetCode?: string;
    paymentAssetIssuer?: string;
    amountCharged?: string;
    x402TokenRef?: string;
    x402VerificationRef?: string;
    buyerAgentId?: string;
    requestPayload?: any;
}
export interface CaptureRevenueInput {
    type: RevenueEventType;
    skillId: string;
    paymentExecutionLogId?: string;
    grossAmount: string;
    assetCode?: string;
    metadata?: any;
}
export declare class AccountingService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Registra o início ou progresso de uma execução econômica (Paga ou Gratuita).
     */
    logExecution(input: CreatePaymentLogInput, status: PaymentExecutionStatus): Promise<{
        id: string;
        correlationId: string | null;
        intentId: string | null;
        buyerAgentId: string | null;
        sellerAgentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        skillId: string;
        paymentExecutionStatus: import(".prisma/client").$Enums.PaymentExecutionStatus;
        paymentMode: import(".prisma/client").$Enums.PriceMode;
        paymentAssetCode: string;
        paymentAssetIssuer: string | null;
        amountCharged: import("@prisma/client/runtime/library").Decimal | null;
        x402TokenRef: string | null;
        x402VerificationRef: string | null;
        requestPayload: import("@prisma/client/runtime/library").JsonValue | null;
        responsePayload: import("@prisma/client/runtime/library").JsonValue | null;
        errorPayload: import("@prisma/client/runtime/library").JsonValue | null;
        executionLatencyMs: number | null;
        escrowTransactionId: string | null;
    }>;
    /**
     * Atualiza um log existente com o status final (EXECUTED, FAILED) e métricas de latência.
     */
    updateExecutionStatus(logId: string, status: PaymentExecutionStatus, latencyMs?: number, responsePayload?: any): Promise<{
        id: string;
        correlationId: string | null;
        intentId: string | null;
        buyerAgentId: string | null;
        sellerAgentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        skillId: string;
        paymentExecutionStatus: import(".prisma/client").$Enums.PaymentExecutionStatus;
        paymentMode: import(".prisma/client").$Enums.PriceMode;
        paymentAssetCode: string;
        paymentAssetIssuer: string | null;
        amountCharged: import("@prisma/client/runtime/library").Decimal | null;
        x402TokenRef: string | null;
        x402VerificationRef: string | null;
        requestPayload: import("@prisma/client/runtime/library").JsonValue | null;
        responsePayload: import("@prisma/client/runtime/library").JsonValue | null;
        errorPayload: import("@prisma/client/runtime/library").JsonValue | null;
        executionLatencyMs: number | null;
        escrowTransactionId: string | null;
    }>;
    /**
     * Captura o valor financeiro (Receita) e salva no banco de dados.
     * Utilizado quando um x402 é validado ou um Escrow é liquidado (Settled).
     */
    captureRevenue(input: CaptureRevenueInput): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.RevenueEventType;
        intentId: string | null;
        assetCode: string;
        assetIssuer: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        txHash: string | null;
        skillId: string | null;
        escrowTransactionId: string | null;
        grossAmount: import("@prisma/client/runtime/library").Decimal;
        protocolFeeAmount: import("@prisma/client/runtime/library").Decimal | null;
        providerAmount: import("@prisma/client/runtime/library").Decimal | null;
        netAmount: import("@prisma/client/runtime/library").Decimal | null;
        occurredAt: Date;
        paymentExecutionLogId: string | null;
    }>;
    /**
     * Aggregation Helper: Atualiza os contadores de uso (HOURLY)
     */
    private incrementSkillUsage;
    /**
     * Aggregation Helper: Atualiza os contadores de receita (HOURLY)
     */
    private incrementRevenueMetric;
}
//# sourceMappingURL=accounting.service.d.ts.map