export declare enum SkillMonetizationTier {
    FREE = "FREE",
    PAID_PER_EXECUTION = "PAID_PER_EXECUTION",// x402 direct
    ESCROW_REQUIRED = "ESCROW_REQUIRED",// intents + rfq
    ENTERPRISE = "ENTERPRISE"
}
export interface SkillPricingConfig {
    tier: SkillMonetizationTier;
    assetCode: string;
    assetIssuer?: string;
    amount?: string;
    requiresBond: boolean;
    bondAmount?: string;
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
//# sourceMappingURL=monetization.types.d.ts.map