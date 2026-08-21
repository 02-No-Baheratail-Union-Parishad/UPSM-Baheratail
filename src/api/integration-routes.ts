/**
 * Integration Center Controller
 * RESTful endpoints for managing all integrations
 */

import { Router, Request, Response } from 'express';
import { Logger } from '../core/logger';
import { RBAC } from '../middleware/rbac';
import { APIManager } from './api-manager';
import { DatabaseManager } from './database-manager';
import { rbacMiddleware } from '../middleware/rbac';

export function createIntegrationRouter(
  logger: Logger,
  rbac: RBAC,
  apiManager: APIManager,
  dbManager: DatabaseManager
): Router {
  const router = Router();

  // ========== API Management ==========

  // Create API
  router.post('/api', rbacMiddleware('manage_apis'), async (req: Request, res: Response) => {
    try {
      const { userId, role } = req.user || {};
      const api = await apiManager.createAPI(userId, req.body);
      res.status(201).json({ success: true, data: api });
    } catch (error: any) {
      logger.error('Failed to create API', { error: error.message });
      res.status(400).json({ error: error.message });
    }
  });

  // List APIs
  router.get('/api', async (req: Request, res: Response) => {
    try {
      const apis = apiManager.listAPIs();
      res.json({ success: true, data: apis });
    } catch (error: any) {
      logger.error('Failed to list APIs', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Get API
  router.get('/api/:apiId', async (req: Request, res: Response) => {
    try {
      const api = apiManager.getAPI(req.params.apiId);
      if (!api) {
        return res.status(404).json({ error: 'API not found' });
      }
      res.json({ success: true, data: api });
    } catch (error: any) {
      logger.error('Failed to get API', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Test API Connection
  router.post('/api/:apiId/test', rbacMiddleware('manage_apis'), async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const result = await apiManager.testConnection(userId, req.params.apiId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Failed to test API connection', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Execute API Request
  router.post('/api/:apiId/request', async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const result = await apiManager.executeRequest(userId, req.params.apiId, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Failed to execute API request', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Get API Request Logs
  router.get('/api/:apiId/logs', rbacMiddleware('manage_apis'), async (req: Request, res: Response) => {
    try {
      const logs = apiManager.getRequestLogs(req.params.apiId, parseInt(req.query.limit as string) || 50);
      res.json({ success: true, data: logs });
    } catch (error: any) {
      logger.error('Failed to get API logs', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Update API
  router.put('/api/:apiId', rbacMiddleware('manage_apis'), async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const api = await apiManager.updateAPI(userId, req.params.apiId, req.body);
      res.json({ success: true, data: api });
    } catch (error: any) {
      logger.error('Failed to update API', { error: error.message });
      res.status(400).json({ error: error.message });
    }
  });

  // Delete API
  router.delete('/api/:apiId', rbacMiddleware('manage_apis'), async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const result = await apiManager.deleteAPI(userId, req.params.apiId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Failed to delete API', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Database Management ==========

  // Create Database Connection
  router.post('/database', rbacMiddleware('manage_database'), async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const conn = await dbManager.createConnection(userId, req.body);
      res.status(201).json({ success: true, data: conn });
    } catch (error: any) {
      logger.error('Failed to create database connection', { error: error.message });
      res.status(400).json({ error: error.message });
    }
  });

  // List Database Connections
  router.get('/database', async (req: Request, res: Response) => {
    try {
      const conns = dbManager.listConnections();
      res.json({ success: true, data: conns });
    } catch (error: any) {
      logger.error('Failed to list database connections', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Test Database Connection
  router.post('/database/:connId/test', rbacMiddleware('manage_database'), async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const result = await dbManager.testConnection(userId, req.params.connId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Failed to test database connection', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Execute Query
  router.post('/database/:connId/query', rbacMiddleware('database_read'), async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const { query, params } = req.body;
      const result = await dbManager.executeQuery(userId, req.params.connId, query, params);
      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Failed to execute query', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // Get Database Query Logs
  router.get('/database/:connId/logs', rbacMiddleware('manage_database'), async (req: Request, res: Response) => {
    try {
      const logs = dbManager.getQueryLogs(req.params.connId, parseInt(req.query.limit as string) || 50);
      res.json({ success: true, data: logs });
    } catch (error: any) {
      logger.error('Failed to get query logs', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // ========== Health Check ==========

  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      modules: {
        api: 'ready',
        database: 'ready',
      },
    });
  });

  return router;
}

export default createIntegrationRouter;
