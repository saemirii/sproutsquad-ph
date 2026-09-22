import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Icon } from '../../Icon';

interface GrowthChallengeIntroProps {
  title: string;
  tagline: string;
  icon: string;
  onBegin: () => void;
  onBack: () => void;
}

/** Pure framing shown before a module checkpoint's existing
 * ChallengePlayer mounts — no new challenge logic, just a "boss battle"
 * moment before the already-built decision scenario starts. */
export const GrowthChallengeIntro: React.FC<GrowthChallengeIntroProps> = ({ title, tagline, icon, onBegin, onBack }) => (
  <div className="space-y-5">
    <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[#8C7A6D] hover:text-[#3B2F27] cursor-pointer">
      <ArrowLeft className="w-3.5 h-3.5" /> Back to module
    </button>

    <div className="bg-gradient-to-br from-[#F7C948]/25 to-[#FF8FA3]/10 rounded-3xl border-2 border-[#F7C948]/50 p-8 text-center space-y-4">
      <span className="text-4xl">🌳</span>
      <p className="text-[10px] font-black uppercase tracking-wider text-[#7A341A]">Growth Challenge</p>
      <Icon name={icon} className="w-16 h-16 mx-auto" />
      <h1 className="text-xl font-black text-[#3B2F27] font-['Nunito',sans-serif]">{title}</h1>
      <p className="text-sm text-[#6E5D52]">{tagline}</p>
      <button
        onClick={onBegin}
        className="btn-bouncy w-full py-3.5 rounded-2xl bg-[#207559] hover:bg-[#194E3B] text-white text-sm font-black cursor-pointer"
      >
        Begin Growth Challenge →
      </button>
    </div>
  </div>
);
