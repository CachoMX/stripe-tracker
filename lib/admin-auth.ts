// Admin Authentication & Authorization
// This file handles admin-only access control

/**
 * List of admin user IDs (Supabase auth.uid)
 * TODO: Move this to environment variables or database for production
 */
const ADMIN_USER_IDS = [
  process.env.ADMIN_USER_ID || '', // Your admin user ID
];

/**
 * Check if a user is an admin
 */
export function isAdmin(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return ADMIN_USER_IDS.includes(userId);
}

/**
 * Require admin access or throw error
 * Use this in API routes
 */
export function requireAdmin(userId: string | null | undefined): void {
  if (!isAdmin(userId)) {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Admin permission levels (for future expansion)
 */
export enum AdminPermission {
  VIEW_CLIENTS = 'view_clients',
  EDIT_CLIENTS = 'edit_clients',
  VIEW_TRANSACTIONS = 'view_transactions',
  VIEW_REVENUE = 'view_revenue',
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  SUPER_ADMIN = 'super_admin',
}

/**
 * Check if admin has specific permission
 * For now, all admins have all permissions
 * Can be expanded to role-based permissions later
 */
export function hasPermission(
  userId: string | null | undefined,
  permission: AdminPermission
): boolean {
  return isAdmin(userId);
}
