import { useEffect, useState } from "react";
import { requestNotificationPermission, getNotificationPermissionStatus } from '@/utils/desktopNotification';
import { HiBell } from 'react-icons/hi2';
import { useToast } from '@/hooks/useToast';
export default function NotificationPermissionBanner() {
  const [permission, setPermission] = useState(getNotificationPermissionStatus());
  const [showBanner, setShowBanner] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const { success, warning } = useToast();

  useEffect(() => {
    if (permission === 'default') {
      setShowBanner(true);
    }
  }, [permission]);
  const handleRequestPermission = async () => {
    setRequesting(true);
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermissionStatus());
    
    if (granted) {
      setShowBanner(false);
      setTimeout(() => {
        success('Desktop notifications enabled! You will receive alerts for new orders.');
      }, 100);
    } else {
      warning('Desktop notifications blocked. You can enable them in your browser settings.');
    }
    setRequesting(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('notificationBannerDismissed', 'true');
  };

  if (permission === 'granted' || permission === 'unsupported' || permission === 'denied') {
    return null;
  }

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HiBell className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Enable desktop notifications for new orders
            </p>
            <p className="text-xs text-blue-700">
              Get instant alerts even when this tab is not active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRequestPermission}
            disabled={requesting}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {requesting ? 'Requesting...' : 'Enable'}
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-blue-700 text-sm font-medium hover:bg-blue-100 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

