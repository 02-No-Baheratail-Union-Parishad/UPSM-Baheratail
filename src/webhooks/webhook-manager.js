/**
 * Webhook Manager
 * Handles incoming and outgoing webhooks for event-driven architecture
 */

const logger = require('../core/logger');

class WebhookManager {
  constructor() {
    this.webhooks = new Map();
    this.webhookLogs = [];
  }

  /**
   * Register a webhook
   */
  registerWebhook(webhookId, config) {
    logger.info('Registering webhook', { webhookId, event: config.event });

    const webhook = {
      id: webhookId,
      ...config,
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      deliveryStatus: 'active',
    };

    this.webhooks.set(webhookId, webhook);
    return webhook;
  }

  /**
   * Trigger a webhook (outgoing)
   */
  async triggerWebhook(webhookId, payload) {
    const webhook = this.webhooks.get(webhookId);

    if (!webhook) {
      logger.warn('Webhook not found', { webhookId });
      throw new Error(`Webhook ${webhookId} not found`);
    }

    try {
      logger.info('Triggering webhook', { webhookId, event: webhook.event });

      // Make POST request to webhook URL
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-ID': webhookId,
          'X-Timestamp': new Date().toISOString(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      webhook.lastTriggered = new Date().toISOString();
      logger.success('Webhook triggered successfully', { webhookId });

      this.logDelivery(webhookId, 'success', payload, response.status);
      return { success: true, status: response.status };
    } catch (error) {
      logger.error('Webhook delivery failed', { webhookId, error: error.message });
      this.logDelivery(webhookId, 'failed', payload, null, error.message);
      throw error;
    }
  }

  /**
   * Handle incoming webhook (N8N, Make.com, etc.)
   */
  async handleIncomingWebhook(event, data) {
    logger.info('Incoming webhook received', { event });

    // Route based on event type
    switch (event) {
      case 'application.submitted':
        return await this.handleApplicationSubmitted(data);
      case 'certificate.generated':
        return await this.handleCertificateGenerated(data);
      case 'certificate.approved':
        return await this.handleCertificateApproved(data);
      default:
        logger.warn('Unknown webhook event', { event });
        throw new Error(`Unknown event: ${event}`);
    }
  }

  async handleApplicationSubmitted(data) {
    logger.info('Processing application submitted event', data);
    // TODO: Trigger N8N workflow, update database, notify admins
    return { processed: true };
  }

  async handleCertificateGenerated(data) {
    logger.info('Processing certificate generated event', data);
    // TODO: Store certificate, send notification to applicant
    return { processed: true };
  }

  async handleCertificateApproved(data) {
    logger.info('Processing certificate approved event', data);
    // TODO: Update status, trigger document generation, send email
    return { processed: true };
  }

  /**
   * Log webhook delivery
   */
  logDelivery(webhookId, status, payload, httpStatus, error = null) {
    const log = {
      webhookId,
      status,
      payload,
      httpStatus,
      error,
      timestamp: new Date().toISOString(),
    };

    this.webhookLogs.push(log);
    logger.debug('Webhook delivery logged', log);
  }

  /**
   * Get webhook logs
   */
  getWebhookLogs(webhookId, limit = 50) {
    return this.webhookLogs
      .filter((log) => log.webhookId === webhookId)
      .slice(-limit);
  }
}

module.exports = new WebhookManager();