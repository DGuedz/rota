import * as StellarSdk from '@stellar/stellar-sdk';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

async function deploy() {
  console.log("Starting deployment of ROTA Escrow Contract to Testnet...");

  const rpcUrl = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
  const networkPassphrase = StellarSdk.Networks.TESTNET;
  const server = new StellarSdk.rpc.Server(rpcUrl);

    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    
    let secret = process.env.ROTA_TREASURY_SECRET;
    if (!secret) {
      secret = StellarSdk.Keypair.random().secret();
      if (!envContent.includes('ROTA_TREASURY_SECRET=')) {
        envContent += `\nROTA_TREASURY_SECRET=${secret}\n`;
        fs.writeFileSync(envPath, envContent);
        console.log("Generated and saved new ROTA_TREASURY_SECRET to .env");
      }
    }
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
  const sourcePublicKey = sourceKeypair.publicKey();

  console.log(`Using Treasury Account: ${sourcePublicKey}`);

  try {
    // Check if account exists and fund it via Friendbot if it doesn't
    try {
      await server.getAccount(sourcePublicKey);
    } catch (e) {
      console.log("Account not found. Funding via Friendbot...");
      await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(sourcePublicKey)}`);
      console.log("Account funded!");
    }

    const account = await server.getAccount(sourcePublicKey);
    const sourceAccount = new StellarSdk.Account(sourcePublicKey, account.sequenceNumber());

    const wasmPath = path.resolve(process.cwd(), 'contracts/soroban/escrow-interface/target/wasm32-unknown-unknown/release/rota_escrow.wasm');
    const wasm = fs.readFileSync(wasmPath);

    console.log("Uploading WASM...");
    const uploadOperation = StellarSdk.Operation.invokeHostFunction({
      func: StellarSdk.xdr.HostFunction.hostFunctionTypeUploadContractWasm(wasm),
      auth: [],
    });

    let tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: '1000000',
      networkPassphrase,
    })
      .addOperation(uploadOperation)
      .setTimeout(300)
      .build();

    let preparedTx = await server.prepareTransaction(tx);
    preparedTx.sign(sourceKeypair);

    console.log("Submitting WASM upload transaction...");
    let txResponse = await server.sendTransaction(preparedTx);
    if (txResponse.status === 'ERROR') {
      throw new Error(`Upload failed: ${txResponse.errorResult}`);
    }

    // Wait for the transaction to be processed
    console.log(`Waiting for WASM upload (Tx Hash: ${txResponse.hash})...`);
    let getTxResult = await server.getTransaction(txResponse.hash);
    while (getTxResult.status === 'NOT_FOUND') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      getTxResult = await server.getTransaction(txResponse.hash);
    }

    if (getTxResult.status !== 'SUCCESS') {
      throw new Error(`Transaction failed: ${JSON.stringify(getTxResult)}`);
    }

    if (!getTxResult.returnValue) throw new Error("No return value");
    const wasmId = getTxResult.returnValue.bytes();
    console.log(`WASM uploaded successfully! WASM ID: ${wasmId.toString('hex')}`);

    console.log("Creating Contract...");
    // Refetch account sequence
    const account2 = await server.getAccount(sourcePublicKey);
    const sourceAccount2 = new StellarSdk.Account(sourcePublicKey, account2.sequenceNumber());

    const createOperation = StellarSdk.Operation.invokeHostFunction({
      func: StellarSdk.xdr.HostFunction.hostFunctionTypeCreateContract(
        new StellarSdk.xdr.CreateContractArgs({
          contractIdPreimage: StellarSdk.xdr.ContractIdPreimage.contractIdPreimageFromAddress(
            new StellarSdk.xdr.ContractIdPreimageFromAddress({
              address: StellarSdk.Address.fromString(sourcePublicKey).toScAddress(),
              salt: Buffer.alloc(32, 0), // Use zeroes or random salt
            })
          ),
          executable: StellarSdk.xdr.ContractExecutable.contractExecutableWasm(wasmId),
        })
      ),
      auth: [],
    });

    let tx2 = new StellarSdk.TransactionBuilder(sourceAccount2, {
      fee: '1000000',
      networkPassphrase,
    })
      .addOperation(createOperation)
      .setTimeout(300)
      .build();

    let preparedTx2 = await server.prepareTransaction(tx2);
    preparedTx2.sign(sourceKeypair);

    console.log("Submitting Contract creation transaction...");
    let txResponse2 = await server.sendTransaction(preparedTx2);
    if (txResponse2.status === 'ERROR') {
      throw new Error(`Create failed: ${txResponse2.errorResult}`);
    }

    console.log(`Waiting for Contract creation (Tx Hash: ${txResponse2.hash})...`);
    let getTxResult2 = await server.getTransaction(txResponse2.hash);
    while (getTxResult2.status === 'NOT_FOUND') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      getTxResult2 = await server.getTransaction(txResponse2.hash);
    }

    if (getTxResult2.status !== 'SUCCESS') {
      throw new Error(`Transaction failed: ${JSON.stringify(getTxResult2)}`);
    }

    if (!getTxResult2.returnValue) throw new Error("No return value");
    // Extrac the contract ID from the result
    const contractId = StellarSdk.Address.fromScVal(getTxResult2.returnValue).toString();
    console.log(`\n✅ Contract deployed successfully!`);
    console.log(`Contract ID: ${contractId}`);
    
    // Update .env file
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    
    if (envContent.includes('SOROBAN_ESCROW_CONTRACT_ID=')) {
      envContent = envContent.replace(/SOROBAN_ESCROW_CONTRACT_ID=.*/g, `SOROBAN_ESCROW_CONTRACT_ID=${contractId}`);
    } else {
      envContent += `\nSOROBAN_ESCROW_CONTRACT_ID=${contractId}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated .env with SOROBAN_ESCROW_CONTRACT_ID`);

  } catch (error) {
    console.error("Deployment failed:", error);
  }
}

deploy();