import dotenv from 'dotenv';
dotenv.config();

export interface X402EnvironmentConfig {
  facilitatorUrl: string;
  networkPassphrase: string;
  assetCode: string;
  assetIssuer?: string;
  recipientAddress: string;
  defaultAmount: string; // Default price if none specified
}

export function getX402Config(): X402EnvironmentConfig {
  const facilitatorUrl = process.env.X402_FACILITATOR_URL;
  const networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
  const assetCode = process.env.X402_DEFAULT_ASSET_CODE || 'USDC';
  const assetIssuer = process.env.X402_DEFAULT_ASSET_ISSUER; // Optional on testnet/native
  const recipientAddress = process.env.X402_DEFAULT_RECIPIENT_ADDRESS;
  const defaultAmount = process.env.X402_DEFAULT_AMOUNT || '1.0000000';

  if (!facilitatorUrl) {
    throw new Error('FATAL: X402_FACILITATOR_URL environment variable is required to run the payment module.');
  }

  if (!recipientAddress) {
    throw new Error('FATAL: X402_DEFAULT_RECIPIENT_ADDRESS environment variable is required to receive payments.');
  }

  return {
    facilitatorUrl,
    networkPassphrase,
    assetCode,
    assetIssuer,
    recipientAddress,
    defaultAmount,
  };
}
