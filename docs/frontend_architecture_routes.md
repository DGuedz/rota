# ROTA: Frontend Architecture & Route System

Este documento define a arquitetura da aplicação web da ROTA (a interface que consumirá a API off-chain e interagir com Soroban on-chain). O objetivo é desenhar o sitemap, rotas e seções essenciais, respeitando a estética "Institutional Brutalism" e os princípios VSC Economy-First.

## 1. Audiência e Filosofia Web
O frontend da ROTA atende a dois públicos:
1. **Human Developers/CTOs**: Que precisam registrar seus agentes, obter chaves API, ler documentação e provisionar fundos (XLM/USDC).
2. **Observadores (Auditores/Investidores)**: Que precisam visualizar a prova de liquidação e o volume de tráfego econômico na rede em tempo real.

**Filosofia:** A UI não deve parecer um aplicativo de consumo. Deve parecer um **Terminal Institucional**. Muito espaço em branco, tipografia editorial e ausência de ruído.

---

## 2. Sitemap e Arquitetura de Rotas (Next.js App Router)

Abaixo está a estrutura de rotas proposta para o diretório `apps/web/src/app/`.

### 2.1. `app/page.tsx` — A Landing Page (Posicionamento)
A página inicial que já rascunhamos no HTML. Serve para vender a infraestrutura.
- **Hero Section**: 3D background scroll-driven, CTA principal ("Start Building").
- **Pillars Section**: Cards de features (Discover, Contract, Settle) com micro-assets 3D em loop.
- **Friction vs Solution**: Comparativo brutalista (Sem Emojis) mostrando o antes (SDKs) e depois (ROTA x402).
- **Metrics/Proof**: Números massivos (Skills indexed, volume settled) com background 3D sutil.

### 2.2. `app/network/page.tsx` — The Explorer (Transparência)
Uma visão em tempo real da malha global (A "Block Explorer" para intenções de agentes).
- **Hero**: Mapa de nós 3D abstrato.
- **Live Feed (Terminal)**: Tabela contínua rolando com eventos reais (Intents recebidos, pagamentos x402 aceitos, contratos Soroban criados, liquidações).
- **Node Status**: Lista de agentes "Workers" ativos e suas pontuações de reputação.

### 2.3. `app/registry/page.tsx` — Skill Discovery (O Mercado)
Onde desenvolvedores procuram habilidades para seus próprios agentes consumirem.
- **Filter/Search Bar**: Busca seca e técnica.
- **Skill List**: Tabela com colunas: `Skill Hash`, `Provider`, `Cost (XLM/USDC)`, `Execution Mode (Direct/Escrow)`.
- **Skill Detail Modal**: Ao clicar em uma skill, abre um modal com os schemas de input/output e código de exemplo em curl/TS para o agente consumir.

### 2.4. `app/console/page.tsx` — Developer Dashboard (Gestão)
A área logada (via Web3 Wallet ou GitHub Auth) onde o desenvolvedor gerencia sua operação.
- **Overview**: Gráficos de consumo de API (gastos em x402 vs recebimentos).
- **Agent Registry**: Formulário para registrar um novo agente na ROTA e assinar a identidade.
- **API Keys**: Geração de tokens de acesso vinculados à wallet.
- **Billing/Funding**: Interface para depositar XLM ou USDC em canais de pagamento state-channels ou wallets dedicadas aos agentes.

### 2.5. `app/docs/page.tsx` — Documentation (Integração)
A documentação técnica.
- **Quickstart**: "Como fazer seu agente pagar por uma skill em 3 minutos."
- **x402 Protocol**: Especificação do header HTTP de pagamento.
- **Soroban Contracts**: Endereços dos contratos na Testnet/Mainnet e guias de auditoria.

---

## 3. Dependências Técnicas Propostas (`apps/web/package.json`)

Para construir essa estrutura mantendo a robustez e a estética, a stack recomendada é:

- **Framework**: `Next.js 14+` (App Router) para SSR e SEO otimizado.
- **Styling**: `TailwindCSS` (Configurado estritamente com as cores `ROTA Bone`, `ROTA Black`, `Signal Gold`).
- **Motion & 3D**: `Framer Motion` (apenas para transições de página/fade-ins institucionais) e vídeos `<video>` HTML5 para os assets 3D pesados (como decidido no PRD 3D).
- **Web3 Auth**: `@stellar/freighter-api` e `@stellar/stellar-sdk` para autenticação baseada em chaves ed25519 e assinatura de transações no dashboard.
- **Data Fetching**: `SWR` ou `React Query` para manter o Live Feed do `/network` atualizado em tempo real.
- **Icons**: `lucide-react` (com strokes customizados para 1px para manter o aspecto "technical schematic").

---

## 4. Próximos Passos de Implementação
1. Inicializar o repositório frontend: `npx create-next-app apps/web`.
2. Transportar as configurações do Tailwind e tipografia do `landing_page.html` para o `tailwind.config.ts`.
3. Criar os layouts base (`layout.tsx`) com a Navbar e Footer universais.
4. Implementar as páginas na ordem: `Landing -> Network -> Registry -> Console`.