import React, { useEffect } from 'react';
import { useShop, useAcademy } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';

const ProgressRow: React.FC<{ label: string; value: number; goal: number }> = ({ label, value, goal }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[11px]">
      <span className="font-bold text-[#3B2F27]">{label}</span>
      <span className="font-bold text-[#8C7A6D]">{Math.min(value, goal)} / {goal}</span>
    </div>
    <div className="h-2 rounded-full bg-[#F0E9DF] overflow-hidden">
      <div className="h-full rounded-full bg-[#B8E6D5]" style={{ width: `${Math.min(100, Math.round((value / goal) * 100))}%` }} />
    </div>
  </div>
);

export const AcademySquad: React.FC = () => {
  const { activeBusiness } = useShop();
  const { activeSquadChallenge, squadChallengeProgress, refreshSquadChallenge, claimSquadChallengeReward } = useAcademy();

  useEffect(() => {
    if (activeBusiness.id) void refreshSquadChallenge();
  }, [activeBusiness.id]);

  if (!isSupabaseConfigured) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-[#EDE4D8] shadow-xs text-center space-y-2">
        <span className="text-3xl block">🤝</span>
        <p className="text-xs font-bold text-[#3B2F27]">Squad Challenges need an online account</p>
        <p className="text-[11px] text-[#8C7A6D]">Sign in with your shop team to unlock collaborative challenges.</p>
      </div>
    );
  }

  if (!activeBusiness.id) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-[#EDE4D8] shadow-xs text-center space-y-2">
        <span className="text-3xl block">🌱</span>
        <p className="text-xs font-bold text-[#3B2F27]">Start or join a shop to unlock Squad Challenges</p>
        <p className="text-[11px] text-[#8C7A6D]">Squad Challenges are shared goals for your shop's team.</p>
      </div>
    );
  }

  if (!activeSquadChallenge || !squadChallengeProgress) {
    return <p className="text-xs text-[#8C7A6D] text-center py-8">Loading your squad's challenge...</p>;
  }

  const overallPct = Math.round(
    ((Math.min(squadChallengeProgress.lessons, activeSquadChallenge.goalLessons) +
      Math.min(squadChallengeProgress.quizzes, activeSquadChallenge.goalQuizzes) +
      Math.min(squadChallengeProgress.challenges, activeSquadChallenge.goalChallenges)) /
      (activeSquadChallenge.goalLessons + activeSquadChallenge.goalQuizzes + activeSquadChallenge.goalChallenges)) *
      100
  );

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-1">
        <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">🤝 Squad Challenges</h2>
        <p className="text-xs text-[#7A6B5F]">Grow together with {activeBusiness.name}'s team.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{activeSquadChallenge.icon}</span>
          <div>
            <h3 className="text-sm font-black text-[#3B2F27]">{activeSquadChallenge.name}</h3>
            <p className="text-[11px] text-[#8C7A6D]">{activeSquadChallenge.description}</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#194E3B]">SQUAD PROGRESS</span>
            <span className="font-bold text-[#194E3B]">{overallPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-[#F0E9DF] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#B8E6D5] to-[#71C7A5]" style={{ width: `${overallPct}%` }} />
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <ProgressRow label="📚 Lessons" value={squadChallengeProgress.lessons} goal={activeSquadChallenge.goalLessons} />
          <ProgressRow label="🧠 Quizzes" value={squadChallengeProgress.quizzes} goal={activeSquadChallenge.goalQuizzes} />
          <ProgressRow label="💼 Business Challenges" value={squadChallengeProgress.challenges} goal={activeSquadChallenge.goalChallenges} />
        </div>

        {squadChallengeProgress.completed && (
          <div className="bg-[#EBFBF0] border border-[#10B981]/40 rounded-2xl p-4 text-center space-y-2">
            <p className="text-sm font-black text-[#065F46]">🌸 YOUR SQUAD BLOOMED!</p>
            {squadChallengeProgress.claimedByMe ? (
              <p className="text-[11px] font-bold text-[#207559]">You've claimed your reward.</p>
            ) : squadChallengeProgress.myContribution > 0 ? (
              <button
                onClick={() => void claimSquadChallengeReward()}
                className="btn-bouncy px-5 py-2.5 rounded-2xl bg-[#207559] hover:bg-[#194E3B] text-white text-xs font-black cursor-pointer"
              >
                Claim +{activeSquadChallenge.rewardXp} XP • +{activeSquadChallenge.rewardSeeds} 🌰
              </button>
            ) : (
              <p className="text-[11px] text-[#8C7A6D]">Only members who contributed can claim this reward.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
