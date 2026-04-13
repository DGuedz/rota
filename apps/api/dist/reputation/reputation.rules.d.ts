import { ReputationRule, ReputationSignal } from "./reputation.types";
export declare const REPUTATION_RULES: Record<ReputationSignal, ReputationRule>;
export declare function clampReputationScore(score: number): number;
export declare function getReputationRule(signal: ReputationSignal): ReputationRule;
//# sourceMappingURL=reputation.rules.d.ts.map