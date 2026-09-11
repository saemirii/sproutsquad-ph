import React, { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';
import { useSession } from '../../context/AppContext';
import { DynamicIsland, DynamicIslandAlert } from './DynamicIsland';
import { NotificationBell } from '../Notifications/NotificationBell';
import { isNativeApp } from '../../utils/platform';

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
  const { currentUser } = useSession();

  // The fake clock only matters for the web "simulated iPhone" demo view —
  // a native build sits below the OS's own real status bar, which already
  // shows the real time.
  useEffect(() => {
    if (isNativeApp) return;
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
    <div
      className="relative shrink-0 pb-1 px-6 w-full flex items-center justify-between z-40 select-none text-[#3B2F27]"
      style={isNativeApp ? { paddingTop: 'max(0.625rem, env(safe-area-inset-top))' } : { paddingTop: '0.625rem' }}
    >
      {/* Profile avatar + (web-only) fake clock on the Left */}
      <div className="w-20 flex items-center gap-1.5">
        <button onClick={onOpenProfile} className="w-7 h-7 rounded-full overflow-hidden border border-[#9FD9C3] bg-[#B8E6D5]" title="Open profile">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
        </button>
        {!isNativeApp && (
          <span className="font-extrabold text-[13px] tracking-tight font-['Nunito',sans-serif]">
            {timeStr}
          </span>
        )}
      </div>

      {/* Cart + alert surface in the Center — a real tap-to-open cart widget
          and toast-alert display (not just decorative), kept on both
          platforms. On web this renders as a fake Dynamic Island pill for
          the simulated-iPhone preview; on native it's a plain inline
          control, since the OS already draws the real Dynamic Island. */}
      <div className="flex-1 flex justify-center">
        <DynamicIsland
          activeAlert={activeAlert}
          onClearAlert={onClearAlert}
          onOpenBag={onOpenBag}
        />
      </div>

      {/* Notifications on the Right, plus (web-only) fake connectivity/battery */}
      <div className="w-20 flex items-center justify-end gap-1.5 text-[#3B2F27]">
        <NotificationBell />

        {!isNativeApp && (
          <>
            {/* 5G / Wifi icon */}
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />

            {/* Battery with charge level */}
            <div className="flex items-center">
              <div className="w-5 h-2.5 border-[1.5px] border-[#3B2F27] rounded-[3.5px] p-[1px] flex items-center">
                <div className="w-[85%] h-full bg-[#194E3B] rounded-[1.5px]" />
              </div>
              <div className="w-[1.5px] h-1 bg-[#3B2F27] rounded-r-[1px] -ml-[0.5px]" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
