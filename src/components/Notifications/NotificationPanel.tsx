import React from 'react';
import { X } from 'lucide-react';
import { useNotifications } from '../../context/AppContext';
import { NotificationList } from './NotificationList';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, unreadNotificationCount, markAllNotificationsRead } = useNotifications();

  return (
    <div className="fixed inset-0 z-[75] bg-black/30 backdrop-blur-sm flex items-start justify-center pt-14 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm max-h-[75vh] flex flex-col bg-[#FFF9E6] rounded-3xl border border-[#EDE4D8] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#EDE4D8] bg-white">
          <h3 className="text-sm font-black text-[#3B2F27] font-['Nunito',sans-serif]">Notifications</h3>
          <div className="flex items-center gap-3">
            {unreadNotificationCount > 0 && (
              <button
                onClick={() => void markAllNotificationsRead()}
                className="text-[11px] font-bold text-[#207559] hover:text-[#194E3B] cursor-pointer"
              >
                Mark all as read
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-lg text-[#8C7A6D] hover:bg-[#F2EAE0]" title="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto">
          <NotificationList notifications={notifications} onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
};
