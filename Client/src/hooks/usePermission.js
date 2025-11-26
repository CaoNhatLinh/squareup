import { useAuth } from '@/hooks/useAuth';


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
  return hasPermissionForUser(user, resource, action);
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
