import React from 'react';
import { useApp } from '../../context/AppContext';
import { getPeriodKey } from '../../data/academyQuests';

const QuestCard: React.FC<{
  icon: string;
  name: string;
  rewardXp: number;
  rewardSeeds: number;
  progress: number;
  requirementValue: number;
  completed: boolean;
  claimed: boolean;
  onClaim: () => void;
}> = ({ icon, name, rewardXp, rewardSeeds, progress, requirementValue, completed, claimed, onClaim }) => (
  <div className={`p-4 rounded-2xl border flex items-center gap-3 ${claimed ? 'bg-[#FAF7F2] border-[#EDE4D8] opacity-60' : 'bg-white border-[#EDE4D8]'}`}>
    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${completed ? 'bg-[#B8E6D5] text-[#194E3B]' : 'bg-[#FAF7F2] border border-[#E5DACD]'}`}>
      {completed ? '✓' : icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-[#3B2F27] truncate">{name}</p>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-1.5 rounded-full bg-[#F0E9DF] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#B8E6D5]"
            style={{ width: `${Math.min(100, Math.round((progress / requirementValue) * 100))}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-[#8C7A6D] whitespace-nowrap">{Math.min(progress, requirementValue)}/{requirementValue}</span>
      </div>
      <p className="text-[10px] text-[#207559] font-bold mt-1">
        {rewardXp > 0 ? `+${rewardXp} XP • ` : ''}+{rewardSeeds} 🌰
      </p>
    </div>
    {completed && !claimed && (
      <button
        onClick={onClaim}
        className="btn-bouncy shrink-0 px-3 py-2 rounded-xl bg-[#207559] hover:bg-[#194E3B] text-white text-[11px] font-black cursor-pointer"
      >
        Claim
      </button>
    )}
    {claimed && <span className="text-[10px] font-bold text-[#8C7A6D] shrink-0">Claimed</span>}
  </div>
);

export const AcademyQuests: React.FC = () => {
  const { quests, questProgress, claimQuest } = useApp();

  const daily = quests.filter((q) => q.questType === 'daily' && q.active);
  const weekly = quests.filter((q) => q.questType === 'weekly' && q.active);

  const dailyDone = daily.filter((q) => questProgress[`${q.id}:${getPeriodKey('daily')}`]?.completed).length;
  const weeklyDone = weekly.filter((q) => questProgress[`${q.id}:${getPeriodKey('weekly')}`]?.completed).length;

  const renderSection = (title: string, list: typeof daily, doneCount: number) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D]">{title}</h3>
        <span className="text-[11px] font-bold text-[#207559]">{doneCount} / {list.length} completed</span>
      </div>
      <div className="space-y-2.5">
        {list.map((q) => {
          const periodKey = getPeriodKey(q.questType);
          const progress = questProgress[`${q.id}:${periodKey}`];
          return (
            <QuestCard
              key={q.id}
              icon={q.icon}
              name={q.name}
              rewardXp={q.rewardXp}
              rewardSeeds={q.rewardSeeds}
              progress={progress?.progress || 0}
              requirementValue={q.requirementValue}
              completed={Boolean(progress?.completed)}
              claimed={Boolean(progress?.claimed)}
              onClaim={() => void claimQuest(q.id, periodKey)}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-1">
        <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">🎯 Today's Growth</h2>
        <p className="text-xs text-[#7A6B5F]">Small daily and weekly goals that keep your streak alive and your garden growing.</p>
      </div>
      {renderSection('Daily Quests', daily, dailyDone)}
      {renderSection('Weekly Quests', weekly, weeklyDone)}
    </div>
  );
};
