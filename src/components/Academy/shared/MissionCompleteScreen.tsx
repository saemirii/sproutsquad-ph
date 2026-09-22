import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { RewardResult } from '../../../types';

interface MissionCompleteScreenProps {
  lessonTitle: string;
  stepLabels: string[];
  reward: RewardResult;
  skillDelta: { name: string; before: number; after: number } | null;
  onContinue: () => void;
}

/** The payoff screen after a lesson's quiz completes — real reward numbers
 * only (from the actual RewardResult the backend returned), never a
 * fabricated per-step XP figure. */
export const MissionCompleteScreen: React.FC<MissionCompleteScreenProps> = ({ lessonTitle, stepLabels, reward, skillDelta, onContinue }) => (
  <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 sm:p-8 shadow-xs space-y-5 text-center animate-in zoom-in-95 duration-200">
    <div className="space-y-1">
      <span className="text-4xl">🏆</span>
      <h1 className="text-xl font-black text-[#194E3B] font-['Nunito',sans-serif]">Mission Complete!</h1>
      <p className="text-sm font-bold text-[#3B2F27]">{lessonTitle}</p>
    </div>

    <div className="text-left bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] p-4 space-y-1.5">
      {stepLabels.map((label, i) => (
        <p key={i} className="text-xs font-semibold text-[#207559] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {label}
        </p>
      ))}
    </div>

    <div className="bg-[#B8E6D5]/40 rounded-2xl border border-[#9FD9C3] p-4 space-y-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#194E3B]">Your Rewards</p>
      <p className="text-2xl font-black text-[#194E3B] font-['Nunito',sans-serif]">+{reward.xpAwarded} XP</p>
      {reward.seedsAwarded > 0 && <p className="text-sm font-bold text-[#207559]">+{reward.seedsAwarded} 🌱 Seeds</p>}
    </div>

    {skillDelta && skillDelta.after > skillDelta.before && (
      <div className="text-xs font-bold text-[#7A341A] bg-[#FFF3E8] border border-[#F8BA9E] rounded-xl p-3">
        {skillDelta.name} +{skillDelta.after - skillDelta.before}%
      </div>
    )}

    <button onClick={onContinue} className="btn-bouncy w-full py-3.5 rounded-2xl bg-[#207559] hover:bg-[#194E3B] text-white text-sm font-black cursor-pointer">
      Continue Growing →
    </button>
  </div>
);
