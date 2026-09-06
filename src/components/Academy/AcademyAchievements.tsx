import React from 'react';
import { useApp } from '../../context/AppContext';
import { AchievementRequirementType } from '../../types';

const REQUIREMENT_NOUN: Record<AchievementRequirementType, string> = {
  lessons_completed: 'lessons',
  streak_days: 'day streak',
  quizzes_passed: 'quizzes passed',
  perfect_quizzes: 'perfect quizzes',
  challenges_completed: 'business challenges',
  simulations_completed: 'simulations',
  path_completed: 'learning path',
};

export const AcademyAchievements: React.FC = () => {
  const { achievements, unlockedAchievementIds, activityCounts, academyProfile } = useApp();

  const countForRequirement = (type: AchievementRequirementType): number => {
    switch (type) {
      case 'lessons_completed': return activityCounts['lesson_complete'] || 0;
      case 'quizzes_passed': return (activityCounts['quiz_pass'] || 0) + (activityCounts['quiz_perfect'] || 0);
      case 'perfect_quizzes': return activityCounts['quiz_perfect'] || 0;
      case 'simulations_completed': return activityCounts['simulation_complete'] || 0;
      case 'path_completed': return activityCounts['path_complete'] || 0;
      case 'challenges_completed': return activityCounts['challenge_complete'] || 0;
      case 'streak_days': return Math.max(academyProfile.streakCount, academyProfile.longestStreak);
      default: return 0;
    }
  };

  const sorted = [...achievements].sort((a, b) => a.sortOrder - b.sortOrder);
  const unlocked = sorted.filter((a) => unlockedAchievementIds.includes(a.id));
  const locked = sorted.filter((a) => !unlockedAchievementIds.includes(a.id));

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-1">
        <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">🏆 Achievements</h2>
        <p className="text-xs text-[#7A6B5F]">{unlocked.length} of {achievements.length} badges earned</p>
      </div>

      {unlocked.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D] px-1">Earned</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unlocked.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border-2 border-[#B8E6D5] p-4 text-center space-y-1">
                <span className="text-3xl block">{a.icon}</span>
                <p className="text-xs font-bold text-[#3B2F27]">{a.name}</p>
                <p className="text-[10px] font-black text-[#207559] uppercase tracking-wider">Unlocked</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D] px-1">Locked</h3>
        <div className="space-y-2.5">
          {locked.map((a) => {
            const count = Math.min(countForRequirement(a.requirementType), a.requirementValue);
            const pct = Math.round((count / a.requirementValue) * 100);
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-[#EDE4D8] p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E5DACD] flex items-center justify-center text-lg grayscale opacity-60 shrink-0">
                  {a.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#3B2F27]">{a.name}</p>
                  <p className="text-[10px] text-[#8C7A6D] mb-1.5">{a.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[#F0E9DF] overflow-hidden">
                      <div className="h-full rounded-full bg-[#B8E6D5]" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#8C7A6D] whitespace-nowrap">
                      {pct}% — {count}/{a.requirementValue} {REQUIREMENT_NOUN[a.requirementType]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
