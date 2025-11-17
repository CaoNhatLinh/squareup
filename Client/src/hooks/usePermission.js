import { useAuth } from './useAuth';

/**
 * Hook to check if user has specific permission
 */
export const hasPermissionForUser = (user, resource, action) => {
  if (!user) return false;
  if (user?.isAdmin) return true;
  if (user?.role === 'staff' && user?.permissions) {
    return user.permissions[resource]?.[action] === true;
  }
  return false;
};

export const usePermission = (resource, action) => {
  const { user } = useAuth();
  return hasPermissionForUser(user, resource, action);
};

/**
 * Hook to check if user has any permission for a resource
 */
export const useHasAnyPermission = (resource) => {
  const { user } = useAuth();

  // Admin has all permissions
  if (user?.isAdmin) {
    return true;
  }

  // Check if staff has any permission for this resource
  if (user?.role === 'staff' && user?.permissions) {
    const resourcePerms = user.permissions[resource];
    if (resourcePerms) {
      return Object.values(resourcePerms).some(perm => perm === true);
    }
  }

  return false;
};

/**
 * Hook to get all permissions for current user
 */
export const usePermissions = () => {
  const { user } = useAuth();

  if (user?.isAdmin) {
    // Return all permissions for admin
    const allResources = [
      'items',
      'categories',
      'modifiers',
      'discounts',
      'orders',
      'transactions',
      'reviews',
      'business_settings',
      'staff',
    ];

    const allPermissions = {};
    allResources.forEach(resource => {
      allPermissions[resource] = {
        create: true,
        read: true,
        update: true,
        delete: true,
      };
    });

    return allPermissions;
  }

  return user?.permissions || {};
};

export default usePermission;
