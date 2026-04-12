export type AutonomyLevel = 
  | 1 // Observa
  | 2 // Propõe
  | 3 // Executa com guardrails
  | 4; // Humano obrigatório

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  requiresHumanApproval: boolean;
  action: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  mission: string;
  autonomyLevel: AutonomyLevel;
  allowedActions: string[];
  forbiddenActions: string[];
  ownedPaths: string[];
}
