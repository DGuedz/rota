export interface WalletRiskInput {
    walletAddress: string;
    chain?: 'stellar' | 'evm' | 'solana' | 'unknown';
    context?: string;
}
export interface WalletRiskOutput {
    walletAddress: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    flags: string[];
    summary: string;
    confidence: number;
    signals: Record<string, any>;
    recommendedAction: 'allow' | 'review' | 'block';
}
export declare class WalletRiskCheckService {
    /**
     * Executa a análise de risco baseada em heurísticas estáticas.
     * Em futuras versões, isso poderá consultar nós RPC, indexadores externos ou modelos de ML.
     */
    execute(input: WalletRiskInput): Promise<WalletRiskOutput>;
}
export declare const walletRiskCheckService: WalletRiskCheckService;
//# sourceMappingURL=wallet-risk-check.service.d.ts.map