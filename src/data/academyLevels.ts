import { AcademyLevel } from '../types';

/**
 * Mirrors the `academy_level_number()` / `academy_level_seed_reward()`
 * SQL functions in supabase/migration_10_academy_gamification.sql — keep
 * both in sync if levels are added or thresholds change. XP is the only
 * value stored server-side; level/title are always derived from it here
 * so client and server can never drift out of sync.
 */
export const ACADEMY_LEVELS: AcademyLevel[] = [
  { level: 1, title: 'Seed', icon: '🌰', xpRequired: 0, seedReward: 0 },
  { level: 2, title: 'Seedling', icon: '🌱', xpRequired: 300, seedReward: 75 },
  { level: 3, title: 'Sprout', icon: '🌿', xpRequired: 800, seedReward: 100 },
  { level: 4, title: 'Grower', icon: '🪴', xpRequired: 1500, seedReward: 125 },
  { level: 5, title: 'Budding Entrepreneur', icon: '🌷', xpRequired: 2450, seedReward: 150 },
  { level: 6, title: 'Blooming Entrepreneur', icon: '🌸', xpRequired: 3800, seedReward: 175 },
  { level: 7, title: 'Business Builder', icon: '🌳', xpRequired: 5600, seedReward: 200 },
  { level: 8, title: 'Rooted Founder', icon: '🌲', xpRequired: 8000, seedReward: 225 },
  { level: 9, title: 'Cultivator', icon: '🌾', xpRequired: 11000, seedReward: 250 },
  { level: 10, title: 'SproutSquad Mentor', icon: '🌳', xpRequired: 15000, seedReward: 275 },
];

export const getLevelForXp = (xp: number): AcademyLevel => {
  let current = ACADEMY_LEVELS[0];
  for (const lvl of ACADEMY_LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
  }
  return current;
};

export const getNextLevel = (xp: number): AcademyLevel | null => {
  const current = getLevelForXp(xp);
  return ACADEMY_LEVELS.find((l) => l.level === current.level + 1) || null;
};

export interface LevelProgress {
  current: AcademyLevel;
  next: AcademyLevel | null;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressRatio: number; // 0-1, 1 if at max level
}

export const getLevelProgress = (xp: number): LevelProgress => {
  const current = getLevelForXp(xp);
  const next = getNextLevel(xp);

  if (!next) {
    return { current, next: null, xpIntoLevel: xp - current.xpRequired, xpForNextLevel: 0, progressRatio: 1 };
  }

  const xpIntoLevel = xp - current.xpRequired;
  const xpForNextLevel = next.xpRequired - current.xpRequired;
  return {
    current,
    next,
    xpIntoLevel,
    xpForNextLevel,
    progressRatio: xpForNextLevel > 0 ? Math.min(1, xpIntoLevel / xpForNextLevel) : 1,
  };
};
