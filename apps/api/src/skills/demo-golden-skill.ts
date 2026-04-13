import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarClient } from '../stellar/stellar.client';
import { WalletAbstractionService } from '../stellar/wallet/wallet-abstraction.service';
import { AgentEscrowInitSkill } from './agent-escrow-init.service';
import { getX402Config } from '../payments/x402.config';
import { StellarX402VerificationProvider } from '../payments/x402.service';
import 'dotenv/config';

// Force env vars for the demo
process.env.X402_DEFAULT_RECIPIENT_ADDRESS = 'GAFDWB54QREKJ4XVAJD47F5356ZXWUCOGEYT3XEMHGIEB3B6BXL6PJDN';
process.env.X402_DEFAULT_ASSET_CODE = 'XLM';
process.env.X402_FACILITATOR_URL = 'http://localhost:8080';
process.env.STELLAR_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
process.env.ROTA_TREASURY_SECRET = 'SAPZTFU6VEBIURS66GAIQRWU4FXGINMWPRRMCB3VIWL2P3IZLXDKCAAX';
process.env.SOROBAN_ESCROW_CONTRACT_ID = 'CB3JSYCDXPFZIE4WAIANRDRKDFEUWTMUL45PKE2ESNCSR23RBTRY4ELM';

/**
 * Script de Demonstração - Hackathon ROTA
 * Mostra um "Agente IA" usando a Skill Layer da ROTA para iniciar
 * uma transação Soroban sem lidar com Gás ou SDK complexo.
 */
async function run() {
  console.log("=========================================");
  console.log("🤖 ROTA Golden Skill Demo: Agent Escrow Init");
  console.log("=========================================");

  const stellarClient = new StellarClient();
  const walletAbstraction = new WalletAbstractionService(stellarClient);
  const goldenSkill = new AgentEscrowInitSkill(stellarClient, walletAbstraction);
  const x402Config = getX402Config();
  const x402Verifier = new StellarX402VerificationProvider(stellarClient, x402Config);

  // 1. O Agente e seus dados
  const agentKeypair = StellarSdk.Keypair.random();
  console.log(`[Agente] Minha chave pública (Wallet Principal): ${agentKeypair.publicKey()}`);
  
  const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
  
  const intent = {
    seller: StellarSdk.Keypair.random().publicKey(),
    resolver: StellarSdk.Keypair.random().publicKey(),
    asset: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC', // XLM Contract on Testnet
    amount: "100000000", // 10 XLM em stroops
    bondAmount: "10000000", // 1 XLM bond
    deadline: Math.floor(Date.now() / 1000) + 86400, // +1 dia
    disputeDeadline: Math.floor(Date.now() / 1000) + 86400 * 2,
    metadataHash: "0000000000000000000000000000000000000000000000000000000000000000" // Mock hash
  };

  // 2. Agente tenta executar sem pagar o pedágio (Esperado: 402)
  console.log(`\n[Agente] Tentando invocar a Skill Layer sem pagar o x402...`);
  try {
    // Simulating the 402 Middleware rejection
    throw new Error("402 Payment Required. Header: Www-Authenticate: X402 amount=\"1.0000000\" asset=\"XLM\"");
  } catch (error: any) {
    console.log(`[ROTA] Acesso Negado: ${error.message}`);
  }

  // 3. Agente paga o Pedágio (Gera o Token x402 Válido)
  console.log(`\n[Agente] OK, vou gerar o pagamento x402 de 1 XLM para a ROTA...`);
  
  const rotaRecipient = 'GAFDWB54QREKJ4XVAJD47F5356ZXWUCOGEYT3XEMHGIEB3B6BXL6PJDN';
  const txBuilder = new StellarSdk.TransactionBuilder(
    new StellarSdk.Account(agentKeypair.publicKey(), "1"), 
    { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
  );
  txBuilder.addOperation(StellarSdk.Operation.payment({
    destination: rotaRecipient,
    asset: StellarSdk.Asset.native(),
    amount: "1.0000000"
  }));
  const tx = txBuilder.setTimeout(0).build();
  tx.sign(agentKeypair);
  const validX402Token = tx.toXDR();

  console.log(`[Agente] Token x402 gerado e assinado!`);

  // 4. Agente tenta novamente com o Token
  console.log(`\n[Agente] Invocando a Skill Layer com Intenção JSON e Token x402...`);
  try {
    // Simulating the middleware verification
    const verification = await x402Verifier.verify(validX402Token, {});
    if (!verification.isValid) throw new Error(`X402 Verification failed: ${verification.errorReason}`);

    console.log(`[ROTA Middleware] X402 Payment Verified! Forwarding to Skill...`);

    const result = await goldenSkill.execute(intent);

    console.log(`\n=========================================`);
    console.log(`✅ [ROTA] Sucesso! A Mágica Aconteceu!`);
    console.log(`=========================================`);
    console.log(`- Mensagem: ${result.message}`);
    console.log(`- Chave Efêmera (Wallet Abstraction): ${result.ephemeralPublicKeyUsed}`);
    console.log(`- Política Aplicada: ${JSON.stringify(result.policyApplied)}`);
    console.log(`- TxHash (Soroban): ${result.txHash}`);
    
  } catch (error: any) {
    console.error(`\n❌ [Erro na Execução da Skill]:`);
    console.error(error.message);
  }
}

run();