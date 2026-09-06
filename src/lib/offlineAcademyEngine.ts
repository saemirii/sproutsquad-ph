import {
  AcademyProfile,
  Achievement,
  GardenItem,
  Quest,
  QuestProgress,
  RewardResult,
  UserGardenItem,
} from '../types';
import { ACADEMY_LEVELS, getLevelForXp } from '../data/academyLevels';
import { initialAchievements } from '../data/academyAchievements';
import { initialGardenItems } from '../data/gardenItems';
import { getPeriodKey } from '../data/academyQuests';

/**
 * A same-shape reimplementation of migration_10_academy_gamification.sql's
 * RPCs, for the app's offline/no-Supabase local-account mode. Every other
 * feature in this app has an offline fallback (see AppContext.tsx), so
 * gamification follows the same convention — just without server-side
 * enforcement, since there's no server to enforce anything against in that
 * mode. Keep the streak/level/quest/achievement math here in sync with the
 * SQL functions if either changes.
 */
export interface OfflineAcademyState {
  profile: AcademyProfile;
  /** `${activityType}:${refId}` -> true, once claimed. The anti-double-claim ledger. */
  claimedActivities: Record<string, boolean>;
  unlockedAchievementIds: string[];
  ownedGardenItems: UserGardenItem[];
  /** `${questId}:${periodKey}` -> progress */
  questProgress: Record<string, QuestProgress>;
}

export const createEmptyOfflineAcademyState = (): OfflineAcademyState => ({
  profile: { xp: 0, seeds: 0, streakCount: 0, longestStreak: 0, lastActivityDate: null, leaderboardOptIn: true },
  claimedActivities: {},
  unlockedAchievementIds: [],
  ownedGardenItems: [],
  questProgress: {},
});

const dateOnly = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (isoDate: string, days: number) => {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return dateOnly(d);
};

const bumpQuest = (state: OfflineAcademyState, quests: Quest[], activityType: string): OfflineAcademyState => {
  let questProgress = state.questProgress;
  for (const q of quests) {
    if (!q.active || q.activityType !== activityType) continue;
    const period = getPeriodKey(q.questType);
    const key = `${q.id}:${period}`;
    const existing = questProgress[key] || { questId: q.id, periodKey: period, progress: 0, completed: false, claimed: false };
    if (existing.completed) continue;
    const progress = existing.progress + 1;
    const completed = progress >= q.requirementValue;
    questProgress = { ...questProgress, [key]: { ...existing, progress, completed } };
  }
  return { ...state, questProgress };
};

const achievementCount = (state: OfflineAcademyState, a: Achievement): number => {
  const prefixCounts = (types: string[]) =>
    Object.keys(state.claimedActivities).filter((k) => types.some((t) => k.startsWith(`${t}:`))).length;

  switch (a.requirementType) {
    case 'lessons_completed':
      return prefixCounts(['lesson_complete']);
    case 'quizzes_passed':
      return prefixCounts(['quiz_pass', 'quiz_perfect']);
    case 'perfect_quizzes':
      return prefixCounts(['quiz_perfect']);
    case 'simulations_completed':
      return prefixCounts(['simulation_complete']);
    case 'path_completed':
      return prefixCounts(['path_complete']);
    case 'challenges_completed':
      return prefixCounts(['challenge_complete']);
    case 'streak_days':
      return Math.max(state.profile.streakCount, state.profile.longestStreak);
    default:
      return 0;
  }
};

const checkAchievements = (state: OfflineAcademyState, achievements: Achievement[]): OfflineAcademyState => {
  let next = state;
  for (const a of achievements) {
    if (next.unlockedAchievementIds.includes(a.id)) continue;
    if (achievementCount(next, a) >= a.requirementValue) {
      next = {
        ...next,
        unlockedAchievementIds: [...next.unlockedAchievementIds, a.id],
        profile: { ...next.profile, xp: next.profile.xp + a.rewardXp, seeds: next.profile.seeds + a.rewardSeeds },
      };
    }
  }
  return next;
};

