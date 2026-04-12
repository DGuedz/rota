"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StellarClient = void 0;
const StellarSdk = __importStar(require("@stellar/stellar-sdk"));
const stellar_sdk_1 = require("@stellar/stellar-sdk");
class StellarClient {
    server;
    networkPassphrase;
    contractId;
    constructor() {
        // Para simplificar no MVP, conectamos na testnet por padrão.
        const rpcUrl = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
        this.networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;
        this.contractId = process.env.SOROBAN_ESCROW_CONTRACT_ID || 'C_DUMMY_CONTRACT_ID_REPLACE_ME';
        this.server = new stellar_sdk_1.rpc.Server(rpcUrl);
    }
    /**
     * Helper para buscar o status de uma transação enviada.
     * Utilizado para checar a liquidação do `stellarLockTxHash`.
     */
    async getTransactionStatus(txHash) {
        try {
            const response = await this.server.getTransaction(txHash);
            return {
                txHash,
                ledger: response.latestLedger || 0,
                status: response.status === 'SUCCESS' ? 'SUCCESS' : response.status === 'FAILED' ? 'FAILED' : 'PENDING',
            };
        }
        catch (error) {
            console.error(`[StellarClient] Error fetching tx ${txHash}:`, error);
            return { txHash, ledger: 0, status: 'FAILED' };
        }
    }
}
exports.StellarClient = StellarClient;
//# sourceMappingURL=stellar.client.js.map