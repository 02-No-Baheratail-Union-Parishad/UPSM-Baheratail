/**
 * Main API & AI Router
 * Central control logic for all integrations
 */

const express = require('express');
const logger = require('./logger');
const integrationManager = require('../integrations/adapter-manager');

const router = express.Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Integration Status
router.get('/integrations/status', async (req, res) => {
  try {
    const status = await integrationManager.getIntegrationStatus();
    logger.success('Integration status retrieved', status);
    res.json(status);
  } catch (error) {
    logger.error('Failed to retrieve integration status', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// AI Router - Route tasks to appropriate AI provider
router.post('/ai/execute', async (req, res) => {
  const { userId, role, taskType, taskData } = req.body;

  try {
    logger.info('AI task received', { userId, taskType });

    // Route to appropriate AI provider
    const result = await integrationManager.routeAITask(taskType, taskData);
    logger.success('AI task completed', { taskType });

    res.json({ status: 'success', result });
  } catch (error) {
    logger.error('AI task failed', { taskType, error: error.message });
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Database Operation Router
router.post('/database/execute', async (req, res) => {
  const { userId, role, operation, dbName, query } = req.body;

  try {
    logger.info('Database operation requested', { userId, operation, dbName });

    const result = await integrationManager.executeDatabaseOperation(operation, dbName, query);
    logger.auditLog(userId, role, `DATABASE_${operation}`, dbName, 'SUCCESS');

    res.json({ status: 'success', result });
  } catch (error) {
    logger.error('Database operation failed', { dbName, error: error.message });
    logger.auditLog(userId, role, `DATABASE_${operation}`, dbName, 'FAILED', error.message);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

module.exports = router;