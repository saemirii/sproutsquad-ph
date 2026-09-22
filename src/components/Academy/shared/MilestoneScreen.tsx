import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { RewardResult } from '../../../types';

interface MilestoneScreenProps {
  moduleTitle: string;
  lessonTitles: string[];
  reward: RewardResult;
  onContinue: () => void;
}

/** Shown once, at module-completion boundaries (≤9 times ever per
 * learner) — deliberately rarer and larger than the per-lesson Mission
 * Complete screen so it doesn't cheapen the moment. Garden stays
 * purchase-driven as-is; this just nudges toward it rather than
 * auto-granting a specific item. */
export const MilestoneScreen: React.FC<MilestoneScreenProps> = ({ moduleTitle, lessonTitles, reward, onContinue }) => (
  <div className="bg-gradient-to-br from-[#B8E6D5]/30 to-[#A8D8EA]/20 rounded-3xl border-2 border-[#9FD9C3] p-6 sm:p-8 shadow-xs space-y-5 text-center animate-in zoom-in-95 duration-300">
    <div className="space-y-1">
      <span className="text-4xl">🌿</span>
      <h1 className="text-xl font-black text-[#194E3B] font-['Nunito',sans-serif]">Milestone Reached!</h1>
      <p className="text-sm font-bold text-[#3B2F27]">You completed {moduleTitle}</p>
    </div>

    <div className="text-left bg-white/70 rounded-2xl border border-[#9FD9C3] p-4 space-y-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#194E3B] mb-1">You learned</p>
      {lessonTitles.map((t, i) => (
        <p key={i} className="text-xs font-semibold text-[#207559] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {t}
        </p>
      ))}
    </div>

    <div className="bg-white rounded-2xl border border-[#9FD9C3] p-4 space-y-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#194E3B]">Your Rewards</p>
      <p className="text-2xl font-black text-[#194E3B] font-['Nunito',sans-serif]">+{reward.xpAwarded} XP</p>
      {reward.seedsAwarded > 0 && (
        <p className="text-sm font-bold text-[#207559]">+{reward.seedsAwarded} 🌱 Seeds — enough to unlock something new in the garden</p>
      )}
    </div>

    <button onClick={onContinue} className="btn-bouncy w-full py-3.5 rounded-2xl bg-[#207559] hover:bg-[#194E3B] text-white text-sm font-black cursor-pointer">
      Continue Growing →
    </button>
  </div>
);
