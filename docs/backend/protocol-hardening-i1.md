# Milestone I — Protocol Hardening

## Overview
As the ROTA protocol evolves from a local proof-of-concept into a production-grade infrastructure for agentic commerce, the in-memory event bus must be upgraded to a robust, persistent message queue. 

**Goal**: Replace the Node.js `EventEmitter` with **BullMQ (Redis)** to ensure zero message loss, controlled retries, and true idempotency.

## 1. The Problem with In-Memory Events
Currently, `RotaEventBus` uses Node's native `EventEmitter`.
- **Volatility**: If the API server crashes, all pending events (e.g., `escrow.settled`, `skill.executed`) are lost forever.
- **Concurrency**: It does not scale horizontally. If we run 3 instances of the API, events emitted on one instance won't reach listeners on another.
- **Retries**: If the `trust-reputation-agent` fails to update the database, the event is lost. There is no dead-letter queue (DLQ).

## 2. BullMQ Architecture
BullMQ will serve as the backbone for the ROTA Agentic Workforce.

### Queues
- **`rota-events`**: The primary queue where domain events are published.
- **`rota-dead-letters`**: For events that exhaust their retry attempts.

### Event Producers
Any module that previously called `eventBus.publish(domainEvent)` will now do:
```typescript
await eventQueue.add('domain_event', domainEvent, {
  jobId: domainEvent.eventId, // Guarantees idempotency
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
});
```

### Event Consumers (Agent Dispatcher)
The `AgentDispatcher` will transition from an event listener to a BullMQ Worker:
```typescript
const worker = new Worker('rota-events', async job => {
  const event = job.data as RotaEvent;
  const routeResult = resolveTrigger(event);
  
  if (routeResult) {
    await this.dispatchToAgent(routeResult.targetAgent, event);
  }
}, { connection: redisConnection });
```

## 3. Idempotency & State
To prevent agents from executing the same event twice (e.g., paying reputation twice for the same escrow settlement), we will enforce idempotency using:
1. `jobId` in BullMQ.
2. `AgentExecutionLog` checks: Before executing, the dispatcher checks if `eventId` + `targetAgent` already exists in `AgentExecutionLog` with status `COMPLETED`.

## 4. Rollout Strategy
1. **Infrastructure**: Ensure Redis is running in the docker-compose stack.
2. **Installation**: `npm install bullmq ioredis`
3. **Refactor Event Bus**: Create a `BullMQEventBus` that implements the same interface as `RotaEventBus`.
4. **Testing**: Run the E2E tests (`test-github-distribution.ts`, `test-trust-reputation.ts`, etc.) against the new bus.
5. **Deployment**: Merge to main.
