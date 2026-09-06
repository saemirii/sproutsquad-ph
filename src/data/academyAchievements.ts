import { Achievement } from '../types';

/**
 * Client-side mirror of the `academy_achievements` catalog seeded in
 * supabase/migration_10_academy_gamification.sql — used for the offline/
 * no-Supabase fallback mode and for instant render before the catalog
 * fetch resolves. Keep in sync with the migration's seed insert.
 */
export const initialAchievements: Achievement[] = [
  { id: 'first-sprout', name: 'First Sprout', description: 'Complete your first lesson.', icon: '🌱', category: 'growth', requirementType: 'lessons_completed', requirementValue: 1, rewardXp: 20, rewardSeeds: 10, sortOrder: 1 },
  { id: 'watered-roots', name: 'Watered the Roots', description: 'Maintain a 7-day learning streak.', icon: '💧', category: 'consistency', requirementType: 'streak_days', requirementValue: 7, rewardXp: 30, rewardSeeds: 20, sortOrder: 2 },
  { id: 'growing-strong', name: 'Growing Strong', description: 'Complete 10 lessons.', icon: '🌿', category: 'growth', requirementType: 'lessons_completed', requirementValue: 10, rewardXp: 50, rewardSeeds: 30, sortOrder: 3 },
  { id: 'first-bloom', name: 'First Bloom', description: 'Complete your first business challenge.', icon: '🌸', category: 'business', requirementType: 'challenges_completed', requirementValue: 1, rewardXp: 40, rewardSeeds: 25, sortOrder: 4 },
  { id: 'deep-roots', name: 'Deep Roots', description: 'Complete an entire learning path.', icon: '🌳', category: 'growth', requirementType: 'path_completed', requirementValue: 1, rewardXp: 100, rewardSeeds: 50, sortOrder: 5 },
  { id: 'fruitful-founder', name: 'Fruitful Founder', description: 'Successfully complete a business simulation.', icon: '🍎', category: 'business', requirementType: 'simulations_completed', requirementValue: 1, rewardXp: 60, rewardSeeds: 35, sortOrder: 6 },
  { id: 'evergreen-entrepreneur', name: 'Evergreen Entrepreneur', description: 'Maintain consistent learning for 30 days.', icon: '🌲', category: 'consistency', requirementType: 'streak_days', requirementValue: 30, rewardXp: 150, rewardSeeds: 100, sortOrder: 7 },
  { id: 'quiz-whiz', name: 'Quiz Whiz', description: 'Ace 5 quizzes with a perfect first-try score.', icon: '🧠', category: 'knowledge', requirementType: 'perfect_quizzes', requirementValue: 5, rewardXp: 70, rewardSeeds: 40, sortOrder: 8 },
  { id: 'sharp-shooter', name: 'Sharp Shooter', description: 'Pass 20 quizzes.', icon: '🎯', category: 'knowledge', requirementType: 'quizzes_passed', requirementValue: 20, rewardXp: 80, rewardSeeds: 45, sortOrder: 9 },
];
