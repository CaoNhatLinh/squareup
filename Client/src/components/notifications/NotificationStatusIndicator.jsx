import { useState } from 'react';
import { HiBell, HiBellSlash } from 'react-icons/hi2';
import { getNotificationPermissionStatus, requestNotificationPermission } from '../../utils/desktopNotification';
import { useToast } from '../../hooks/useToast';
export function NotificationStatusIndicator() {
  const [permission, setPermission] = useState(getNotificationPermissionStatus());
  const { success } = useToast();
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
        success('✅ Desktop notifications enabled!');
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
