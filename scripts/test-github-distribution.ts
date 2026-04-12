import { RotaEventBus } from '../apps/api/src/events/event-bus.js';
import { DomainEventService } from '../apps/api/src/events/domain-event.service.js';
import { ExecutionLogService } from '../apps/api/src/execution-logs/execution-log.service.js';
import { AgentDispatcher } from '../apps/api/src/agents/dispatcher.js';
import { PrismaClient } from '@prisma/client';

async function testGitHubDistributionAgent() {
  console.log('--- Iniciando Teste do GitHub Distribution Agent ---');
  
  // 1. Inicializa os componentes
  const prisma = new PrismaClient();
  const domainEventService = new DomainEventService(prisma);
  const eventBus = new RotaEventBus(domainEventService);
  const logService = new ExecutionLogService(prisma);
  const dispatcher = new AgentDispatcher(eventBus, logService);
  
  // 2. Inicia o Dispatcher
  dispatcher.start();
  
  console.log('\nSimulando evento: repo.push_main (Atualização na main)');
  
  // 3. Simula um evento de push na main
  const mockEvent: any = {
    eventId: `evt_${Date.now()}`,
    source: 'github',
    type: 'repo.push_main',
    payload: {
      commitSha: 'a1b2c3d4e5f6',
      message: 'feat: update README'
    },
    receivedAt: new Date(),
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // @ts-ignore
  eventBus.emitter.emit('rota_event', mockEvent);
  
  console.log('\nSimulando evento: repo.pr_merged (PR Merged)');
  
  const mockPrEvent: any = {
    eventId: `evt_${Date.now() + 1}`,
    source: 'github',
    type: 'repo.pr_merged',
    payload: {
      title: 'feat: add x402 payment support',
      url: 'https://github.com/rota/pull/42'
    },
    receivedAt: new Date(),
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // @ts-ignore
  eventBus.emitter.emit('rota_event', mockPrEvent);

  console.log('\nSimulando evento: repo.release_draft (Release Draft Created)');
  
  const mockReleaseEvent: any = {
    eventId: `evt_${Date.now() + 2}`,
    source: 'github',
    type: 'repo.release_draft',
    payload: {
      tag: 'v0.1.0',
      name: 'Foundation Release'
    },
    receivedAt: new Date(),
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // @ts-ignore
  eventBus.emitter.emit('rota_event', mockReleaseEvent);

  console.log('\nSimulando evento: repo.skill_updated (Skill Package Validation)');
  
  const mockSkillEvent: any = {
    eventId: `evt_${Date.now() + 3}`,
    source: 'github',
    type: 'repo.skill_updated',
    payload: {
      skillId: 'wallet-risk-check',
      metadata: {
        description: 'Verifica o risco de uma carteira',
        commandExample: 'rota exec wallet-risk-check <address>',
        pricing: {
          tier: 'PAID_PER_EXECUTION',
          amount: '0.01',
          asset: 'USDC'
        }
      }
    },
    receivedAt: new Date(),
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // @ts-ignore
  eventBus.emitter.emit('rota_event', mockSkillEvent);

  console.log('\nSimulando evento: repo.docs_changed (Docs Sync Report)');
  
  const mockDocsEvent: any = {
    eventId: `evt_${Date.now() + 4}`,
    source: 'github',
    type: 'repo.docs_changed',
    payload: {
      commitSha: 'a1b2c3d4e5f6',
      message: 'docs: update architecture'
    },
    receivedAt: new Date(),
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // @ts-ignore
  eventBus.emitter.emit('rota_event', mockDocsEvent);

  // Dar tempo para os handlers assíncronos terminarem
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n--- Teste concluído ---');
  process.exit(0);
}

testGitHubDistributionAgent().catch(console.error);
