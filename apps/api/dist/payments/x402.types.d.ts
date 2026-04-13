export interface X402PaymentRequirement {
    assetCode: string;
    assetIssuer?: string;
    amount: string;
    recipientAddress: string;
    memo?: string;
    facilitatorUrl: string;
}
export interface X402VerificationResult {
    isValid: boolean;
    paymentHash?: string;
    amountPaid?: string;
    errorReason?: string;
}
export interface X402ProtectedRequest {
    skillId?: string;
    agentId?: string;
    paymentToken?: string;
    [key: string]: any;
}
//# sourceMappingURL=x402.types.d.ts.map