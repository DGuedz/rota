# Pricing & Settlement Policy
    
Skill: `proof-verifier`
Model: `PAID`

## Regras
- Preço base: **0.50 USDC**
- Recebedor principal: `GBUYERTESTACCOUNT...`
- Bond requirement: `Não`

### x402 / MPP
Em modo `paid`, o cliente receberá um `402 Payment Required` com um header `Www-Authenticate: L402...`.
Você deve obter o token L402 no facilitador (ex: x402-testnet.rota.network) antes de refazer o request com `Authorization: L402 <macaroon>:<preimage>`.
