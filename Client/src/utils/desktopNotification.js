export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const isNotificationSupported = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};

export const showDesktopNotification = (order) => {
  if (!isNotificationSupported()) {
    return null;
  }

  const options = {
    body: `${order.restaurantName}\nAmount: $${order.amount?.toFixed(2)}\nStatus: ${order.status}`,
    icon: '/favicon.ico', // Update with your app icon
    badge: '/favicon.ico',
    tag: order.id, // Prevent duplicate notifications
    requireInteraction: false, // Auto-close after timeout
    silent: false, // Play notification sound
    timestamp: Date.now(),
    data: {
      orderId: order.id,
      url: `/orders/${order.id}`,
    },
  };

  try {
    const notification = new Notification('🔔 New Order Received!', options);

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      if (order.id) {
        window.location.href = `/orders/${order.id}`;
      }
      
      notification.close();
    };

    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  } catch (error) {
    console.error('Failed to show desktop notification:', error);
    return null;
  }
};

export const getNotificationPermissionStatus = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission; // 'granted', 'denied', or 'default'
};
