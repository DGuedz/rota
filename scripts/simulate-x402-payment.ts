import * as StellarSdk from '@stellar/stellar-sdk';
import axios from 'axios';

// Script para simular o "Agent-to-Agent" payment flow com x402
async function main() {
  console.log("=== ROTA: Simulating x402 Agentic Payment Flow ===");

  // 1. Gera Keypairs para o Comprador (Agente que consome a API)
  const buyerKeys = StellarSdk.Keypair.random();
  console.log(`[1] Generated Agent Wallet: ${buyerKeys.publicKey()}`);

  // Para o hackathon, vamos gerar um XDR assinado manualmente e enviar como token x402
  const networkPassphrase = StellarSdk.Networks.TESTNET;
  const rotaRecipient = StellarSdk.Keypair.random().publicKey(); // Mock ROTA Treasury

  console.log(`[2] Building x402 Transaction Envelope (Payment of 0.05 XLM)...`);
  
  const account = new StellarSdk.Account(buyerKeys.publicKey(), "1");
  const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase })
    .addOperation(StellarSdk.Operation.payment({
      destination: rotaRecipient,
      asset: StellarSdk.Asset.native(),
      amount: "0.05"
    }))
    .setTimeout(0)
    .build();

  tx.sign(buyerKeys);
  const x402Token = tx.toXDR();
  console.log(`[3] Generated x402 Token (Base64 XDR): ${x402Token.substring(0, 30)}...`);

  // Disparar contra a API
  console.log(`[4] Executing skill 'wallet-risk-check' with x402 header...`);
  
  try {
    const response = await axios.post('http://localhost:8080/skills/wallet-risk-check/execute', 
      { walletAddress: buyerKeys.publicKey() },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rota-payment-token': x402Token
        }
      }
    );

    console.log("[5] Response from ROTA API:");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("=== Settlement Completed Successfully! ===");

  } catch (error: any) {
    if (error.response) {
      console.error("[ERROR] API Rejected the request:");
      console.error(error.response.data);
    } else {
      console.error("[ERROR] Connection failed:", error.message);
    }
  }
}

main();