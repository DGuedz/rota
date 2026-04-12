import { ExecutionLog } from '@rota/shared-types';

export class StructuredLogger {
  constructor(private agentId: string) {}

  private generateLogId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private createLog(
    level: ExecutionLog['level'], 
    eventId: string, 
    action: string, 
    message: string, 
    metadata: Record<string, any> = {}
  ): ExecutionLog {
    return {
      logId: this.generateLogId(),
      agentId: this.agentId,
      eventId,
      action,
      level,
      message,
      metadata,
      timestamp: new Date().toISOString()
    };
  }

  private emit(log: ExecutionLog) {
    // Para a infraestrutura base, loga no console em formato JSON para fácil parsing pelo Datadog/OpenTelemetry
    console.log(JSON.stringify(log));
  }

  info(eventId: string, action: string, message: string, metadata?: Record<string, any>) {
    this.emit(this.createLog('info', eventId, action, message, metadata));
  }

  warn(eventId: string, action: string, message: string, metadata?: Record<string, any>) {
    this.emit(this.createLog('warn', eventId, action, message, metadata));
  }

  error(eventId: string, action: string, message: string, metadata?: Record<string, any>) {
    this.emit(this.createLog('error', eventId, action, message, metadata));
  }
}
