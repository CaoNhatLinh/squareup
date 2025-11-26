import { createContext } from "react";

export const OrderNotificationContext = createContext({
  newOrderIds: [],
  newPosOrderIds: [],
  markOrderAsViewed: () => {},
  markPosOrderAsViewed: () => {},
  markAllPosAsRead: () => {},
  isNewOrder: () => false,
  isNewPosOrder: () => false,
});
