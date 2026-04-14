# ROTA 3D Asset Integration Framework

Este documento estabelece o framework e os meta-prompts para a integração de ativos 3D orientados a produto no site da ROTA. O objetivo é garantir que o 3D atue como infraestrutura visual de significado, respeitando a estética de *Institutional Brutalism*, performance e legibilidade.

## 1. O Que a ROTA Precisa Comunicar Visualmente
O 3D na ROTA **não é um gadget** ou showcase de produto físico. Ele deve representar:
- Rotas de valor
- Malha mundial de nodes
- Intenções entre agentes
- Discovery de skills
- Contract escrow
- Settlement onchain
- Tráfego econômico verificável

**Resumo:** O 3D precisa parecer *economic routing infrastructure*.

## 2. Regra Central de UX
Toda animação 3D da ROTA deve obedecer:
- Motion sutil
- Leitura intacta
- Sem competir com a copy
- Sem virar efeito gratuito
- Sem excesso cyberpunk
- Sem degradar performance

## 3. Framework de Uso por Seção

### 1. Hero
- **Melhor uso:** background 3D controlado por scroll (globo / rails / nodes / arcos de liquidação).
- **Implementação:** Texto fixo por cima com gradiente suave. Hero "pinada" até a animação completar.
- **Função Semântica:** Comunicar que a ROTA é uma camada global de coordenação econômica entre agentes.

### 2. Pillars / Features
- **Melhor uso:** vídeos curtos em loop dentro de cards.
- **Implementação:** Um card para Discover, um para Contract, um para Settle, um para Open Repo / CLI Execution.
- **Função:** Transformar conceitos abstratos em metáforas visuais controladas.

### 3. Metrics / Proof
- **Melhor uso:** fundo animado quase estático.
- **Implementação:** Linhas de tráfego, pulsos discretos, ledger glow.
- **Função:** Reforçar prova pública sem roubar atenção dos números.

---

## 4. Prompts de Geração e Integração

### Meta-Prompt Mestre (Para qualquer asset 3D)
Use este prompt-base em ferramentas como Antigravity ou para desenvolvedores frontend:
> "Integrate the uploaded 3D asset into the ROTA website as a native interface element, preserving the existing layout, hierarchy, readability, and institutional brutalist aesthetic. This asset must not feel decorative. It must reinforce ROTA’s core product meaning: routing, discovery, contract formation, escrow, settlement, and machine-to-machine economic coordination. Choose the best implementation mode based on section context: background, card media, or embedded visual component. Maintain soft motion, premium pacing, strong text legibility, and minimal visual noise. If used in the hero section, place the asset as a background layer with a subtle gradient overlay so all text remains perfectly readable. If scroll-driven behavior improves the section, pin the section while the animation progresses, then release normal page scroll after completion. If continuous playback is better, keep it muted, seamless, and looped with no visible controls. If the video stutters during scroll-scrubbing, re-encode it with FFmpeg so every frame is a keyframe for smooth playback. Preserve performance, avoid excessive particles, avoid cyberpunk exaggeration, avoid distracting motion, and keep the result aligned with a high-credibility onchain infrastructure product."

### Prompt Específico: Hero Oficial da ROTA
> "Quero que este vídeo 3D seja usado como background da Hero Section do site da ROTA, não como um elemento isolado. A animação deve representar visualmente a malha mundial de nodes agenticos, rotas econômicas, discovery de skills, negociação entre agentes e settlement onchain. O texto da hero deve permanecer acima da animação com total legibilidade, apoiado por um gradiente sutil e institucional. A seção hero deve ficar travada enquanto a animação avança com o scroll; ao rolar para baixo, o vídeo progride, e ao rolar para cima, ele retorna. Quando a animação terminar, a página volta a rolar normalmente. O movimento deve ser suave, premium e controlado, sem exagero visual. Não alterar tipografia, spacing, composição nem identidade do site. O vídeo deve ficar mudo, sem controles visíveis e integrado nativamente ao layout. Se houver travamento durante o scroll, reencode com FFmpeg para que cada frame seja um keyframe e a rolagem fique perfeitamente suave."

### Prompts por Conceito Visual

**A. Global Agent Mesh**
> "Use this 3D asset to represent a global mesh of autonomous economic nodes connected through settlement routes. The motion should suggest active but controlled machine coordination across regions, with subtle route pulses and institutional-grade pacing."

**B. Economic Rails**
> "Use this asset as a visual metaphor for programmable rails where agents route value, contract services, and settle execution. Keep the animation elegant, minimal, and infrastructure-like, not sci-fi."

**C. Skill Discovery Network**
> "Use this asset to suggest a discoverable network of capabilities, where agent skills are indexed, located, and routed into economic flows. Motion should feel structured, precise, and searchable."

**D. Contract and Escrow Layer**
> "Use this asset to visualize trust formation between agents: intent, agreement, escrow, release, and final settlement. The visual language should imply controlled release and auditability."

---

## 5. Regra Prática de Decisão

Use:
- **scroll-driven** quando o ativo conta uma história progressiva.
- **loop contínuo** quando o ativo só reforça atmosfera e contexto.
- **card video** quando a função é explicar um bloco do produto.
- **hero background** quando a função é posicionamento de marca e infraestrutura.

O erro seria usar 3D como enfeite. O acerto é usar 3D como **interface semântica do protocolo**.
