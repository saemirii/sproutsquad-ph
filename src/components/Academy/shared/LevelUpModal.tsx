import React, { useEffect } from 'react';
import { useAcademy } from '../../../context/AppContext';
import { triggerAchievementConfetti } from '../../../utils/confetti';

/** The bigger level-up celebration (section 2/14) — mount once near the top of the Academy tab. */
export const LevelUpModal: React.FC = () => {
  const { pendingLevelUp, clearPendingLevelUp } = useAcademy();

  useEffect(() => {
    if (pendingLevelUp) triggerAchievementConfetti();
  }, [pendingLevelUp]);

  if (!pendingLevelUp) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#143D35]/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
      onClick={clearPendingLevelUp}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-xs w-full text-center space-y-3 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-5xl block animate-bounce">{pendingLevelUp.icon}</span>
        <p className="text-xs font-bold text-[#207559] uppercase tracking-wider">Your Business Bloomed!</p>
        <h2 className="text-xl font-black text-[#3B2F27] font-['Nunito',sans-serif]">
          Level {pendingLevelUp.level}
        </h2>
        <p className="text-sm font-bold text-[#6B5B4F]">{pendingLevelUp.title}</p>
        {pendingLevelUp.seedBonus > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FFF9E6] border border-[#EDE4D8] px-3.5 py-2 text-xs font-black text-[#7A341A] mx-auto">
            <span>🌰</span>
            <span>+{pendingLevelUp.seedBonus} Seeds</span>
          </div>
        )}
        <button
          onClick={clearPendingLevelUp}
          className="btn-bouncy w-full mt-2 rounded-2xl bg-[#207559] hover:bg-[#194E3B] text-white text-xs font-black px-4 py-3 cursor-pointer"
        >
          Keep Growing 🌱
        </button>
      </div>
    </div>
  );
};
