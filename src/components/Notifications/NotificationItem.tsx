import React from 'react';
import { useNotifications } from '../../context/AppContext';
import { AppNotification } from '../../types';
import { NOTIFICATION_ICON, formatRelativeTime } from './notificationIcons';

interface NotificationItemProps {
  notification: AppNotification;
  onNavigate?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onNavigate }) => {
  const { markNotificationRead, resolveNotificationAction } = useNotifications();

  const handleClick = () => {
    if (!notification.isRead) void markNotificationRead(notification.id);
    if (notification.action) {
      resolveNotificationAction(notification.action);
      onNavigate?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`btn-bouncy w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer ${
        notification.isRead ? 'bg-white' : 'bg-[#F2FBF7]'
      }`}
    >
      <span className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E5DACD] flex items-center justify-center text-base shrink-0">
        {NOTIFICATION_ICON[notification.type] || '🔔'}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-[#3B2F27] truncate">{notification.title}</p>
          {!notification.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#207559] shrink-0" />}
        </div>
        <p className="text-[11px] text-[#7A6B5F] leading-snug mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-[10px] text-[#A39284] mt-1">{formatRelativeTime(notification.createdAt)}</p>
      </div>
    </button>
  );
};
