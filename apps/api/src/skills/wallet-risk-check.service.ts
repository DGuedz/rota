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

export class WalletRiskCheckService {
  
  /**
   * Executa a análise de risco baseada em heurísticas estáticas.
   * Em futuras versões, isso poderá consultar nós RPC, indexadores externos ou modelos de ML.
   */
  async execute(input: WalletRiskInput): Promise<WalletRiskOutput> {
    const { walletAddress, chain = 'unknown', context } = input;
    
    let riskScore = 0;
    const flags: string[] = [];
    const signals: Record<string, any> = {
      chainKnown: chain !== 'unknown',
      addressFormatValid: walletAddress.length >= 16,
      reputationHistoryAvailable: false,
    };

    // --- HEURÍSTICA V0.1 ---

    // 1. Validação Básica
    if (!signals.addressFormatValid) {
      riskScore += 80;
      flags.push('invalid_address_format');
    }

    // 2. Mock de Padrões Suspeitos
    if (walletAddress.startsWith('G') && walletAddress.endsWith('SCAM')) {
      riskScore += 90;
      flags.push('known_scam_pattern');
    }

    // 3. Mock de Conta Fresca (Fresh Wallet)
    // Simulando que carteiras começando com "GNEW" são recém criadas e sem histórico.
    if (walletAddress.startsWith('GNEW')) {
      riskScore += 40;
      flags.push('fresh_wallet_no_history');
    }

    // 4. Análise de Contexto
    if (!context) {
      riskScore += 15;
      flags.push('missing_execution_context');
    }

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    // --- CLASSIFICAÇÃO ---
    let riskLevel: WalletRiskOutput['riskLevel'];
    let recommendedAction: WalletRiskOutput['recommendedAction'];
    let summary = '';

    if (riskScore <= 24) {
      riskLevel = 'low';
      recommendedAction = 'allow';
      summary = 'Wallet presents no immediate risk indicators. Safe for automated execution.';
    } else if (riskScore <= 49) {
      riskLevel = 'medium';
      recommendedAction = 'review';
      summary = 'Wallet has minor flags. Manual review or additional limits are recommended.';
    } else if (riskScore <= 74) {
      riskLevel = 'high';
      recommendedAction = 'block';
      summary = 'Wallet presents elevated uncertainty or known risky patterns.';
    } else {
      riskLevel = 'critical';
      recommendedAction = 'block';
      summary = 'Critical risk. Wallet matches known malicious signatures or is severely malformed.';
    }

    // Confiança mockada baseada na quantidade de dados disponíveis (ex: chain conhecida)
    const confidence = signals.chainKnown ? 0.95 : 0.60;

    return {
      walletAddress,
      riskScore,
      riskLevel,
      flags,
      summary,
      confidence,
      signals,
      recommendedAction,
    };
  }
}

// Instância singleton
export const walletRiskCheckService = new WalletRiskCheckService();
