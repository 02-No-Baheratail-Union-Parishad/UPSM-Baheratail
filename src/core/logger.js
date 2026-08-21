/**
 * Centralized Logging System
 * No Fake Success! Real errors, real diagnostics.
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatLog(level, message, data = {}) {
    return {
      timestamp: this.getTimestamp(),
      level,
      message,
      data,
      environment: process.env.NODE_ENV || 'development',
    };
  }

  writeLog(level, message, data = {}) {
    const logEntry = this.formatLog(level, message, data);
    const logFile = path.join(this.logDir, `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`);

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    console.log(`[${level}] ${message}`, data);

    return logEntry;
  }

  info(message, data = {}) {
    return this.writeLog('INFO', message, data);
  }

  warn(message, data = {}) {
    return this.writeLog('WARN', message, data);
  }

  error(message, data = {}) {
    return this.writeLog('ERROR', message, data);
  }

  success(message, data = {}) {
    return this.writeLog('SUCCESS', message, data);
  }

  debug(message, data = {}) {
    if (process.env.DEBUG === 'true') {
      return this.writeLog('DEBUG', message, data);
    }
  }

  auditLog(userId, role, action, resource, result, error = null) {
    const auditEntry = {
      timestamp: this.getTimestamp(),
      userId,
      role,
      action,
      resource,
      result,
      error: error || null,
    };

    const auditFile = path.join(this.logDir, `audit-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(auditFile, JSON.stringify(auditEntry) + '\n');

    return auditEntry;
  }
}

module.exports = new Logger();