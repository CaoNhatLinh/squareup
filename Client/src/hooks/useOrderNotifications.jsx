import { useEffect, useRef, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase";
import { useNavigate } from "react-router-dom";
import { playNotificationSound } from "../utils/notificationSound";
import {
  showDesktopNotification,
  isNotificationSupported,
} from "../utils/desktopNotification";
import { useToast } from "./useToast";

export const useOrderNotifications = (
  user,
  restaurantId,
  isShopRoute = false
) => {
  const navigate = useNavigate();
  const { success } = useToast();
  const [newOrderIds, setNewOrderIds] = useState(() => {
    const saved = localStorage.getItem("newOrderIds");
    return saved ? JSON.parse(saved) : [];
  });
  const [lastOrderCount, setLastOrderCount] = useState(null);
  const audioRef = useRef(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isShopRoute || !user || !restaurantId) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio("/assets/audio/notification.mp3");
      audioRef.current.volume = 0.5;
      audioRef.current.onerror = () => {
        console.warn("Notification sound file not found. Using fallback beep.");
      };
    }

    const ordersRef = ref(rtdb, `restaurants/${restaurantId}/orders`);

    const handleOrdersUpdate = (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }

      const orders = snapshot.val();
      const orderArray = Object.entries(orders).map(([id, data]) => ({
        id,
        ...data,
      }));

      const sortedOrders = orderArray.sort((a, b) => b.createdAt - a.createdAt);
      const currentOrderCount = sortedOrders.length;

      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        setLastOrderCount(currentOrderCount);
        return;
      }

      if (lastOrderCount !== null && currentOrderCount > lastOrderCount) {
        const newOrdersCount = currentOrderCount - lastOrderCount;
        const newOrders = sortedOrders.slice(0, newOrdersCount);
        newOrders.forEach((order) => {
          if (audioRef.current) {
            playNotificationSound(audioRef.current);
          }
          if (isNotificationSupported() && document.hidden) {
            showDesktopNotification(order);
          }

          setNewOrderIds((prev) => {
            const updated = [...new Set([...prev, order.id])];
            localStorage.setItem("newOrderIds", JSON.stringify(updated));
            return updated;
          });
          
          console.log("🔔 New order received:", order);
          
          // Show toast notification with custom message (8 seconds)
          success(
            `New Order #${order.orderId?.substring(0, 8).toUpperCase()} - $${order.amount?.toFixed(2)}`,
            8000
          );
        });
      }

      setLastOrderCount(currentOrderCount);
    };

    const unsubscribe = onValue(ordersRef, handleOrdersUpdate, (error) => {
      console.error("❌ Firebase notification listener error:", error);
    });

    return () => {
      console.log("🧹 Cleaning up notification Firebase listener");
      unsubscribe();
    };
  }, [user, restaurantId, isShopRoute, lastOrderCount, navigate, success]);

  const markOrderAsViewed = (orderId) => {
    setNewOrderIds((prev) => {
      const updated = prev.filter((id) => id !== orderId);
      localStorage.setItem("newOrderIds", JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNewOrderIds([]);
    localStorage.setItem("newOrderIds", JSON.stringify([]));
  };

  const isNewOrder = (orderId) => {
    return newOrderIds.includes(orderId);
  };

  return {
    newOrderIds,
    markOrderAsViewed,
    markAllAsRead,
    isNewOrder,
  };
};
