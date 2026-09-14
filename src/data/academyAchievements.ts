import { Achievement } from '../types';

/**
 * Client-side mirror of the `academy_achievements` catalog seeded in
 * supabase/migration_10_academy_gamification.sql — used for the offline/
 * no-Supabase fallback mode and for instant render before the catalog
 * fetch resolves. Keep in sync with the migration's seed insert.
 */
// `icon` is a key into src/assets/icons/ (rendered via <Icon name={...} />).
// Only 'watered-roots' and 'fruitful-founder' have dedicated achievement
// art today — the rest reuse Academy level illustrations that fit the
// theme (sprout/grower/bloom/grove/cultivator) until dedicated art exists.
export const initialAchievements: Achievement[] = [
  { id: 'first-sprout', name: 'First Sprout', description: 'Complete your first lesson.', icon: 'level-sprout', category: 'growth', requirementType: 'lessons_completed', requirementValue: 1, rewardXp: 20, rewardSeeds: 10, sortOrder: 1 },
  { id: 'watered-roots', name: 'Watered the Roots', description: 'Maintain a 7-day learning streak.', icon: 'achievement-watered-roots', category: 'consistency', requirementType: 'streak_days', requirementValue: 7, rewardXp: 30, rewardSeeds: 20, sortOrder: 2 },
  { id: 'growing-strong', name: 'Growing Strong', description: 'Complete 10 lessons.', icon: 'level-grower', category: 'growth', requirementType: 'lessons_completed', requirementValue: 10, rewardXp: 50, rewardSeeds: 30, sortOrder: 3 },
  { id: 'first-bloom', name: 'First Bloom', description: 'Complete your first business challenge.', icon: 'level-bloom', category: 'business', requirementType: 'challenges_completed', requirementValue: 1, rewardXp: 40, rewardSeeds: 25, sortOrder: 4 },
  { id: 'deep-roots', name: 'Deep Roots', description: 'Complete an entire learning path.', icon: 'level-grove', category: 'growth', requirementType: 'path_completed', requirementValue: 1, rewardXp: 100, rewardSeeds: 50, sortOrder: 5 },
  { id: 'fruitful-founder', name: 'Fruitful Founder', description: 'Successfully complete a business simulation.', icon: 'achievement-fruitful-founder', category: 'business', requirementType: 'simulations_completed', requirementValue: 1, rewardXp: 60, rewardSeeds: 35, sortOrder: 6 },
  { id: 'evergreen-entrepreneur', name: 'Evergreen Entrepreneur', description: 'Maintain consistent learning for 30 days.', icon: 'level-cultivator', category: 'consistency', requirementType: 'streak_days', requirementValue: 30, rewardXp: 150, rewardSeeds: 100, sortOrder: 7 },
  { id: 'quiz-whiz', name: 'Quiz Whiz', description: 'Ace 5 quizzes with a perfect first-try score.', icon: 'lesson-tip-insight', category: 'knowledge', requirementType: 'perfect_quizzes', requirementValue: 5, rewardXp: 70, rewardSeeds: 40, sortOrder: 8 },
  { id: 'sharp-shooter', name: 'Sharp Shooter', description: 'Pass 20 quizzes.', icon: 'medal-1st', category: 'knowledge', requirementType: 'quizzes_passed', requirementValue: 20, rewardXp: 80, rewardSeeds: 45, sortOrder: 9 },
  { id: 'academy-graduate', name: 'Academy Graduate', description: 'Complete all 8 Academy modules.', icon: 'level-rooted-founder', category: 'growth', requirementType: 'path_completed', requirementValue: 8, rewardXp: 200, rewardSeeds: 150, sortOrder: 10 },
  { id: 'master-entrepreneur', name: 'Master Entrepreneur', description: 'Complete every module checkpoint and the final Business Challenge.', icon: 'medal-2nd', category: 'business', requirementType: 'challenges_completed', requirementValue: 9, rewardXp: 300, rewardSeeds: 200, sortOrder: 11 },
];
