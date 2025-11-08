import { useOrderNotifications } from '../hooks/useOrderNotifications.jsx';
import { useAuth } from '../hooks/useAuth';
import { useRestaurant } from '../hooks/useRestaurant';
import { useLocation } from 'react-router-dom';
import { OrderNotificationContext } from './OrderNotificationContext';

export function OrderNotificationProvider({ children }) {
  const { user } = useAuth();
  const { restaurant } = useRestaurant();
  const location = useLocation();
  const isShopRoute = location.pathname.startsWith('/shop/');

  const orderNotifications = useOrderNotifications(user, restaurant?.id, isShopRoute);

  return (
    <OrderNotificationContext.Provider value={orderNotifications}>
      {children}
    </OrderNotificationContext.Provider>
  );
}
