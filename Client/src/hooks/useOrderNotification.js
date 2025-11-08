import { useContext } from 'react';
import { OrderNotificationContext } from '../context/OrderNotificationContext';

export function useOrderNotification() {
  const context = useContext(OrderNotificationContext);
  if (context === undefined) {
    throw new Error('useOrderNotification must be used within an OrderNotificationProvider');
  }
  return context;
}
