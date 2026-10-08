export type UserRole = 'USER' | 'PROFESSIONAL' | 'AUTHORITY' | 'WORKER';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  USER: [
    'VIEW_PUBLIC',
    'CREATE_COMPLAINT',
    'VIEW_OWN_COMPLAINTS',
    'UPDATE_OWN_PROFILE',
  ],
  PROFESSIONAL: [
    'VIEW_PUBLIC',
    'MANAGE_PROFILE',
    'VIEW_ASSIGNED_WORK',
    'UPDATE_ASSIGNED_WORK',
  ],
  WORKER: [
    'VIEW_ASSIGNED_JOBS',
    'START_ASSIGNED_JOB',
    'UPLOAD_EVIDENCE',
    'COMPLETE_ASSIGNED_JOB',
  ],
  AUTHORITY: [
    'VIEW_PUBLIC',
    'CREATE_COMPLAINT',
    'VIEW_ALL_COMPLAINTS',
    'MANAGE_WORK_ORDERS',
    'CALCULATE_PRIORITY',
    'ASSIGN_CREWS',
    'GENERATE_DAILY_PLAN',
    'VIEW_ANALYTICS',
    'VIEW_HOTSPOTS',
    'MANAGE_CREWS',
    'APPROVE_USERS',
    'VIEW_AUDIT_LOG',
    'UPDATE_OWN_PROFILE',
  ],
};

export function getPermissionsForRole(role: string): string[] {
  const normalizedRole = role.toUpperCase() as UserRole;
  return ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.USER;
}
