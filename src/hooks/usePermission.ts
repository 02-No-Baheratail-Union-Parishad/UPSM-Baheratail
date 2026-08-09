import { useMemo } from 'react';
import { AdminPermissions } from '../types';

// Default Role Permission Presets fallback
export const DEFAULT_ROLE_PERMISSIONS: Record<string, AdminPermissions> = {
  super_admin: {
    canView: true,
    canEdit: true,
    canApprove: true,
    canDelete: true,
    canManageAdmins: true,
    canExportData: true,
    canApproveCertificates: true,
    canIssueCertificates: true,
    canEditConfig: true,
    canDeleteLogs: true
  },
  chairman: {
    canView: true,
    canEdit: true,
    canApprove: true,
    canDelete: true,
    canManageAdmins: true,
    canExportData: true,
    canApproveCertificates: true,
    canIssueCertificates: true,
    canEditConfig: true,
    canDeleteLogs: true
  },
  secretary: {
    canView: true,
    canEdit: true,
    canApprove: true,
    canDelete: false,
    canManageAdmins: false,
    canExportData: true,
    canApproveCertificates: true,
    canIssueCertificates: true,
    canEditConfig: true,
    canDeleteLogs: false
  },
  member: {
    canView: true,
    canEdit: false,
    canApprove: false,
    canDelete: false,
    canManageAdmins: false,
    canExportData: false,
    canApproveCertificates: false,
    canIssueCertificates: false,
    canEditConfig: false,
    canDeleteLogs: false
  },
  developer: {
    canView: true,
    canEdit: true,
    canApprove: true,
    canDelete: true,
    canManageAdmins: true,
    canExportData: true,
    canApproveCertificates: true,
    canIssueCertificates: true,
    canEditConfig: true,
    canDeleteLogs: true
  }
};

/**
 * Custom React Hook: usePermission
 * Checks whether the logged-in user or active role has permissions to perform an administrative action.
 */
export function usePermission(
  userRole?: string,
  userPermissions?: AdminPermissions | null,
  customRoleMatrix?: Record<string, AdminPermissions> | null
) {
  const role = (userRole || 'secretary').toLowerCase();

  const permissions: AdminPermissions = useMemo(() => {
    // 1. If explicit user permissions are provided from Firebase user metadata
    if (userPermissions && typeof userPermissions === 'object') {
      return {
        ...DEFAULT_ROLE_PERMISSIONS[role],
        ...userPermissions
      };
    }

    // 2. If custom role matrix is passed from AdminSettings / Firebase Sync
    if (customRoleMatrix && customRoleMatrix[role]) {
      return customRoleMatrix[role];
    }

    // 3. Default fallback by role
    return DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.secretary;
  }, [role, userPermissions, customRoleMatrix]);

  const hasPermission = (key: keyof AdminPermissions): boolean => {
    // Super admins always have full permissions override
    if (role === 'super_admin' || role === 'developer') return true;
    return Boolean(permissions[key]);
  };

  return {
    permissions,
    hasPermission,
    canView: hasPermission('canView'),
    canEdit: hasPermission('canEdit'),
    canApprove: hasPermission('canApprove') || hasPermission('canApproveCertificates'),
    canDelete: hasPermission('canDelete') || hasPermission('canDeleteLogs'),
    canManageAdmins: hasPermission('canManageAdmins'),
    canExportData: hasPermission('canExportData')
  };
}
