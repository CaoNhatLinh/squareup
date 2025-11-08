import { useState, useEffect } from 'react';
import { requestNotificationPermission, getNotificationPermissionStatus } from '../../utils/desktopNotification';
import { HiBell, HiBellSlash } from 'react-icons/hi2';

/**
 * Notification Permission Banner
 * Prompts user to enable desktop notifications for order alerts
 */
export default function NotificationPermissionBanner() {
  const [permission, setPermission] = useState(getNotificationPermissionStatus());
  const [showBanner, setShowBanner] = useState(false);
  const [requesting, setRequesting] = useState(false);

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
        alert('✅ Desktop notifications enabled! You will receive alerts for new orders.');
      }, 100);
    } else {
      alert('❌ Desktop notifications blocked. You can enable them in your browser settings.');
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

/**
 * Notification Status Indicator
 * Shows current notification permission status in settings
 */
export function NotificationStatusIndicator() {
  const [permission, setPermission] = useState(getNotificationPermissionStatus());

  const getStatusConfig = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: HiBell,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Enabled',
          description: 'You will receive desktop notifications for new orders',
        };
      case 'denied':
        return {
          icon: HiBellSlash,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Blocked',
          description: 'Enable notifications in your browser settings',
        };
      case 'unsupported':
        return {
          icon: HiBellSlash,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Not Supported',
          description: 'Your browser does not support desktop notifications',
        };
      default:
        return {
          icon: HiBell,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Not Enabled',
          description: 'Click to enable desktop notifications',
        };
    }
  };

  const handleEnableClick = async () => {
    if (permission === 'default') {
      const granted = await requestNotificationPermission();
      setPermission(getNotificationPermissionStatus());
      
      if (granted) {
        alert('✅ Desktop notifications enabled!');
      }
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div 
      className={`flex items-center gap-3 p-4 rounded-lg ${config.bgColor} ${
        permission === 'default' ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      onClick={permission === 'default' ? handleEnableClick : undefined}
    >
      <Icon className={`w-6 h-6 ${config.color}`} />
      <div className="flex-1">
        <p className={`font-medium ${config.color}`}>{config.label}</p>
        <p className="text-sm text-gray-600">{config.description}</p>
      </div>
    </div>
  );
}
