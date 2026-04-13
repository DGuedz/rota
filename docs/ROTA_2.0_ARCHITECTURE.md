# ROTA 2.0: The Agentic Skill Layer for Stellar

**Documento de Arquitetura Alvo & Produto (Economy-First / Zero-Overclaim)**
**Tese Central:** Agentes sabem decidir, mas travam na hora de transacionar. A ROTA transforma o uso on-chain em uma simples `function call` (Skill), abstraindo SDKs, gas, nonces e custódia manual, mantendo controle econômico via x402 e liquidação via Soroban.

## 1. Arquitetura Alvo (Camadas)

A ROTA atua como um gateway de interoperabilidade dividido em 4 camadas estritas:

1.  **Access / Intent Layer (x402):** O pedágio. Controla quem entra, quanto custa e o que deseja fazer. Validações HTTP 402, tokens LSAT/x402 e anti-replay.
2.  **Execution Layer (Wallet Abstraction):** O veículo. Após o pedágio pago, a ROTA provisiona uma *Session Key* (conta efêmera) para o agente. Execução gasless (Paymaster) controlada por um *Policy Engine* off-chain antes de assinar.
3.  **Settlement / Guardrails Layer (Soroban):** O destino. Smart contracts de escrow. Condições de liberação, travas de tempo (time locks) e regras imutáveis on-chain.
4.  **Proof / Audit Layer:** O recibo. Indexação do Soroban (via `SorobanIndexer`), hashes de requisição amarrados ao x402 token e logs de liquidação on-chain para auditoria e reputação.

## 2. Mapa de Componentes

*   **API Gateway (Fastify):** Recebe chamadas de agentes, intercepta via middleware x402.
*   **x402 Service:** Valida a assinatura do XDR de pagamento e os requisitos (asset, amount, recipient).
*   **Policy Engine:** Motor de regras off-chain que avalia a requisição do agente contra os limites da *Session Key*.
*   **Ephemeral Key Manager (KMS):** Cria e custodia chaves temporárias na memória/KMS para assinar transações na Stellar em nome do agente (Wallet Abstraction).
*   **Soroban Escrow Contract (`rota-escrow`):** Contrato Rust que segura os fundos do comprador e a garantia (bond) do provedor da skill.
*   **Soroban Indexer:** Ouve eventos `escrow.settled` e `escrow.slashed` para atualizar o estado off-chain e reputação.

## 3. Fluxo Ponta a Ponta (Function Call -> Onchain)

1.  **Intent:** Agente IA tenta executar a skill `swap-assets` via HTTP POST.
2.  **402 Payment Required:** API rejeita com 402, exigindo 0.5 XLM.
3.  **Access (x402):** Agente paga (via carteira principal) e reenvia a requisição com o token x402 no header.
4.  **Verification:** `x402.service.ts` valida o token (assinatura, valor, destinatário).
5.  **Provisioning (Wallet Abstraction):** ROTA gera uma *Session Key* efêmera, injeta gas (via conta Paymaster interna) e atrela a sessão ao payload aprovado.
6.  **Policy Check:** O *Policy Engine* verifica se a ação solicitada respeita os limites da sessão.
7.  **Execution:** A ROTA assina e submete a transação à rede Stellar usando a Session Key.
8.  **Settlement:** O contrato Soroban executa a lógica (e.g., inicia o escrow).
9.  **Proof:** O `SorobanIndexer` captura o evento on-chain, finaliza a requisição e devolve o recibo (txHash) ao agente.

## 4. A Conexão: x402 + Wallet Abstraction

*   **x402 autoriza economicamente:** É a camada de *billing* e *auth*. O agente prova que pagou o direito de usar a infraestrutura.
*   **Wallet Abstraction executa on-chain:** É a camada de *ação*. O agente não precisa saber assinar XDRs complexos para a operação final. O pagamento do x402 "compra" o direito de a ROTA executar a ação complexa usando uma conta efêmera gasless.

## 5. Modelo de Permissões Híbrido (Policy Engine)

Para evitar que contas efêmeras sejam abusadas, a ROTA implementa um modelo híbrido e estrito (Defense-in-Depth):

