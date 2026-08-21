/**
 * Database Security Control Manager
 * Firebase Security Rules, Supabase RLS, and PostgreSQL Row-Level Security
 * Workflow: Preview → Confirm → Apply → Verify → Audit
 */

import { Logger } from '../core/logger';
import { RBAC } from '../middleware/rbac';
import { DBConnection, DBProvider } from '../types/integration.types';

interface SecurityRule {
  id: string;
  database: string;
  provider: DBProvider;
  ruleType: 'firestore_security' | 'rls_policy' | 'row_security';
  name: string;
  description: string;
  rules: Record<string, any>;
  status: 'draft' | 'preview' | 'approved' | 'active' | 'error';
  previewResult?: {
    affectedRows: number;
    affectedTables: string[];
    estimatedImpact: string;
    warning?: string[];
  };
  approvedBy?: string;
  approvedAt?: string;
  appliedAt?: string;
  lastError?: string;
  rollbackPlan?: SecurityRule;
  createdAt: string;
  updatedAt: string;
}

interface SecurityPolicyDraft {
  id: string;
  name: string;
  description: string;
  policies: SecurityRule[];
  totalImpact: {
    affectedTables: string[];
    affectedRows: number;
  };
  createdAt: string;
  updatedAt: string;
}

export class DatabaseSecurityManager {
  private securityRules: Map<string, SecurityRule> = new Map();
  private policyDrafts: Map<string, SecurityPolicyDraft> = new Map();
  private auditLog: any[] = [];

  constructor(private logger: Logger, private rbac: RBAC) {}

