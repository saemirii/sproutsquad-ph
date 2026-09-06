import React from 'react';

interface StreakBadgeProps {
  streakCount: number;
  lastActivityDate: string | null;
  compact?: boolean;
}

const daysSince = (isoDate: string): number => {
  const last = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - last.getTime()) / 86400000);
};

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streakCount, lastActivityDate, compact }) => {
  const gap = lastActivityDate ? daysSince(lastActivityDate) : null;
  const isLapsing = gap !== null && gap >= 2 && streakCount > 0;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FFF9E6] border border-[#EDE4D8] px-2.5 py-1 text-[11px] font-black text-[#7A341A]">
        <span>🔥</span>
        <span>{streakCount}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FFF9E6] border border-[#EDE4D8] px-3.5 py-2 text-xs font-black text-[#7A341A]">
        <span>🔥</span>
        <span>{streakCount} Day Growth Streak</span>
      </div>
      {isLapsing && (
        <p className="text-[11px] text-[#8C7A6D] italic pl-1">
          🥀 Your garden is a little thirsty! Do a quick lesson today to keep it growing.
        </p>
      )}
    </div>
  );
};
