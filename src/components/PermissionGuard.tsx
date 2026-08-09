import React from 'react';
import { AdminPermissions } from '../types';
import { usePermission } from '../hooks/usePermission';

interface PermissionGuardProps {
  userRole?: string;
  permission: keyof AdminPermissions;
  userPermissions?: AdminPermissions | null;
  customRoleMatrix?: Record<string, AdminPermissions> | null;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PermissionGuard Component (Higher-Order Wrapper)
 * Conditionally renders children if the current user's role metadata grants the specified permission.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  userRole,
  permission,
  userPermissions,
  customRoleMatrix,
  fallback = null,
  children
}) => {
  const { hasPermission } = usePermission(userRole, userPermissions, customRoleMatrix);

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Higher-Order Component (HOC) version: withPermission
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: keyof AdminPermissions,
  fallbackNode: React.ReactNode = null
) {
  return function PermissionProtectedComponent(
    props: P & { userRole?: string; userPermissions?: AdminPermissions }
  ) {
    const { hasPermission } = usePermission(props.userRole, props.userPermissions);

    if (!hasPermission(requiredPermission)) {
      return <>{fallbackNode}</>;
    }

    return <Component {...props} />;
  };
}
