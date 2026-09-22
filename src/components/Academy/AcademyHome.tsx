import React from 'react';
import { useSession, useAcademy } from '../../context/AppContext';
import { XpBar } from './shared/XpBar';
import { SeedBalance } from './shared/SeedBalance';
import { StreakBadge } from './shared/StreakBadge';
import { getPeriodKey } from '../../data/academyQuests';
import { getLevelForXp } from '../../data/academyLevels';
import { getSkillMastery } from '../../data/academySkills';
import { Icon } from '../Icon';
import { SkillMasteryBars } from './shared/SkillMasteryBars';
import type { AcademyTab } from './AcademyRoot';

interface AcademyHomeProps {
  onNavigate: (tab: AcademyTab, moduleId?: string) => void;
}

const growthStageIcon = (level: number): string => {
  if (level >= 9) return 'level-grove';
  if (level >= 7) return 'level-bloom';
  if (level >= 5) return 'level-bud';
  if (level >= 3) return 'level-sprout';
  if (level >= 2) return 'tab-academy';
  return 'level-sprout';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const AcademyHome: React.FC<AcademyHomeProps> = ({ onNavigate }) => {
  const { currentUser } = useSession();
  const { academyProfile, modules, lessons, completedLessonIds, completedChallengeIds, isModuleUnlocked, quests, questProgress, achievements, unlockedAchievementIds } = useAcademy();

  const orderedUnlockedLessons = modules
    .filter((m) => isModuleUnlocked(m.id))
    .flatMap((m) => lessons.filter((l) => l.moduleId === m.id));
  const nextLesson = orderedUnlockedLessons.find((l) => !completedLessonIds.includes(l.id));
  const nextModule = nextLesson ? modules.find((m) => m.id === nextLesson.moduleId) : undefined;

  const dailyQuests = quests.filter((q) => q.questType === 'daily' && q.active);
  const dailyDone = dailyQuests.filter((q) => questProgress[`${q.id}:${getPeriodKey('daily')}`]?.completed).length;
  const recentAchievements = achievements
    .filter((a) => unlockedAchievementIds.includes(a.id))
    .sort((a, b) => b.sortOrder - a.sortOrder)
    .slice(0, 3);
  const level = getLevelForXp(academyProfile.xp);
  const skillMastery = getSkillMastery(modules, completedLessonIds, completedChallengeIds);

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-xs p-6 space-y-4">
        <p className="text-sm font-black text-[#3B2F27] font-['Nunito',sans-serif] flex items-center gap-1.5">
          <Icon name="level-sprout" className="w-4 h-4" /> {getGreeting()}, {currentUser.name.split(' ')[0]}!
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
          <h3 className="text-xs font-black text-[#3B2F27] uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="quests-header" className="w-3.5 h-3.5" /> Today's Growth
          </h3>
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
      {nextLesson && nextModule && (
        <button
          onClick={() => onNavigate('learn', nextModule.id)}
          className="btn-bouncy w-full text-left bg-white rounded-3xl border border-[#EDE4D8] shadow-xs p-5 flex items-center justify-between gap-3 cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6D] flex items-center gap-1">
              <Icon name="lesson-continue-learning" className="w-3 h-3" /> Continue Growing
            </p>
            <p className="text-sm font-black text-[#3B2F27] mt-0.5">{nextLesson.title}</p>
            <p className="text-[11px] text-[#8C7A6D]">Module {nextModule.number} • {nextModule.title}</p>
          </div>
          <span className="shrink-0 px-4 py-2.5 rounded-2xl bg-[#B8E6D5] text-[#194E3B] text-xs font-black">Continue</span>
        </button>
      )}

      {/* Business Skills */}
      <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-xs p-5 space-y-3">
        <h3 className="text-xs font-black text-[#3B2F27] uppercase tracking-wider flex items-center gap-1.5">
          <Icon name="level-sprout" className="w-3.5 h-3.5" /> Business Skills
        </h3>
        <SkillMasteryBars skills={skillMastery} />
      </div>

      {/* Garden preview */}
      <button
        onClick={() => onNavigate('garden')}
        className="btn-bouncy w-full text-left bg-gradient-to-br from-[#A8D8EA]/40 to-[#B8E6D5]/40 rounded-3xl border border-[#EDE4D8] shadow-xs p-5 flex items-center justify-between gap-3 cursor-pointer"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#194E3B] flex items-center gap-1">
            <Icon name="level-grove" className="w-3 h-3" /> Your Garden
          </p>
          <p className="text-sm font-black text-[#3B2F27] mt-0.5">Level {level.level} — {level.title}</p>
        </div>
        <Icon name={growthStageIcon(level.level)} className="w-12 h-12" />
      </button>

      {/* Recent achievements */}
      {recentAchievements.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-xs p-5 space-y-3">
          <h3 className="text-xs font-black text-[#3B2F27] uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="achievements-header" className="w-3.5 h-3.5" /> Recent Achievements
          </h3>
          <div className="flex items-center gap-3">
            {recentAchievements.map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-1 text-center flex-1">
                <Icon name={a.icon} alt={a.name} className="w-8 h-8" />
                <span className="text-[10px] font-bold text-[#3B2F27] leading-tight">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
