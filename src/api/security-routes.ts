/**
 * Security Control Routes
 * RESTful endpoints for database security management
 */

import { Router, Request, Response } from 'express';
import { Logger } from '../core/logger';
import { RBAC } from '../middleware/rbac';
import { DatabaseSecurityManager } from '../managers/database-security-manager';
import { rbacMiddleware } from '../middleware/rbac';

export function createSecurityRouter(
  logger: Logger,
  rbac: RBAC,
  securityManager: DatabaseSecurityManager
): Router {
  const router = Router();

  router.post('/security/rules', rbacMiddleware('security'), async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const rule = await securityManager.createSecurityRule(userId, req.body);
      res.status(201).json({ success: true, data: rule, stage: 'DRAFT' });
    } catch (error: any) {
      logger.error('Failed to create security rule', { error: error.message });
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/security/rules/:ruleId/preview', rbacMiddleware('security'), async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const { dbConnection } = req.body;
      const rule = await securityManager.previewSecurityRule(userId, req.params.ruleId, dbConnection);
      res.json({
        success: true,
        data: rule,
        stage: 'PREVIEW',
        impact: rule.previewResult,
      });
    } catch (error: any) {
      logger.error('Failed to preview security rule', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/security/rules/:ruleId/approve', rbacMiddleware('security'), async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const { notes } = req.body;
      const rule = await securityManager.approveSecurityRule(userId, req.params.ruleId, notes);
      res.json({
        success: true,
        data: rule,
        stage: 'APPROVED',
        message: `Security rule '${rule.name}' approved. Ready to apply.`,
      });
    } catch (error: any) {
      logger.error('Failed to approve security rule', { error: error.message });
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/security/rules/:ruleId/apply', rbacMiddleware('security'), async (req: Request, res: Response) => {
    try {
      const { userId } = req.user || {};
      const { dbConnection } = req.body;
      const result = await securityManager.applySecurityRule(userId, req.params.ruleId, dbConnection);
      res.json({
        success: true,
        data: result,
        stage: 'APPLIED',
      });
    } catch (error: any) {
      logger.error('Failed to apply security rule', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/security/audit', rbacMiddleware('security'), async (req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const logs = securityManager.getAuditLog(parseInt(limit as string) || 100);
      res.json({ success: true, data: logs, total: logs.length });
    } catch (error: any) {
      logger.error('Failed to get audit log', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default createSecurityRouter;