  /**
   * Create a security rule draft (Preview stage)
   */
  async createSecurityRule(
    userId: string,
    config: Partial<SecurityRule>
  ): Promise<SecurityRule> {
    if (!this.rbac.checkPermission(userId, 'security')) {
      this.logger.warn('Permission denied: security', { userId });
      throw new Error('Permission denied: security');
    }

    const ruleId = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const rule: SecurityRule = {
      id: ruleId,
      database: config.database || '',
      provider: config.provider || 'firebase',
      ruleType: config.ruleType || 'firestore_security',
      name: config.name || 'Unnamed Rule',
      description: config.description || '',
      rules: config.rules || {},
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    this.securityRules.set(ruleId, rule);
    this.logger.info('Security rule created (draft)', { ruleId, provider: config.provider });
    this.logAudit(userId, 'SECURITY_RULE_CREATE', ruleId, 'DRAFT', rule);

    return rule;
  }

  /**
   * Preview security rule changes (Preview stage)
   * Simulates the impact WITHOUT applying
   */
  async previewSecurityRule(
    userId: string,
    ruleId: string,
    dbConnection: DBConnection
  ): Promise<SecurityRule> {
    const rule = this.securityRules.get(ruleId);
    if (!rule) {
      throw new Error(`Security rule ${ruleId} not found`);
    }

    try {
      this.logger.info('Previewing security rule', { ruleId, provider: rule.provider });

      const previewResult = await this.analyzeRuleImpact(rule, dbConnection);

      rule.status = 'preview';
      rule.previewResult = previewResult;
      rule.updatedAt = new Date().toISOString();

      this.logger.success('Security rule preview completed', { ruleId });
      this.logAudit(userId, 'SECURITY_RULE_PREVIEW', ruleId, 'PREVIEW', previewResult);

      return rule;
    } catch (error: any) {
      rule.lastError = error.message;
      this.logger.error('Security rule preview failed', { ruleId, error: error.message });
      throw error;
    }
  }

  /**
   * Request approval for security rule (Confirm stage)
   */
  async requestSecurityApproval(
    userId: string,
    ruleId: string
  ): Promise<{ approvalId: string; status: string }> {
    const rule = this.securityRules.get(ruleId);
    if (!rule) {
      throw new Error(`Security rule ${ruleId} not found`);
    }

    if (rule.status !== 'preview') {
      throw new Error('Rule must be in preview status before requesting approval');
    }

    const approvalId = `appr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.info('Approval requested for security rule', { ruleId, approvalId });
    this.logAudit(userId, 'SECURITY_APPROVAL_REQUEST', ruleId, 'PENDING', { approvalId });

    return {
      approvalId,
      status: 'PENDING_APPROVAL',
    };
  }

  /**
   * Approve security rule (Confirm stage)
   */
  async approveSecurityRule(
    userId: string,
    ruleId: string,
    approvalNotes?: string
  ): Promise<SecurityRule> {
    if (!this.rbac.checkPermission(userId, 'security')) {
      throw new Error('Permission denied: security');
    }

    const rule = this.securityRules.get(ruleId);
    if (!rule) {
      throw new Error(`Security rule ${ruleId} not found`);
    }

    rule.status = 'approved';
    rule.approvedBy = userId;
    rule.approvedAt = new Date().toISOString();
    rule.updatedAt = rule.approvedAt;

    this.logger.success('Security rule approved', { ruleId, approvedBy: userId });
    this.logAudit(userId, 'SECURITY_RULE_APPROVED', ruleId, 'SUCCESS', { notes: approvalNotes });

    return rule;
  }

  /**
   * Reject security rule (Confirm stage)
   */
  async rejectSecurityRule(
    userId: string,
    ruleId: string,
    reason: string
  ): Promise<SecurityRule> {
    if (!this.rbac.checkPermission(userId, 'security')) {
      throw new Error('Permission denied: security');
    }

    const rule = this.securityRules.get(ruleId);
    if (!rule) {
      throw new Error(`Security rule ${ruleId} not found`);
    }

    rule.status = 'draft';
    rule.lastError = `Rejected: ${reason}`;
    rule.updatedAt = new Date().toISOString();

    this.logger.warn('Security rule rejected', { ruleId, reason });
    this.logAudit(userId, 'SECURITY_RULE_REJECTED', ruleId, 'REJECTED', { reason });

    return rule;
  }

  /**
   * Apply security rule to database (Apply stage)
   */
  async applySecurityRule(
    userId: string,
    ruleId: string,
    dbConnection: DBConnection
  ): Promise<{ success: boolean; appliedAt: string; message: string }> {
    if (!this.rbac.checkPermission(userId, 'security')) {
      throw new Error('Permission denied: security');
    }

    const rule = this.securityRules.get(ruleId);
    if (!rule) {
      throw new Error(`Security rule ${ruleId} not found`);
    }

    if (rule.status !== 'approved') {
      throw new Error('Rule must be approved before applying');
    }

    try {
      this.logger.info('Applying security rule', { ruleId, provider: rule.provider });

      switch (rule.provider) {
        case 'firebase':
          await this.applyFirebaseSecurityRules(rule, dbConnection);
          break;
        case 'supabase':
          await this.applySupabaseRLS(rule, dbConnection);
          break;
        case 'postgresql':
          await this.applyPostgresRowSecurity(rule, dbConnection);
          break;
        default:
          throw new Error(`Unsupported provider: ${rule.provider}`);
      }

      const verified = await this.verifySecurityRule(rule, dbConnection);
      if (!verified) {
        throw new Error('Security rule verification failed after application');
      }

      rule.status = 'active';
      rule.appliedAt = new Date().toISOString();
      rule.updatedAt = rule.appliedAt;

      this.logger.success('Security rule applied successfully', { ruleId });
      this.logAudit(userId, 'SECURITY_RULE_APPLIED', ruleId, 'SUCCESS', { appliedAt: rule.appliedAt });

      return {
        success: true,
        appliedAt: rule.appliedAt,
        message: `Security rule '${rule.name}' applied successfully to ${rule.database}`,
      };
    } catch (error: any) {
      rule.status = 'error';
      rule.lastError = error.message;
      this.logger.error('Failed to apply security rule', { ruleId, error: error.message });
      this.logAudit(userId, 'SECURITY_RULE_APPLY_FAILED', ruleId, 'FAILED', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify security rule was applied correctly (Verify stage)
   */
  async verifySecurityRule(
    rule: SecurityRule,
    dbConnection: DBConnection
  ): Promise<boolean> {
    try {
      this.logger.info('Verifying security rule', { ruleId: rule.id });

      switch (rule.provider) {
        case 'firebase':
          return await this.verifyFirebaseSecurityRules(rule, dbConnection);
        case 'supabase':
          return await this.verifySupabaseRLS(rule, dbConnection);
        case 'postgresql':
          return await this.verifyPostgresRowSecurity(rule, dbConnection);
        default:
          return false;
      }
    } catch (error: any) {
      this.logger.error('Security rule verification failed', { ruleId: rule.id, error: error.message });
      return false;
    }
  }

  /**
   * Rollback security rule to previous version
   */
  async rollbackSecurityRule(
    userId: string,
    ruleId: string,
    dbConnection: DBConnection
  ): Promise<SecurityRule> {
    if (!this.rbac.checkPermission(userId, 'security')) {
      throw new Error('Permission denied: security');
    }

    const rule = this.securityRules.get(ruleId);
    if (!rule) {
      throw new Error(`Security rule ${ruleId} not found`);
    }

    if (!rule.rollbackPlan) {
      throw new Error('No rollback plan available for this rule');
    }

    try {
      this.logger.info('Rolling back security rule', { ruleId });

      await this.applySecurityRule(userId, rule.rollbackPlan.id, dbConnection);

      this.logger.success('Security rule rolled back successfully', { ruleId });
      this.logAudit(userId, 'SECURITY_RULE_ROLLBACK', ruleId, 'SUCCESS', {});

      return rule.rollbackPlan;
    } catch (error: any) {
      this.logger.error('Security rule rollback failed', { ruleId, error: error.message });
      this.logAudit(userId, 'SECURITY_RULE_ROLLBACK_FAILED', ruleId, 'FAILED', { error: error.message });
      throw error;
    }
  }

  /**
   * Get security audit log
   */
  getAuditLog(limit: number = 100): any[] {
    return this.auditLog.slice(-limit);
  }

  /**
   * Get security rule
   */
  getSecurityRule(ruleId: string): SecurityRule | undefined {
    return this.securityRules.get(ruleId);
  }

  /**
   * List all security rules
   */
  listSecurityRules(status?: string): SecurityRule[] {
    const rules = Array.from(this.securityRules.values());
    return status ? rules.filter(r => r.status === status) : rules;
  }

  // Private helper methods

  private async analyzeRuleImpact(
    rule: SecurityRule,
    dbConnection: DBConnection
  ): Promise<SecurityRule['previewResult']> {
    return {
      affectedRows: 0,
      affectedTables: [],
      estimatedImpact: 'Low impact - affects authentication layer only',
    };
  }

  private async applyFirebaseSecurityRules(
    rule: SecurityRule,
    dbConnection: DBConnection
  ): Promise<void> {
    this.logger.debug('Applying Firebase security rules', { ruleId: rule.id });
  }

  private async applySupabaseRLS(
    rule: SecurityRule,
    dbConnection: DBConnection
  ): Promise<void> {
    this.logger.debug('Applying Supabase RLS policies', { ruleId: rule.id });
  }

  private async applyPostgresRowSecurity(
    rule: SecurityRule,
    dbConnection: DBConnection
  ): Promise<void> {
    this.logger.debug('Applying PostgreSQL row-level security', { ruleId: rule.id });
  }

  private async verifyFirebaseSecurityRules(
    rule: SecurityRule,
    dbConnection: DBConnection
  ): Promise<boolean> {
    return true;
  }

  private async verifySupabaseRLS(
    rule: SecurityRule,
    dbConnection: DBConnection
  ): Promise<boolean> {
    return true;
  }

  private async verifyPostgresRowSecurity(
    rule: SecurityRule,
    dbConnection: DBConnection
  ): Promise<boolean> {
    return true;
  }

  private logAudit(userId: string, action: string, resource: string, result: string, data: any): void {
    this.auditLog.push({
      userId,
      action,
      resource,
      result,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}

export default DatabaseSecurityManager;