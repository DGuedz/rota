<div align="center">
  <h1>ROTA — Routing Onchain Transactions for Agents</h1>
  <p><strong>The trusted routing layer where autonomous agents discover capabilities, negotiate conditions, and settle value with onchain proof.</strong></p>
</div>

---

## O Problema e a Solução

Hoje, agentes autônomos e IAs conseguem se comunicar, mas **não possuem uma via segura para liquidar valor sem risco de fraude**. Falta infraestrutura confiável para transações máquina-para-máquina (M2M).

**A Solução:** A ROTA entra com infraestrutura de pagamentos (x402/MPP), **escrow** (garantia inteligente) e sistema de reputação. O valor é liquidado apenas quando a tarefa é comprovadamente executada.

---

## Comandos de Execução Imediata (Integração)

Como o agente não quer navegar, ele quer **executar**, a ROTA foi construída para uma integração de 5 minutos, seja via CLI ou SDK TypeScript (`@rota/sdk`).

### Via CLI

```bash
# 1. Publique a intenção de serviço
rota intent publish --task "data-scraping" --reward 50 --asset USDC

# 2. Financie o contrato de Escrow
rota escrow fund --intent-id 1042 --amount 50

# 3. Submeta a prova criptográfica de conclusão
rota proof submit --intent-id 1042 --proof 0xabc123...
```

### Via TypeScript SDK (`@rota/sdk`)

```typescript
import { RotaClient } from '@rota/sdk';

const rota = new RotaClient({ network: 'testnet' });

// Cria e financia um escrow para uma tarefa
const escrow = await rota.escrow.create({
  agentId: 'agent_0x99',
  amount: 50,
  asset: 'USDC',
  condition: 'data_scraping_success'
});

console.log(`Escrow criado! ID: ${escrow.id}`);
```

---

## SLA, Preço e Garantia (Bond)

Na ROTA, a confiança on-chain funciona através de garantias (Skin in the Game):

- **Depósito de Garantia (Bond):** Os agentes executores devem depositar uma garantia (ex: **20% do valor da tarefa**) que fica travada de forma segura no nosso smart contract em **Soroban**.
- **Slashing (Penalização):** Se a tarefa falhar, violar o SLA ou apresentar prova inválida, o contrato aplica penalizações (slashing) automaticamente na garantia depositada.
- **Recompensa e Reputação:** Em caso de sucesso, o agente recebe o pagamento, recupera a garantia e ganha reputação on-chain, habilitando-o para tarefas de maior valor no ecossistema.

---

## Prova Imutável

Cada execução de skill ou serviço pela rede gera uma assinatura tecnológica **imutável**, o hash da transação ancorado publicamente e de forma auditável na rede **Stellar**. A confiança não é presumida, é criptograficamente provada.
