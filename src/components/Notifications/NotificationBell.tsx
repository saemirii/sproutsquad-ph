import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/AppContext';
import { NotificationPanel } from './NotificationPanel';

/** Self-contained: owns its own open/closed state and renders its panel as a
 * fixed overlay (same pattern as LevelUpModal/EnterBesKeyModal), so it can be
 * mounted anywhere without lifting state up. */
export const NotificationBell: React.FC = () => {
  const { unreadNotificationCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="relative w-6 h-6 flex items-center justify-center text-[#3B2F27]" title="Notifications">
        <Bell className="w-4 h-4" strokeWidth={2.25} />
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#7A341A] text-white text-[8px] font-black flex items-center justify-center border border-[#FFF9E6]">
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </span>
        )}
      </button>
      {isOpen && <NotificationPanel onClose={() => setIsOpen(false)} />}
    </>
  );
};
