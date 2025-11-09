/**
 * Centralized logging utility for LaunchOS
 * Provides structured logging with levels, timestamps, and context
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private isDevelopment = import.meta.env.DEV;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): LogEntry {
    return {
      level,
      timestamp: this.formatTimestamp(),
      message,
      context,
      data,
    };
  }

  private storeLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}]${entry.context ? ` [${entry.context}]` : ''}`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(message, entry.data ?? '');
        }
        break;
      case LogLevel.INFO:
        console.info(message, entry.data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data ?? '');
        break;
      case LogLevel.ERROR:
        console.error(message, entry.data ?? '');
        break;
    }
  }
  debug(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, data);
    this.storeLog(entry);
    this.output(entry);
  }

  info(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, data);
    this.storeLog(entry);
    this.output(entry);
  }

  warn(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, data);
    this.storeLog(entry);
    this.output(entry);
  }

  error(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, data);
    this.storeLog(entry);
    this.output(entry);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();
