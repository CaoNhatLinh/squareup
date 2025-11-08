import { createContext } from 'react';

export const OrderNotificationContext = createContext({
  newOrderIds: [],
  markOrderAsViewed: () => {},
  isNewOrder: () => false,
});
