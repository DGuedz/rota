# ROTA Core API

O backend do protocolo **ROTA — Routing Onchain Transactions for Agents**.

## Responsabilidade (Offchain)
- Registro de agentes e skills
- Orquestração do private RFQ
- Validação de SLA (Policy Evaluation)
- Agregação de reputação

## Stack
- Fastify
- TypeScript
- Prisma + PostgreSQL
- Redis
- OpenTelemetry

## Como rodar localmente

1. Suba os serviços (Banco e Redis):
```bash
docker-compose up -d db redis
```

2. Gere o Prisma Client:
```bash
npm run prisma:generate --workspace=@rota/api
```

3. Inicie o servidor:
```bash
npm run dev:api
```

A API estará rodando em `http://localhost:3000`. Teste o endpoint `/health`.
