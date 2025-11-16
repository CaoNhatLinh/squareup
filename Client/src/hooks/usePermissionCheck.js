import { usePermission } from './usePermission';
import { useToast } from './useToast';

/**
 * Hook to check permissions before performing actions
 * Shows appropriate toast messages when permission is denied
 */
export function usePermissionCheck() {
  const { error: showError } = useToast();

  /**
   * Check if user has permission and show toast if not
   * @param {string} resource - The resource (e.g., 'items', 'categories')
   * @param {string} action - The action (e.g., 'create', 'update', 'delete')
   * @returns {boolean} - true if has permission, false otherwise
   */
  const checkPermission = (resource, action) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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

/**
 * Higher-order function to wrap async functions with permission check
 * @param {string} resource 
 * @param {string} action 
 * @param {Function} fn - The async function to execute if permission is granted
 * @param {Function} showError - Toast error function
 * @param {Function} hasPermissionFn - Function to check permission
 * @returns {Function} - Wrapped function that checks permission before execution
 */
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
