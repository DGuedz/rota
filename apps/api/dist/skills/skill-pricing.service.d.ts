import { Skill } from '@prisma/client';
import { PolicyResolutionResult } from './monetization.types';
export declare class SkillMonetizationPolicy {
    /**
     * Resolve a política baseada nos dados persistidos no banco.
     * Decide se a Skill vai passar livre, bater no x402, ou exigir um fluxo completo de Escrow (RFQ).
     */
    static resolve(skill: Skill): PolicyResolutionResult;
}
//# sourceMappingURL=skill-pricing.service.d.ts.map