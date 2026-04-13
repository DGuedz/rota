"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillMonetizationPolicy = void 0;
const client_1 = require("@prisma/client");
const monetization_types_1 = require("./monetization.types");
class SkillMonetizationPolicy {
    /**
     * Resolve a política baseada nos dados persistidos no banco.
     * Decide se a Skill vai passar livre, bater no x402, ou exigir um fluxo completo de Escrow (RFQ).
     */
    static resolve(skill) {
        // Caso a skill não esteja ativa
        if (!skill.isActive) {
            return {
                isFree: false,
                requiresX402: false,
                requiresEscrow: false,
                requiresBond: false,
                rejectionReason: 'Skill is inactive',
            };
        }
        const config = skill.priceConfig;
        // 1. Tier Gratuito
        if (skill.priceMode === client_1.PriceMode.FREE || config?.tier === monetization_types_1.SkillMonetizationTier.FREE) {
            return {
                isFree: true,
                requiresX402: false,
                requiresEscrow: false,
                requiresBond: false,
            };
        }
        // 2. Pagamento por Execução (x402)
        if (skill.priceMode === client_1.PriceMode.PAID_PER_EXECUTION || config?.tier === monetization_types_1.SkillMonetizationTier.PAID_PER_EXECUTION) {
            return {
                isFree: false,
                requiresX402: true,
                requiresEscrow: false,
                requiresBond: false,
                priceAmount: config.amount,
                assetCode: config.assetCode,
            };
        }
        // 3. Requer Escrow/Bond via Soroban
        if (skill.priceMode === client_1.PriceMode.RFQ || config?.tier === monetization_types_1.SkillMonetizationTier.ESCROW_REQUIRED) {
            return {
                isFree: false,
                requiresX402: false, // Escrow é pago via smart contract, não via header x402
                requiresEscrow: true,
                requiresBond: config.requiresBond || skill.requiredBond.toNumber() > 0,
                assetCode: config.assetCode,
            };
        }
        // 4. Default conservador: Se o mode não foi mapeado, bloqueia.
        return {
            isFree: false,
            requiresX402: false,
            requiresEscrow: false,
            requiresBond: false,
            rejectionReason: `Unknown or unhandled pricing mode: ${skill.priceMode}`,
        };
    }
}
exports.SkillMonetizationPolicy = SkillMonetizationPolicy;
//# sourceMappingURL=skill-pricing.service.js.map