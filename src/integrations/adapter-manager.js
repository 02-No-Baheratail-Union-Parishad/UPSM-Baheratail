/**
 * Integration Manager
 * Central hub for all modular adapters
 */

const logger = require('../core/logger');
const firebaseAdapter = require('./firebase/adapter');
const jokeAdapter = require('./external-api/joke-generator');

class AdapterManager {
  constructor() {
    this.adapters = {
      firebase: firebaseAdapter,
      jokes: jokeAdapter,
    };
  }

  /**
   * Get status of all integrations
   */
  async getIntegrationStatus() {
    const status = {};

    for (const [name, adapter] of Object.entries(this.adapters)) {
      try {
        if (adapter.testConnection) {
          status[name] = await adapter.testConnection();
        } else {
          status[name] = { connected: true, type: 'adapter' };
        }
      } catch (error) {
        status[name] = { connected: false, error: error.message };
        logger.warn(`Integration ${name} test failed`, { error: error.message });
      }
    }

    return status;
  }

  /**
   * Route AI tasks to appropriate provider
   */
  async routeAITask(taskType, taskData) {
    logger.debug('Routing AI task', { taskType });

    switch (taskType) {
      case 'generate_joke':
        return await jokeAdapter.generateJoke();

      case 'certificate_generation':
        // Future: Route to Gemini API
        throw new Error('Certificate generation not yet implemented');

      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  /**
   * Execute database operations
   */
  async executeDatabaseOperation(operation, dbName, query) {
    logger.debug('Executing database operation', { operation, dbName });

    if (dbName === 'firebase') {
      return await firebaseAdapter.execute(operation, query);
    }

    throw new Error(`Unsupported database: ${dbName}`);
  }

  /**
   * Secure database update with Human-in-the-Loop
   */
  async secureUpdate(userId, data, role) {
    logger.info('Secure update initiated', { userId, role });

    // Step 1: Check Permissions (RBAC)
    if (!['Admin', 'SuperAdmin'].includes(role)) {
      logger.warn('PERMISSION_DENIED: Unauthorized access attempt', { userId, role });
      throw new Error('PERMISSION_DENIED: Unauthorized access attempt logged.');
    }

    // Step 2: Human-in-the-Loop for sensitive edits
    const isApproved = await this.requestHumanApproval(userId, 'Database Edit');
    if (!isApproved) {
      return { status: 'PENDING', message: 'Awaiting authorized human approval.' };
    }

    // Step 3: Perform Actual Operation (No Fake Success!)
    try {
      const result = await firebaseAdapter.updateRecord(data);
      logger.success('Secure update completed', { userId });
      return { status: 'SUCCESS', data: result };
    } catch (error) {
      logger.error(`Update Failed: ${error.message}`, { userId });
      return { status: 'ERROR', error: error.message, fix: 'Check Firebase API quota and security rules.' };
    }
  }

  /**
   * Cloud AI to Local Server Communication Bridge
   */
  async callLocalAI(taskData) {
    logger.info('Routing task to local server via secure tunnel...');
    try {
      // Uses Auto-Tunneling (Ngrok/Cloudflare) to hit the local UP server
      const response = await this.executeTask(taskData);
      logger.success('Local AI task executed');
      return response;
    } catch (error) {
      logger.warn('Local AI unavailable. Routing to Cloud Fallback', { error: error.message });
      // Fallback logic if tunnel or local AI is down
      throw error; // Or route to Gemini
    }
  }

  /**
   * Request human approval for sensitive operations
   */
  async requestHumanApproval(userId, action) {
    logger.info('Human approval requested', { userId, action });
    // Implementation for prompting an Admin via Dashboard/Webhook
    // This is a placeholder for the actual approval notification system
    return false; // Default to false to ensure safety
  }
}

module.exports = new AdapterManager();