import React, { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DynamicIsland, DynamicIslandAlert } from './DynamicIsland';
import { NotificationBell } from '../Notifications/NotificationBell';

interface IosStatusBarProps {
  activeAlert?: DynamicIslandAlert | null;
  onClearAlert?: () => void;
  onOpenBag?: () => void;
  onOpenProfile?: () => void;
}

export const IosStatusBar: React.FC<IosStatusBarProps> = ({
  activeAlert,
  onClearAlert,
  onOpenBag,
  onOpenProfile,
}) => {
  const [timeStr, setTimeStr] = useState('9:41');
  const { currentUser } = useApp();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setTimeStr(`${hours % 12 || 12}:${formattedMinutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative shrink-0 pt-2.5 pb-1 px-6 w-full flex items-center justify-between z-40 select-none text-[#3B2F27]">
      {/* Time on the Left */}
      <div className="w-20 flex items-center gap-1.5">
        <button onClick={onOpenProfile} className="w-7 h-7 rounded-full overflow-hidden border border-[#9FD9C3] bg-[#B8E6D5]" title="Open profile">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
        </button>
        <span className="font-extrabold text-[13px] tracking-tight font-['Nunito',sans-serif]">
          {timeStr}
        </span>
      </div>

      {/* Dynamic Island in the Center */}
      <div className="flex-1 flex justify-center">
        <DynamicIsland
          activeAlert={activeAlert}
          onClearAlert={onClearAlert}
          onOpenBag={onOpenBag}
        />
      </div>

      {/* Notifications, Connectivity & Battery on the Right */}
      <div className="w-20 flex items-center justify-end gap-1.5 text-[#3B2F27]">
        <NotificationBell />

        {/* 5G / Wifi icon */}
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />

        {/* Battery with charge level */}
        <div className="flex items-center">
          <div className="w-5 h-2.5 border-[1.5px] border-[#3B2F27] rounded-[3.5px] p-[1px] flex items-center">
            <div className="w-[85%] h-full bg-[#194E3B] rounded-[1.5px]" />
          </div>
          <div className="w-[1.5px] h-1 bg-[#3B2F27] rounded-r-[1px] -ml-[0.5px]" />
        </div>
      </div>
    </div>
  );
};