*   **Janela Temporal Curta (Time-to-Live):** Sessão válida por apenas 15 minutos ou 1 execução.
*   **Teto por Operação (Per-Tx Cap):** Máximo de valor transacionado por chamada (ex: $50).
*   **Teto Agregado (Session Cap):** Máximo acumulado na sessão (ex: $200).
*   **Allowlist de Ações (Scope):** A sessão só pode invocar métodos específicos do Soroban (ex: `init_escrow`, `transfer`).
*   **Allowlist de Contratos (Target):** Só interage com IDs de contrato predefinidos (ex: `C_DUMMY...`).
*   **Nonce / Anti-Replay:** 1 token x402 = 1 execução autorizada.
*   **Kill Switch:** Invalidação imediata da sessão em caso de anomalia.

## 6. Riscos Críticos

*   **Custódia Off-chain (Trust Assumption):** A ROTA assina transações pela conta efêmera. Se a ROTA for comprometida, ela pode abusar das *Session Keys* ativas. *Mitigação:* O Policy Engine deve rodar em enclave seguro (KMS) ou as chaves devem ser estritamente limitadas em saldo (injetado just-in-time).
*   **Replay Attacks:** Tokens x402 reutilizados. *Mitigação:* Cache de hashes de pagamento (Redis) para garantir uso único.
*   **Gargalo do RPC:** Limites de taxa ao submeter transações ou consultar o Indexer. *Mitigação:* Fila BullMQ com retry e backoff.

## 7. Overclaims a Remover (Brutal Honesty)

*   **"100% Trustless / Descentralizado":** FALSO. A ROTA atua como um coordenador off-chain. O modelo é *Trust-Minimized* (o Soroban garante o escrow, o x402 garante a prova de pagamento), mas a execução da Wallet Abstraction exige confiança no servidor da ROTA.
*   **"Compatível com qualquer Chain":** FALSO. O foco atual é 100% Stellar e Soroban para garantir profundidade técnica e performance.
*   **"Agentes Autônomos Completos":** FALSO. A ROTA fornece a *infraestrutura* para agentes de terceiros, não os "cérebros".

## 8. Roadmap em Ordem de Impacto

1.  **Fase 1 (Atual): Verificação Real x402.** Substituir mocks por `StellarSdk.TransactionBuilder.fromXDR` (Implementado no PRD anterior).
2.  **Fase 2: Ephemeral Session Keys.** Implementar gerador de Keypairs temporários atrelados ao request e injetar gas mínimo (Sponsor/Paymaster).
3.  **Fase 3: Policy Engine Básico.** Middleware que intercepta a execução da Session Key validando Allowlist de Contratos e Nonce.
4.  **Fase 4: Soroban Escrow End-to-End.** Integrar o contrato `rota-escrow` com o fluxo da Session Key.
5.  **Fase 5: Hackathon Demo & Packaging.** CLI e scripts limpos para demonstração visual.

## 9. Top 3 Features para Vencer o Hackathon

1.  **Gasless Agentic Execution (A Mágica Visível):** Um script mostrando um agente (em Python/Node) chamando a API da ROTA apenas com um JSON e um token x402 pago previamente, resultando em uma transação complexa no Soroban (sem o agente ter saldo de XLM para gas).
2.  **O "Toll Booth" (x402) Rejeitando Transações Incorretas:** Demonstração da camada de acesso bloqueando requisições sem pagamento ou com XDRs inválidos, provando segurança econômica.
3.  **Policy Engine em Ação (Guardrails):** Tentar fazer o agente executar uma chamada maliciosa (ex: transferir fundos para um contrato não autorizado) e mostrar a ROTA bloqueando off-chain antes de gastar gas, provando o modelo de permissões híbrido.

## 10. Posicionamento Honesto e Premium (Mercado)

*"A ROTA é a camada de interoperabilidade de habilidades (Skill Layer) para a economia de agentes na Stellar. Nós removemos a fricção de integrar SDKs complexos, gerenciar gas e nonces. O desenvolvedor do agente paga pelo acesso via x402, e nós fornecemos abstração de carteira nativa com execução contida por políticas rígidas de segurança (Session Keys). Liquidação atômica garantida por Soroban. Foco em Time-to-Market e segurança, sem overclaims de descentralização mágica."*
