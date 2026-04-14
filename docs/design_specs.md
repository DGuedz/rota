# ROTA: Design & Asset Specifications

Este documento contém os briefings de imagem e as diretrizes de UI para a construção visual da ROTA, gerados automaticamente pela skill `a2ab-design-intelligence` sob as regras estritas do protocolo VSC (Economy-First, Zero-Emoji, Cyber-Finance).

---

## 1. Image Briefings (Para Midjourney / DALL-E)

Utilize os prompts abaixo para gerar os assets visuais do site institucional.

### Asset 1: Hero Section Background (A Rede Global)
`[IMAGE BRIEFING]`
`STYLE`: Cyber-finance, dark mode, high contrast, clean vector style, isometric perspective.
`SUBJECT`: Abstract representation of an autonomous agent network routing transactions. Glowing nodes connected by data streams. A central hub representing the "escrow settlement" layer with geometric, cryptographic locks.
`CONSTRAINTS`: NO robots, NO emojis, NO magic-AI glowing brains. NO human faces. Focus purely on value flow, nodes, escrow mechanisms, and trustless settlement visualization. Deep blacks (bg-gray-900) with emerald green and stark white accents.

### Asset 2: Arquitetura Híbrida (Off-chain vs On-chain)
`[IMAGE BRIEFING]`
`STYLE`: Brutalist data-driven layout, technical blueprint, dark mode, high contrast.
`SUBJECT`: A split architecture diagram. The left side represents off-chain high-speed routing (Fastify/BullMQ) with dynamic, fast-moving data lines. The right side represents on-chain trust and settlement (Soroban/Stellar) with solid, immutable, locked blocks. A glowing cryptographic bridge connects the two sides.
`CONSTRAINTS`: NO robots, NO emojis, NO cartoonish elements. Must look like a professional, enterprise-grade infrastructure diagram designed for CTOs.

### Asset 3: x402 Payment Gateway (Fricção vs Resolução)
`[IMAGE BRIEFING]`
`STYLE`: Minimalist cyber-security visualization, dark mode.
`SUBJECT`: A digital gateway or firewall. On one side, data packets (agent requests) are halted. In the center, a cryptographic token (representing x402 payment) acts as a key that opens the gate, allowing the packets to flow through to a secure execution zone.
`CONSTRAINTS`: NO robots, NO emojis, NO coins or literal money bags. Use abstract representations of cryptography, access control, and data packets.

---

## 2. UI Wireframe Spec (Landing Page B2B)

Diretrizes estruturais para a implementação da Landing Page no frontend (Next.js/TailwindCSS).

`[UI WIREFRAME SPEC]`
`SECTION`: Global Layout
`STYLE`: Minimalist, brutalist data-driven layout. Technical and dry.
`COLORS`: 
- Background: Deep blacks (`bg-gray-950` to `bg-black`).
- Typography: Stark whites (`text-gray-50` para headings, `text-gray-400` para corpo).
- Accents/Success: Technical green (`text-emerald-500`, `border-emerald-500`).
`CONTENT`: Must include technical proof (txHash, Soroban contract IDs). Zero fluff. Sem emojis.

### Estrutura de Blocos:
1. **Nav**: Logo limpo, links para "Docs", "GitHub", "Smart Contracts". CTA secundário "View on Testnet".
2. **Hero**: Headline brutalista. Subheadline focado em "Settle value with cryptographic proof". CTA primário: `Execute x402`. Fundo com o Asset 1.
3. **The Friction**: Grid 2x2. Comparativo "Traditional Web3 Agent" vs "ROTA Protocol". Foco na eliminação de gestão de nonces e SDKs pesados.
4. **Hybrid Trust**: Imagem do Asset 2. Texto focado na separação de responsabilidades (Speed vs Trust).
5. **Live Proof (Terminal)**: Bloco com visual de terminal (`bg-black`, fonte monoespaçada) mostrando logs reais de uma execução x402 bem sucedida, finalizando com um `txHash` clicável.

---

## 3. Video Script Structure (Pitch Institucional)

Estrutura aprovada para o vídeo de demonstração técnica / hackathon pitch.

`[VIDEO SCRIPT STRUCTURE]`
`TOPIC`: ROTA 3-Minute Dev Walk-Through
1. **Technical Hook (0:00-0:15)**: A dor da confiança. "Se você já tentou deixar um agente possuir uma transação, conhece o inferno dos SDKs e nonces."
2. **The Solution (0:15-0:45)**: A rota mais curta. Gateway HTTP 402 + executor off-chain + liquidação Soroban.
3. **Live Demo (0:45-1:45)**: Tela dividida. Terminal rodando o agente (mostrando o 402 rejection, seguido do pagamento) vs Explorer da Stellar testnet mostrando a transação confirmada.
4. **Architecture (1:45-2:30)**: Explicação das session keys efêmeras e do policy engine. "O agente nunca vê a chave; o gas fica conosco."
5. **CTA (2:30-3:00)**: Fechamento B2B. "Entregamos time-to-market para a economia de agentes. Execute x402."
