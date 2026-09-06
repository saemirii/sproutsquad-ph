import { Quest } from '../types';

/**
 * Client-side mirror of the `academy_quests` catalog seeded in
 * supabase/migration_10_academy_gamification.sql — used for the offline/
 * no-Supabase fallback mode and for instant render before the catalog
 * fetch resolves. Keep in sync with the migration's seed insert.
 */
export const initialQuests: Quest[] = [
  { id: 'daily-lesson', name: 'Complete 1 lesson', description: 'Finish any one Academy lesson today.', icon: '📚', questType: 'daily', activityType: 'lesson_complete', requirementValue: 1, rewardXp: 30, rewardSeeds: 20, active: true, sortOrder: 1 },
  { id: 'daily-quiz', name: 'Pass a quiz', description: 'Get a lesson quiz right today.', icon: '🧠', questType: 'daily', activityType: 'quiz_pass', requirementValue: 1, rewardXp: 50, rewardSeeds: 30, active: true, sortOrder: 2 },
  { id: 'daily-challenge', name: 'Complete a business challenge', description: 'Finish a business simulation today.', icon: '💼', questType: 'daily', activityType: 'challenge_complete', requirementValue: 1, rewardXp: 100, rewardSeeds: 50, active: true, sortOrder: 3 },
  { id: 'daily-streak', name: 'Maintain your growth streak', description: 'Do any qualifying activity today.', icon: '🔥', questType: 'daily', activityType: 'streak_maintain', requirementValue: 1, rewardXp: 0, rewardSeeds: 10, active: true, sortOrder: 4 },
  { id: 'weekly-lessons', name: 'Complete 5 lessons', description: 'Finish 5 Academy lessons this week.', icon: '📖', questType: 'weekly', activityType: 'lesson_complete', requirementValue: 5, rewardXp: 150, rewardSeeds: 100, active: true, sortOrder: 5 },
  { id: 'weekly-quizzes', name: 'Pass 3 quizzes', description: 'Get 3 lesson quizzes right this week.', icon: '🧠', questType: 'weekly', activityType: 'quiz_pass', requirementValue: 3, rewardXp: 180, rewardSeeds: 120, active: true, sortOrder: 6 },
  { id: 'weekly-challenge', name: 'Complete 2 business challenges', description: 'Finish 2 business simulations this week.', icon: '💼', questType: 'weekly', activityType: 'challenge_complete', requirementValue: 2, rewardXp: 300, rewardSeeds: 150, active: true, sortOrder: 7 },
  { id: 'weekly-perfect', name: 'Get 3 perfect quiz scores', description: 'Answer 3 quizzes correctly on the first try this week.', icon: '🎯', questType: 'weekly', activityType: 'quiz_perfect', requirementValue: 3, rewardXp: 180, rewardSeeds: 100, active: true, sortOrder: 8 },
];

/** Mirrors academy_period_key() in the migration. */
export const getPeriodKey = (questType: 'daily' | 'weekly', at: Date = new Date()): string => {
  if (questType === 'daily') {
    return at.toISOString().slice(0, 10);
  }
  // ISO week number, formatted like the SQL "IYYY-W IW" mask, e.g. 2026-W37
  const d = new Date(Date.UTC(at.getFullYear(), at.getMonth(), at.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};
