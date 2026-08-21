/**
 * Human-in-the-Loop Approval System
 * Mandatory approval for sensitive operations
 */

const logger = require('../core/logger');

class ApprovalSystem {
  constructor() {
    this.pendingApprovals = new Map();
  }

  /**
   * Request approval for sensitive operation
   */
  async requestApproval(userId, action, data, requesterRole) {
    const approvalId = `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const approval = {
      approvalId,
      userId,
      action,
      data,
      requesterRole,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      rejectedReason: null,
    };

    this.pendingApprovals.set(approvalId, approval);
    logger.info('Approval requested', { approvalId, userId, action });

    // TODO: Send notification to Admin/SuperAdmin via webhook/email
    // For now, just return the approval ID

    return approval;
  }

  /**
   * Approve pending request
   */
  async approveRequest(approvalId, approverId, approverRole) {
    const approval = this.pendingApprovals.get(approvalId);

    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    if (approverRole !== 'Admin' && approverRole !== 'SuperAdmin') {
      logger.warn('Unauthorized approval attempt', { approverId, approvalId });
      throw new Error('Only Admin/SuperAdmin can approve requests');
    }

    approval.status = 'APPROVED';
    approval.approvedBy = approverId;
    approval.approvedAt = new Date().toISOString();

    logger.success('Request approved', { approvalId, approverId });
    logger.auditLog(approverId, approverRole, 'APPROVED_REQUEST', approval.action, 'SUCCESS');

    return approval;
  }

  /**
   * Reject pending request
   */
  async rejectRequest(approvalId, approverId, approverRole, reason) {
    const approval = this.pendingApprovals.get(approvalId);

    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    if (approverRole !== 'Admin' && approverRole !== 'SuperAdmin') {
      logger.warn('Unauthorized rejection attempt', { approverId, approvalId });
      throw new Error('Only Admin/SuperAdmin can reject requests');
    }

    approval.status = 'REJECTED';
    approval.approvedBy = approverId;
    approval.approvedAt = new Date().toISOString();
    approval.rejectedReason = reason;

    logger.warn('Request rejected', { approvalId, approverId, reason });
    logger.auditLog(approverId, approverRole, 'REJECTED_REQUEST', approval.action, 'REJECTED', reason);

    return approval;
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(filter = {}) {
    let approvals = Array.from(this.pendingApprovals.values()).filter(
      (a) => a.status === 'PENDING'
    );

    if (filter.userId) {
      approvals = approvals.filter((a) => a.userId === filter.userId);
    }

    if (filter.action) {
      approvals = approvals.filter((a) => a.action === filter.action);
    }

    return approvals;
  }
}

module.exports = new ApprovalSystem();