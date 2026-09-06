import React, { useEffect } from 'react';
import { useApp } from '../../../context/AppContext';

/** Small floating "+XP / +Seeds" feedback (section 14) — mount once near the top of the Academy tab. */
export const RewardToast: React.FC = () => {
  const { lastReward, clearLastReward } = useApp();

  useEffect(() => {
    if (!lastReward) return;
    const timer = setTimeout(() => clearLastReward(), 2600);
    return () => clearTimeout(timer);
  }, [lastReward]);

  if (!lastReward || (lastReward.xpAwarded <= 0 && lastReward.seedsAwarded <= 0)) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
      <div className="flex items-center gap-2 bg-[#194E3B] text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-lg">
        {lastReward.xpAwarded > 0 && <span>+{lastReward.xpAwarded} XP</span>}
        {lastReward.xpAwarded > 0 && lastReward.seedsAwarded > 0 && <span className="opacity-50">•</span>}
        {lastReward.seedsAwarded > 0 && <span>+{lastReward.seedsAwarded} 🌰 Seeds</span>}
      </div>
    </div>
  );
};
