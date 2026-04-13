import { PrismaClient } from "@prisma/client";
export interface ProofVerifierInput {
    proofPayload: string;
    escrowId?: string;
    signatures: Array<{
        signer: string;
        signature: string;
    }>;
}
export interface ProofVerifierOutput {
    isValid: boolean;
    confidenceScore: number;
    issues: string[];
    verifiedAt: string;
}
export declare class ProofVerifierService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    /**
     * Executes the proof verification skill.
     * This simulated version parses the proof payload and verifies signatures heuristically.
     * In a real implementation, this would perform actual cryptographic checks or zero-knowledge proof verification.
     */
    execute(input: ProofVerifierInput): Promise<ProofVerifierOutput>;
}
//# sourceMappingURL=proof-verifier.service.d.ts.map