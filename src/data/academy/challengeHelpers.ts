import { ChallengeResult } from '../../types';

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Shared tier/reward curve for every Challenge (simulation or case study) —
 * one 0-100 score always maps to the same tier language and reward scale,
 * so students learn one consistent feedback system across all module
 * checkpoints and the final Business Challenge. */
export const scoreToTierAndReward = (score: number): Pick<ChallengeResult, 'tier' | 'xpAwarded' | 'seedsAwarded'> => {
  const s = clamp(Math.round(score), 0, 100);
  if (s >= 80) return { tier: 'Thriving', xpAwarded: 150, seedsAwarded: 100 };
  if (s >= 60) return { tier: 'Stable', xpAwarded: 100, seedsAwarded: 70 };
  if (s >= 40) return { tier: 'Struggling', xpAwarded: 60, seedsAwarded: 40 };
  return { tier: 'At Risk', xpAwarded: 30, seedsAwarded: 20 };
};

/** Converts a case study's summed choice scores into the shared
 * ChallengeResult shape — the counterpart to a simulation's own compute(). */
export const caseStudyScoreToResult = (
  totalScore: number,
  maxPossibleScore: number,
  breakdown: { label: string; value: string }[],
  feedback: string[]
): ChallengeResult => {
  const pct = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const { tier, xpAwarded, seedsAwarded } = scoreToTierAndReward(pct);
  return { score: Math.round(clamp(pct, 0, 100)), tier, breakdown, feedback, xpAwarded, seedsAwarded };
};