export const awardLearningActivityOffline = (
  state: OfflineAcademyState,
  activityType: string,
  refId: string,
  xp: number,
  seeds: number,
  quests: Quest[] = [],
  achievements: Achievement[] = initialAchievements
): { state: OfflineAcademyState; result: RewardResult } => {
  const key = `${activityType}:${refId}`;
  const xpGain = Math.max(0, xp || 0);
  const seedsGain = Math.max(0, seeds || 0);

  if (state.claimedActivities[key]) {
    return {
      state,
      result: {
        xpAwarded: 0,
        seedsAwarded: 0,
        newStreak: state.profile.streakCount,
        leveledUp: false,
        newLevel: getLevelForXp(state.profile.xp).level,
        levelSeedBonus: 0,
      },
    };
  }

  const today = dateOnly(new Date());
  const { lastActivityDate } = state.profile;
  let streakCount = state.profile.streakCount;
  if (!lastActivityDate || lastActivityDate < addDays(today, -1)) {
    streakCount = 1;
  } else if (lastActivityDate === addDays(today, -1)) {
    streakCount += 1;
  } // else same-day activity: unchanged

  const longestStreak = Math.max(state.profile.longestStreak, streakCount);

  const levelBefore = getLevelForXp(state.profile.xp).level;
  const levelAfter = getLevelForXp(state.profile.xp + xpGain).level;
  let levelSeedBonus = 0;
  if (levelAfter > levelBefore) {
    for (const lvl of ACADEMY_LEVELS) {
      if (lvl.level > levelBefore && lvl.level <= levelAfter) levelSeedBonus += lvl.seedReward;
    }
  }

  let nextState: OfflineAcademyState = {
    ...state,
    claimedActivities: { ...state.claimedActivities, [key]: true },
    profile: {
      ...state.profile,
      xp: state.profile.xp + xpGain,
      seeds: state.profile.seeds + seedsGain + levelSeedBonus,
      streakCount,
      longestStreak,
      lastActivityDate: today,
    },
  };

  nextState = bumpQuest(nextState, quests, activityType);
  nextState = bumpQuest(nextState, quests, 'streak_maintain');
  nextState = checkAchievements(nextState, achievements);

  return {
    state: nextState,
    result: {
      xpAwarded: xpGain,
      seedsAwarded: seedsGain + levelSeedBonus,
      newStreak: streakCount,
      leveledUp: levelAfter > levelBefore,
      newLevel: levelAfter,
      levelSeedBonus,
    },
  };
};

export const purchaseGardenItemOffline = (
  state: OfflineAcademyState,
  itemId: string,
  catalog: GardenItem[] = initialGardenItems
): { state: OfflineAcademyState; error?: string } => {
  const item = catalog.find((i) => i.id === itemId);
  if (!item) return { state, error: 'Unknown garden item' };
  if (state.ownedGardenItems.some((o) => o.itemId === itemId)) return { state, error: 'Item already owned' };
  if (state.profile.seeds < item.priceSeeds) return { state, error: 'Not enough Seeds' };

  return {
    state: {
      ...state,
      profile: { ...state.profile, seeds: state.profile.seeds - item.priceSeeds },
      ownedGardenItems: [...state.ownedGardenItems, { itemId, equipped: false, purchasedAt: new Date().toISOString() }],
    },
  };
};

export const equipGardenItemOffline = (state: OfflineAcademyState, itemId: string, equip: boolean): OfflineAcademyState => ({
  ...state,
  ownedGardenItems: state.ownedGardenItems.map((o) => (o.itemId === itemId ? { ...o, equipped: equip } : o)),
});

export const claimQuestRewardOffline = (
  state: OfflineAcademyState,
  questId: string,
  periodKey: string,
  quests: Quest[]
): { state: OfflineAcademyState; result: RewardResult } => {
  const key = `${questId}:${periodKey}`;
  const progress = state.questProgress[key];
  const quest = quests.find((q) => q.id === questId);

  if (!progress || !quest || !progress.completed || progress.claimed) {
    return { state, result: { xpAwarded: 0, seedsAwarded: 0 } };
  }

  return {
    state: {
      ...state,
      questProgress: { ...state.questProgress, [key]: { ...progress, claimed: true } },
      profile: { ...state.profile, xp: state.profile.xp + quest.rewardXp, seeds: state.profile.seeds + quest.rewardSeeds },
    },
    result: { xpAwarded: quest.rewardXp, seedsAwarded: quest.rewardSeeds },
  };
};
