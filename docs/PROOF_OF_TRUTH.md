# ROTA: Onchain Proof of Truth

**Tese Comprovada:** "Construímos a função, cobramos o acesso, validamos as regras offchain e fizemos a Stellar confirmar onchain de forma atômica e rastreável."

Este documento fornece as provas criptográficas e os links públicos no explorador da rede Stellar Testnet. Qualquer agente autônomo ou jurado humano pode verificar que a arquitetura da ROTA 2.0 (x402 -> Policy Engine -> Wallet Abstraction -> Soroban Settlement) é **real e está em produção na testnet**.

## 1. The Soroban Contract (Settlement Layer)

O coração financeiro da ROTA (o contrato de Escrow e Guardrails) foi compilado em WebAssembly e implantado nativamente na Soroban Testnet.

*   **Network:** Stellar Testnet
*   **Contract ID:** `CB3JSYCDXPFZIE4WAIANRDRKDFEUWTMUL45PKE2ESNCSR23RBTRY4ELM`
*   **WASM Hash:** `a518a26ca72ed600bb208a8b7a048961e7cc03ca0876162ff08d16f23fbd8d0b`
*   **Stellar Expert Explorer:** [View Contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CB3JSYCDXPFZIE4WAIANRDRKDFEUWTMUL45PKE2ESNCSR23RBTRY4ELM)

## 2. The Agentic Golden Skill (End-to-End Execution)

Abaixo está o registro de uma execução ponta a ponta ("The Golden Skill"), onde a ROTA provisionou uma conta efêmera e pagou o gás em nome do agente de IA, após a validação bem-sucedida do token de acesso x402.

*   **Ação:** Agente iniciou um Escrow de 10 XLM.
*   **Camada de Acesso (x402):** A API bloqueou acesso anônimo com HTTP 402. O Agente forneceu um pagamento x402 de 1 XLM à ROTA para cobrir os custos de infraestrutura.
*   **Camada de Execução (Wallet Abstraction):** A ROTA gerou a Session Key Efêmera `GB7UAPWMP3EG2NV5LCWW3AYJESOYBD2UV6A4LHAGWWNQ6GJSW7PTK3EL`.
*   **Camada de Validação (Policy Engine):** A política offchain validou que a chamada estava dentro do limite (50 XLM cap) e focada exclusivamente no contrato da ROTA.
*   **Transação Final no Soroban (TxHash):** `abf4c88101574083b28d63a7ec4dc533818fdc4cebaa60c00d62b125c91773e7`

### Verifique a Transação (Lastro Onchain)
Você pode auditar a transação exata em que a tesouraria da ROTA submeteu a invocação do contrato Soroban usando os parâmetros gerados pelo Agente:
👉 **[View Transaction on Stellar Expert](https://stellar.expert/explorer/testnet/tx/abf4c88101574083b28d63a7ec4dc533818fdc4cebaa60c00d62b125c91773e7)**

## 3. O Que Isso Prova?

Ao apresentar um ID de contrato e um Hash de transação reais, provamos que a ROTA não é um "roteador de APIs" ou um overclaim de marketing.

**A ROTA já consegue sair do papel, cobrar, decidir e executar uma ação real na Stellar Testnet com rastreabilidade pública.**
