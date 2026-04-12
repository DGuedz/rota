import { RotaEventBus } from '../apps/api/src/events/event-bus';
import { DomainEventService } from '../apps/api/src/events/domain-event.service';
import { ExecutionLogService } from '../apps/api/src/execution-logs/execution-log.service';
import { AgentDispatcher } from '../apps/api/src/agents/dispatcher';
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

  // Vamos disparar manualmente o evento simulando a inscrição
  // @ts-ignore
  await Promise.all(
    (eventBus as any).subscribers.map((callback: any) => callback(mockEvent))
  );
  
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
  await Promise.all(
    (eventBus as any).subscribers.map((callback: any) => callback(mockPrEvent))
  );

  console.log('\n--- Teste concluído ---');
  process.exit(0);
}

testGitHubDistributionAgent().catch(console.error);
