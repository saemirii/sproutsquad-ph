import React from 'react';
import { getLevelProgress } from '../../../data/academyLevels';

interface XpBarProps {
  xp: number;
  compact?: boolean;
}

export const XpBar: React.FC<XpBarProps> = ({ xp, compact }) => {
  const { current, next, xpIntoLevel, xpForNextLevel, progressRatio } = getLevelProgress(xp);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={compact ? 'text-base' : 'text-xl'}>{current.icon}</span>
          <div>
            <p className={`font-black text-[#3B2F27] font-['Nunito',sans-serif] leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>
              Level {current.level} — {current.title}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#8C7A6D] whitespace-nowrap">
          {next ? `${xpIntoLevel.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP` : 'Max Level'}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-[#F0E9DF] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#B8E6D5] to-[#71C7A5] transition-all duration-500"
          style={{ width: `${Math.round(progressRatio * 100)}%` }}
        />
      </div>
      {!compact && (
        <p className="text-[10px] text-[#8C7A6D]">
          {next ? `Next: ${next.icon} ${next.title}` : "You've reached the top of the Academy!"}
        </p>
      )}
    </div>
  );
};
