import {
  AcademyProfile,
  Achievement,
  AchievementRequirementType,
  GardenItem,
  GardenItemCategory,
  GardenItemRarity,
  Quest,
  QuestProgress,
  QuestType,
  SquadChallenge,
  UserGardenItem,
} from '../types';

export const rowToAcademyProfile = (row: any): AcademyProfile => ({
  xp: Number(row.xp) || 0,
  seeds: Number(row.seeds) || 0,
  streakCount: Number(row.streak_count) || 0,
  longestStreak: Number(row.longest_streak) || 0,
  lastActivityDate: row.last_activity_date || null,
  leaderboardOptIn: row.leaderboard_opt_in !== false,
});

export const rowToAchievement = (row: any): Achievement => ({
  id: row.id,
  name: row.name,
  description: row.description,
  icon: row.icon,
  category: row.category,
  requirementType: row.requirement_type as AchievementRequirementType,
  requirementValue: Number(row.requirement_value),
  rewardXp: Number(row.reward_xp),
  rewardSeeds: Number(row.reward_seeds),
  sortOrder: Number(row.sort_order) || 0,
});

export const rowToGardenItem = (row: any): GardenItem => ({
  id: row.id,
  name: row.name,
  category: row.category as GardenItemCategory,
  emoji: row.emoji,
  priceSeeds: Number(row.price_seeds),
  rarity: row.rarity as GardenItemRarity,
  seasonalTag: row.seasonal_tag || undefined,
  sortOrder: Number(row.sort_order) || 0,
});

export const rowToUserGardenItem = (row: any): UserGardenItem => ({
  itemId: row.item_id,
  equipped: Boolean(row.equipped),
  purchasedAt: row.purchased_at,
});

export const rowToQuest = (row: any): Quest => ({
  id: row.id,
  name: row.name,
  description: row.description,
  icon: row.icon,
  questType: row.quest_type as QuestType,
  activityType: row.activity_type,
  requirementValue: Number(row.requirement_value),
  rewardXp: Number(row.reward_xp),
  rewardSeeds: Number(row.reward_seeds),
  active: row.active !== false,
  sortOrder: Number(row.sort_order) || 0,
});

export const rowToQuestProgress = (row: any): QuestProgress => ({
  questId: row.quest_id,
  periodKey: row.period_key,
  progress: Number(row.progress) || 0,
  completed: Boolean(row.completed),
  claimed: Boolean(row.claimed),
});

export const rowToSquadChallenge = (row: any): SquadChallenge => ({
  id: row.id,
  businessId: row.business_id,
  name: row.name,
  description: row.description,
  icon: row.icon,
  goalLessons: Number(row.goal_lessons),
  goalQuizzes: Number(row.goal_quizzes),
  goalChallenges: Number(row.goal_challenges),
  rewardXp: Number(row.reward_xp),
  rewardSeeds: Number(row.reward_seeds),
  startsAt: row.starts_at,
  endsAt: row.ends_at,
});
