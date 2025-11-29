import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
export const hasPermissionForUser = (user, resource, action) => {
  if (!user) return false;
  if (user?.isAdmin) return true;
  if (user?.role === 'owner') return true;
  if (user?.role === 'staff' && user?.permissions) {
    return user.permissions[resource]?.[action] === true;
  }
  return false;
};
export const usePermission = (resource, action) => {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const hasPermission = hasPermissionForUser(user, resource, action);
  const checkPermission = (res = resource, act = action) => {
    const allowed = hasPermissionForUser(user, res, act);
    if (!allowed) {
      const actionText = {
        create: 'create',
        update: 'edit',
        delete: 'delete',
        read: 'view'
      }[act] || act;
      showError(`You don't have permission to ${actionText} ${res}`);
      return false;
    }
    return true;
  };
  return { hasPermission, checkPermission, user };
};
export const useHasAnyPermission = (resource) => {
  const { user } = useAuth();
  if (user?.isAdmin) {
    return true;
  }
  if (user?.role === 'staff' && user?.permissions) {
    const resourcePerms = user.permissions[resource];
    if (resourcePerms) {
      return Object.values(resourcePerms).some(perm => perm === true);
    }
  }
  return false;
};
export const usePermissions = () => {
  const { user } = useAuth();
  if (user?.isAdmin) {
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
      'customers',
      'pos',
      'web_builder',
    ];
    const allPermissions = {};
    allResources.forEach(resource => {
      allPermissions[resource] = {
        create: true,
        read: true,
        update: true,
        delete: true,
        access: true,
      };
    });
    return allPermissions;
  }
  if (user?.role === 'owner') {
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
      'customers',
      'pos',
      'web_builder',
    ];
    const allPerms = {};
    allResources.forEach(resource => {
      allPerms[resource] = {
        create: true,
        read: true,
        update: true,
        delete: true,
        access: true,
      };
    });
    return allPerms;
  }
  return user?.permissions || {};
};
export default usePermission;
