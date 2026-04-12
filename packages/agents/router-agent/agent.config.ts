export const routerAgentConfig = {
  id: 'rota-router-agent',
  name: 'ROTA Router Agent',
  mission: 'Orchestrar eventos do ecossistema e decidir qual agente especializado recebe cada trabalho.',
  autonomyLevel: 3, // Nível 3: Executa com guardrails
  allowedActions: [
    'receive_event',
    'classify_intent',
    'dispatch_to_agent',
    'log_routing_decision'
  ],
  forbiddenActions: [
    'write_code',
    'publish_content',
    'alter_pricing',
    'modify_smart_contracts',
    'update_state_directly'
  ],
  ownedPaths: [
    // O Router não é dono de nenhuma pasta de código, ele apenas opera a fila de eventos
  ]
};
