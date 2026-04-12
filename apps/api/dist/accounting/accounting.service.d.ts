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
    logExecution(input: CreatePaymentLogInput, status: PaymentExecutionStatus): Promise<any>;
    /**
     * Atualiza um log existente com o status final (EXECUTED, FAILED) e métricas de latência.
     */
    updateExecutionStatus(logId: string, status: PaymentExecutionStatus, latencyMs?: number, responsePayload?: any): Promise<any>;
    /**
     * Captura o valor financeiro (Receita) e salva no banco de dados.
     * Utilizado quando um x402 é validado ou um Escrow é liquidado (Settled).
     */
    captureRevenue(input: CaptureRevenueInput): Promise<any>;
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