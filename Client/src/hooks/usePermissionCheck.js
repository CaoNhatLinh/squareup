import { usePermission } from '@/hooks/usePermission';
import { useToast } from '@/hooks/useToast';


export function usePermissionCheck() {
  const { error: showError } = useToast();

  
  const checkPermission = (resource, action) => {
    
    const hasPermission = usePermission(resource, action);
    
    if (!hasPermission) {
      const actionText = {
        create: 'create',
        update: 'edit',
        delete: 'delete',
        read: 'view'
      }[action] || action;
      
      showError(`You don't have permission to ${actionText} ${resource}`);
      return false;
    }
    
    return true;
  };

  return { checkPermission };
}


export function withPermissionCheck(resource, action, fn, showError, hasPermissionFn) {
  return async (...args) => {
    if (!hasPermissionFn(resource, action)) {
      const actionText = {
        create: 'create',
        update: 'edit',
        delete: 'delete',
        read: 'view'
      }[action] || action;
      
      showError(`You don't have permission to ${actionText} ${resource}`);
      return null;
    }
    
    return await fn(...args);
  };
}
