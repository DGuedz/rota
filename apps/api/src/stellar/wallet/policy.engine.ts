import * as StellarSdk from '@stellar/stellar-sdk';

/**
 * Interface que define os limites de uma Session Key efêmera
 */
export interface SessionPolicy {
  allowedContractIds: string[]; // Só pode interagir com esses Soroban Contracts
  allowedMethods: string[];     // Só pode chamar esses métodos (ex: 'init_escrow')
  maxAmountPerTx: number;       // Limite de valor em XLM por chamada
  expiresAt: number;            // Timestamp de expiração da sessão (ex: +15min)
}

/**
 * Intenção do Agente de IA para a Skill
 */
export interface AgentIntent {
  contractId: string;
  method: string;
  args: any[];
  amount?: string;
}

export class PolicyEngine {
  /**
   * Valida a intenção do Agente contra a Política da Sessão.
   * Lança exceção se houver violação (Guardrail Offchain).
   */
  public static validateIntent(intent: AgentIntent, policy: SessionPolicy): void {
    const now = Date.now();

    // 1. Time Lock Check
    if (now > policy.expiresAt) {
      throw new Error('[PolicyEngine] Session Key expired. Please renew your session.');
    }

    // 2. Contract Allowlist Check
    if (!policy.allowedContractIds.includes(intent.contractId)) {
      throw new Error(`[PolicyEngine] Contract ID ${intent.contractId} is not allowed by current session policy.`);
    }

    // 3. Method Allowlist Check
    if (!policy.allowedMethods.includes(intent.method)) {
      throw new Error(`[PolicyEngine] Method '${intent.method}' is not allowed by current session policy.`);
    }

    // 4. Value/Spending Cap Check
    if (intent.amount) {
      const numericAmount = parseFloat(intent.amount);
      if (isNaN(numericAmount) || numericAmount > policy.maxAmountPerTx) {
        throw new Error(`[PolicyEngine] Transaction amount (${intent.amount}) exceeds session policy limit (${policy.maxAmountPerTx}).`);
      }
    }

    // Tudo OK.
  }
}
