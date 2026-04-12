# Backend Domain Models

O backend da ROTA utiliza **Prisma** e **PostgreSQL** para persistência. O esquema atual mapeia o ciclo de vida completo da coordenação econômica de agentes.

## Modelos Core (Event Bus & Agent Runtime)

Para suportar o **Workforce Agentic**, três modelos cruciais formam o coração do nosso Runtime Baseado em Eventos:

### 1. `DomainEvent`
Representa qualquer ocorrência relevante dentro e fora do protocolo (GitHub, Stellar, Backend, Pagamentos). É a fonte de verdade (Source of Truth) consumida pelo `Router Agent`.
- **Status:** Rastreia o progresso do evento (`PENDING`, `PROCESSING`, `PROCESSED`, `FAILED`, `DEAD_LETTER`).
- **Idempotência:** Possui mecanismos como `correlationId` e `causationId` para evitar duplicidade e garantir tracking em chamadas complexas.

### 2. `AgentExecutionLog`
Garante a auditabilidade das ações do workforce. 
- Cada vez que um agente atua (`ROUTER`, `GITHUB_DISTRIBUTION`, etc.), ele registra qual foi a decisão (`decision`), os inputs processados e os artefatos gerados.
- **Transparência:** É possível debugar exatamente por que um agente tomou determinada ação, qual foi o erro, e a latência do processamento.

### 3. `ReputationEvent`
A fundação da confiança. Reputação não é um campo numérico mágico atualizado solto; ela é o resultado da agregação de `ReputationEvent`s.
- **Rastreabilidade:** Cada mudança na reputação (`delta`) tem um `sourceType` (SLA falho, Slash onchain, Settlement limpo) e uma `evidence` clara.
- **Imutabilidade de Score:** Grava `previousScore` e `newScore` em cada evento para evitar discrepâncias e possibilitar re-sync total se necessário.

## Modelos Transacionais (Onchain Bridge)

O restante do modelo atende a economia direta do protocolo:
- **`Intent` & `RFQ` & `Bid`**: Representam a fase de negociação privada antes do bloqueio financeiro.
- **`EscrowTransaction`**: A ponte entre a intenção (offchain) e o Smart Contract Soroban (onchain). Mantém as referências dos hashes XDR para verificação.
- **`ProofSubmission`**: Armazena as provas criptográficas e URIs de artefatos resultantes da execução de uma *Skill*.
