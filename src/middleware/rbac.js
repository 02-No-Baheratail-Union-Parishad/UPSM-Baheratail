/**
 * Role-Based Access Control (RBAC) Middleware
 * Granular permissions for sensitive operations
 */

const logger = require('../core/logger');

const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  OFFICER: 'Officer',
  OPERATOR: 'Operator',
  VIEWER: 'Viewer',
};

const PERMISSIONS = {
  SUPER_ADMIN: ['view', 'create', 'approve', 'reject', 'generate', 'manage_apis', 'security', 'deployment'],
  ADMIN: ['view', 'create', 'approve', 'reject', 'generate', 'manage_apis'],
  OFFICER: ['view', 'create', 'approve', 'generate'],
  OPERATOR: ['view', 'create', 'generate'],
  VIEWER: ['view'],
};

/**
 * Check if user has permission for action
 */
function checkPermission(role, action) {
  const userPermissions = PERMISSIONS[role] || [];
  return userPermissions.includes(action);
}

/**
 * RBAC Middleware for Express
 */
function rbacMiddleware(requiredAction) {
  return (req, res, next) => {
    const { userId, role } = req.user || {};

    if (!userId || !role) {
      logger.warn('Unauthorized access attempt: missing user info', { ip: req.ip });
      return res.status(401).json({ error: 'Unauthorized: Missing authentication' });
    }

    if (!checkPermission(role, requiredAction)) {
      logger.warn('Permission denied', { userId, role, requiredAction });
      return res.status(403).json({ error: `Permission denied: ${requiredAction} not allowed for role ${role}` });
    }

    logger.debug('Permission granted', { userId, role, action: requiredAction });
    next();
  };
}

/**
 * Sensitive action approval check
 */
async function requiresApproval(action) {
  const sensitiveActions = [
    'database_write',
    'database_delete',
    'api_delete',
    'security_update',
    'deployment',
    'user_delete',
  ];

  return sensitiveActions.includes(action);
}

module.exports = {
  ROLES,
  PERMISSIONS,
  checkPermission,
  rbacMiddleware,
  requiresApproval,
};