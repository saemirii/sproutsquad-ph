import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ChallengeResult } from '../../../types';
import { Icon } from '../../Icon';

const tierColor: Record<ChallengeResult['tier'], string> = {
  Thriving: 'bg-[#EBFBF0] text-[#065F46] border-[#10B981]',
  Stable: 'bg-[#B8E6D5]/40 text-[#194E3B] border-[#71C7A5]',
  Struggling: 'bg-[#FFF3D6] text-[#7A5A17] border-[#F0C555]',
  'At Risk': 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]',
};

interface ChallengeResultCardProps {
  result: ChallengeResult;
  onRetry: () => void;
}

/** Shared result screen for both Challenge modes (simulation and case
 * study) — one consistent scoring/feedback presentation regardless of how
 * the score was computed. */
export const ChallengeResultCard: React.FC<ChallengeResultCardProps> = ({ result, onRetry }) => (
  <div className="space-y-4">
    <div className={`rounded-3xl border-2 p-6 text-center space-y-1 ${tierColor[result.tier]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Business Health</p>
      <p className="text-xl font-black font-['Nunito',sans-serif]">{result.tier}</p>
      <p className="text-xs font-bold">Score: {result.score} / 100</p>
    </div>

    <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 grid grid-cols-2 gap-4">
      {result.breakdown.map((row) => (
        <div key={row.label} className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6D]">{row.label}</p>
          <p className="text-sm font-black text-[#3B2F27]">{row.value}</p>
        </div>
      ))}
    </div>

    <div className="bg-[#FAF7F2] rounded-3xl border border-[#EDE4D8] p-5 space-y-2">
      <p className="text-xs font-bold text-[#207559]">Peanut's Takeaways</p>
      {result.feedback.map((line, i) => (
        <p key={i} className="text-xs text-[#54453C] leading-relaxed">• {line}</p>
      ))}
    </div>

    <div className="flex items-center justify-center gap-2 bg-white rounded-2xl border border-[#EDE4D8] py-3 text-xs font-black text-[#7A341A]">
      <span>+{result.xpAwarded} XP</span>
      <span className="opacity-40">•</span>
      <span className="inline-flex items-center gap-1">+{result.seedsAwarded} <Icon name="level-sprout" className="w-3.5 h-3.5" /> Seeds</span>
    </div>

    <button
      onClick={onRetry}
      className="btn-bouncy w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DACD] text-[#3B2F27] text-xs font-black cursor-pointer"
    >
      <RotateCcw className="w-3.5 h-3.5" /> Try a different strategy
    </button>
  </div>
);
