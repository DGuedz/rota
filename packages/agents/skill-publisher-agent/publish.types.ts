/**
 * Modelo de preços obrigatório para Skills ROTA.
 */
export interface SkillPricingModel {
  /**
   * "free" para uso sem custo (ex: onboarding)
   * "paid" para pagamento via x402 (L402)
   * "escrow" para travar bond on-chain antes da execução
   */
  mode: 'free' | 'paid' | 'escrow';
  
  /** Ex: "USDC", "XLM" */
  assetCode?: string;
  
  /** Ex: "1.50" */
  amount?: string;
  
  /** Se aplicável, endereço que recebe a parte do provedor */
  recipientAddress?: string;
  
  /** Requerido apenas se mode === 'escrow' */
  bondRequired?: boolean;
}

/**
 * Propriedades essenciais de um JSON Schema Draft-07 
 * (simplificado para o manifesto)
 */
export interface SkillSchemaDefinition {
  type: string;
  properties: Record<string, any>;
  required?: string[];
}

/**
 * Contrato exato do que uma capability precisa fornecer para 
 * ser transformada em skill no repositório.
 */
export interface SkillPublishRequest {
  /** Nome identificador da skill. Ex: "wallet-risk-check" */
  id: string;
  
  /** Descrição clara do que a skill faz e que valor entrega */
  description: string;
  
  /** Como invocar via cURL ou SDK */
  commandExample: string;
  
  /** Modelo de cobrança */
  pricing: SkillPricingModel;
  
  /** Schema JSON Draft-07 das entradas e saídas esperadas */
  schema: {
    input: SkillSchemaDefinition;
    output: SkillSchemaDefinition;
  };
}

/**
 * Resultado da operação de empacotamento
 */
export interface SkillPublishResult {
  success: boolean;
  skillId: string;
  generatedPaths: string[];
  errors?: string[];
}
