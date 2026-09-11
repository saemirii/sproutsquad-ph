import React from 'react';
import { useSession, useAcademy } from '../../context/AppContext';
import { XpBar } from './shared/XpBar';
import { SeedBalance } from './shared/SeedBalance';
import { StreakBadge } from './shared/StreakBadge';
import { getPeriodKey } from '../../data/academyQuests';
import { getLevelForXp } from '../../data/academyLevels';
import type { AcademyTab } from './AcademyRoot';

interface AcademyHomeProps {
  onNavigate: (tab: AcademyTab) => void;
}

const growthStageIcon = (level: number): string => {
  if (level >= 9) return '🌳';
  if (level >= 7) return '🌸';
  if (level >= 5) return '🌷';
  if (level >= 3) return '🌿';
  if (level >= 2) return '🌱';
  return '🌰';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const AcademyHome: React.FC<AcademyHomeProps> = ({ onNavigate }) => {
  const { currentUser } = useSession();
  const { academyProfile, lessons, completedLessonIds, quests, questProgress, achievements, unlockedAchievementIds } = useAcademy();

  const nextLesson = lessons.find((l) => !completedLessonIds.includes(l.id));
  const dailyQuests = quests.filter((q) => q.questType === 'daily' && q.active);
  const dailyDone = dailyQuests.filter((q) => questProgress[`${q.id}:${getPeriodKey('daily')}`]?.completed).length;
  const recentAchievements = achievements
    .filter((a) => unlockedAchievementIds.includes(a.id))
    .sort((a, b) => b.sortOrder - a.sortOrder)
    .slice(0, 3);
  const level = getLevelForXp(academyProfile.xp);

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-xs p-6 space-y-4">
        <p className="text-sm font-black text-[#3B2F27] font-['Nunito',sans-serif]">
          🌱 {getGreeting()}, {currentUser.name.split(' ')[0]}!
        </p>
        <XpBar xp={academyProfile.xp} />
        <div className="flex items-center gap-2 flex-wrap">
          <SeedBalance seeds={academyProfile.seeds} size="sm" />
          <StreakBadge streakCount={academyProfile.streakCount} lastActivityDate={academyProfile.lastActivityDate} compact />
        </div>
      </div>

      {/* Today's Growth */}
      <button
        onClick={() => onNavigate('quests')}
        className="btn-bouncy w-full text-left bg-white rounded-3xl border border-[#EDE4D8] shadow-xs p-5 space-y-3 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#3B2F27] uppercase tracking-wider">🎯 Today's Growth</h3>
          <span className="text-[11px] font-bold text-[#207559]">{dailyDone} / {dailyQuests.length} completed</span>
        </div>
        <div className="space-y-1.5">
          {dailyQuests.map((q) => {
            const done = Boolean(questProgress[`${q.id}:${getPeriodKey('daily')}`]?.completed);
            return (
              <div key={q.id} className="flex items-center gap-2 text-xs">
                <span>{done ? '✓' : '○'}</span>
                <span className={done ? 'text-[#8C7A6D] line-through' : 'text-[#3B2F27] font-semibold'}>{q.name}</span>
              </div>
            );
          })}
        </div>
      </button>

      {/* Continue Learning */}
      {nextLesson && (
        <button
          onClick={() => onNavigate('learn')}
          className="btn-bouncy w-full text-left bg-white rounded-3xl border border-[#EDE4D8] shadow-xs p-5 flex items-center justify-between gap-3 cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6D]">📖 Continue Growing</p>
            <p className="text-sm font-black text-[#3B2F27] mt-0.5">{nextLesson.title}</p>
            <p className="text-[11px] text-[#8C7A6D]">Lesson {lessons.indexOf(nextLesson) + 1} of {lessons.length}</p>
          </div>
          <span className="shrink-0 px-4 py-2.5 rounded-2xl bg-[#B8E6D5] text-[#194E3B] text-xs font-black">Continue</span>
        </button>
      )}

      {/* Garden preview */}
      <button
        onClick={() => onNavigate('garden')}
        className="btn-bouncy w-full text-left bg-gradient-to-br from-[#A8D8EA]/40 to-[#B8E6D5]/40 rounded-3xl border border-[#EDE4D8] shadow-xs p-5 flex items-center justify-between gap-3 cursor-pointer"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#194E3B]">🌳 Your Garden</p>
          <p className="text-sm font-black text-[#3B2F27] mt-0.5">Level {level.level} — {level.title}</p>
        </div>
        <span className="text-4xl">{growthStageIcon(level.level)}</span>
      </button>

      {/* Recent achievements */}
      {recentAchievements.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-xs p-5 space-y-3">
          <h3 className="text-xs font-black text-[#3B2F27] uppercase tracking-wider">🏆 Recent Achievements</h3>
          <div className="flex items-center gap-3">
            {recentAchievements.map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-1 text-center flex-1">
                <span className="text-2xl">{a.icon}</span>
                <span className="text-[10px] font-bold text-[#3B2F27] leading-tight">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
