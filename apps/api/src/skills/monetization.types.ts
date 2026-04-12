export enum SkillMonetizationTier {
  FREE = 'FREE',
  PAID_PER_EXECUTION = 'PAID_PER_EXECUTION', // x402 direct
  ESCROW_REQUIRED = 'ESCROW_REQUIRED', // intents + rfq
  ENTERPRISE = 'ENTERPRISE', // custom SLA, custom bond
}

export interface SkillPricingConfig {
  tier: SkillMonetizationTier;
  assetCode: string;
  assetIssuer?: string;
  amount?: string; // Required if PAID_PER_EXECUTION
  requiresBond: boolean;
  bondAmount?: string; // Required if requiresBond = true
  requiresSla: boolean;
  minReputation: number;
}

export interface PolicyResolutionResult {
  isFree: boolean;
  requiresX402: boolean;
  requiresEscrow: boolean;
  requiresBond: boolean;
  priceAmount?: string;
  assetCode?: string;
  rejectionReason?: string;
}
