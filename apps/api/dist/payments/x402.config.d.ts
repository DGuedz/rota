export interface X402EnvironmentConfig {
    facilitatorUrl: string;
    networkPassphrase: string;
    assetCode: string;
    assetIssuer?: string;
    recipientAddress: string;
    defaultAmount: string;
}
export declare function getX402Config(): X402EnvironmentConfig;
//# sourceMappingURL=x402.config.d.ts.map