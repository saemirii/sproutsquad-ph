import React, { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useAcademy } from '../../context/AppContext';
import { Lesson, Challenge, ChallengeResult } from '../../types';
import { getLessonsForModule, getCheckpointForModule, finalChallenge } from '../../data/academy';
import { Icon } from '../Icon';
import { ModuleDetail } from './ModuleDetail';
import { LessonReader } from './LessonReader';
import { ChallengePlayer } from './ChallengePlayer';
import { GrowthChallengeIntro } from './shared/GrowthChallengeIntro';
import { MilestoneScreen } from './shared/MilestoneScreen';

type CurriculumView =
  | { kind: 'modules' }
  | { kind: 'module'; moduleId: string }
  | { kind: 'lesson'; moduleId: string; lesson: Lesson }
  | { kind: 'checkpoint-intro'; moduleId: string; challenge: Challenge }
  | { kind: 'checkpoint'; moduleId: string; challenge: Challenge; wasCompletedBefore: boolean }
  | { kind: 'final-challenge-intro' }
  | { kind: 'final-challenge'; wasCompletedBefore: boolean }
  | { kind: 'milestone'; moduleTitle: string; lessonTitles: string[]; result: ChallengeResult; backTo: CurriculumView };

interface AcademyCurriculumProps {
  onOpenSimulations: () => void;
  initialModuleId?: string;
}

export const AcademyCurriculum: React.FC<AcademyCurriculumProps> = ({ onOpenSimulations, initialModuleId }) => {
  const { modules, completedLessonIds, completedChallengeIds, isModuleUnlocked } = useAcademy();
  const [view, setView] = useState<CurriculumView>(
    initialModuleId ? { kind: 'module', moduleId: initialModuleId } : { kind: 'modules' }
  );
  // Set the moment a challenge's reward is actually awarded (via
  // ChallengePlayer's onComplete) — deliberately NOT derived from
  // `lastReward`/completedChallengeIds, both of which are unreliable here:
  // lastReward gets auto-cleared by RewardToast's own 2.6s timer long
  // before a learner finishes reading the result screen, and
  // completedChallengeIds can lag a beat behind the actual award.
  const [pendingCompletion, setPendingCompletion] = useState<ChallengeResult | null>(null);

  if (view.kind === 'lesson') {
    return <LessonReader lesson={view.lesson} onBack={() => setView({ kind: 'module', moduleId: view.moduleId })} />;
  }

  if (view.kind === 'checkpoint-intro') {
    return (
      <GrowthChallengeIntro
        title={view.challenge.title}
        tagline={view.challenge.tagline}
        icon={view.challenge.icon}
        onBegin={() => {
          setPendingCompletion(null);
          setView({
            kind: 'checkpoint',
            moduleId: view.moduleId,
            challenge: view.challenge,
            wasCompletedBefore: completedChallengeIds.includes(view.challenge.id),
          });
        }}
        onBack={() => setView({ kind: 'module', moduleId: view.moduleId })}
      />
    );
  }

  if (view.kind === 'checkpoint') {
    const { moduleId, challenge, wasCompletedBefore } = view;
    return (
      <ChallengePlayer
        challenge={challenge}
        onComplete={setPendingCompletion}
        onBack={() => {
          if (!wasCompletedBefore && pendingCompletion) {
            const module = modules.find((m) => m.id === moduleId);
            const lessonTitles = module ? getLessonsForModule(module.id).map((l) => l.title) : [];
            setView({
              kind: 'milestone',
              moduleTitle: module?.title || challenge.title,
              lessonTitles,
              result: pendingCompletion,
              backTo: { kind: 'module', moduleId },
            });
          } else {
            setView({ kind: 'module', moduleId });
          }
        }}
      />
    );
  }

  if (view.kind === 'final-challenge-intro') {
    return (
      <GrowthChallengeIntro
        title={finalChallenge.title}
        tagline={finalChallenge.tagline}
        icon={finalChallenge.icon}
        onBegin={() => {
          setPendingCompletion(null);
          setView({ kind: 'final-challenge', wasCompletedBefore: completedChallengeIds.includes(finalChallenge.id) });
        }}
        onBack={() => setView({ kind: 'modules' })}
      />
    );
  }

  if (view.kind === 'final-challenge') {
    const { wasCompletedBefore } = view;
    return (
      <ChallengePlayer
        challenge={finalChallenge}
        onComplete={setPendingCompletion}
        onBack={() => {
          if (!wasCompletedBefore && pendingCompletion) {
            setView({
              kind: 'milestone',
              moduleTitle: 'The SproutSquad Business Challenge',
              lessonTitles: modules.map((m) => m.title),
              result: pendingCompletion,
              backTo: { kind: 'modules' },
            });
          } else {
            setView({ kind: 'modules' });
          }
        }}
      />
    );
  }

  if (view.kind === 'milestone') {
    return (
      <MilestoneScreen
        moduleTitle={view.moduleTitle}
        lessonTitles={view.lessonTitles}
        reward={{ xpAwarded: view.result.xpAwarded, seedsAwarded: view.result.seedsAwarded }}
        onContinue={() => setView(view.backTo)}
      />
    );
  }

  if (view.kind === 'module') {
    const module = modules.find((m) => m.id === view.moduleId);
    if (!module) return null;
    const lessons = getLessonsForModule(module.id);
    const checkpoint = getCheckpointForModule(module.id);
    return (
      <ModuleDetail
        module={module}
        lessons={lessons}
        checkpoint={checkpoint}
        onBack={() => setView({ kind: 'modules' })}
        onOpenLesson={(lesson) => setView({ kind: 'lesson', moduleId: module.id, lesson })}
        onOpenCheckpoint={(challenge) => setView({ kind: 'checkpoint-intro', moduleId: module.id, challenge })}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white p-6 rounded-3xl border border-[#EDE4D8] shadow-xs flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#FFD3BA] border border-[#F8BA9E] flex items-center justify-center shadow-xs shrink-0">
          <Icon name="mascot-owl" className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#3B2F27] font-['Nunito',sans-serif]">SproutSquad Academy</h2>
          <p className="text-xs text-[#6B5B4F] mt-0.5">8 modules, built for Philippine student founders</p>
        </div>
      </div>

      <div className="space-y-3">
        {modules.map((module) => {
          const lessons = getLessonsForModule(module.id);
          const doneCount = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const checkpoint = getCheckpointForModule(module.id);
          const checkpointDone = checkpoint ? completedChallengeIds.includes(checkpoint.id) : false;
          const unlocked = isModuleUnlocked(module.id);

          return (
            <button
              key={module.id}
              onClick={() => unlocked && setView({ kind: 'module', moduleId: module.id })}
              disabled={!unlocked}
              className={`btn-bouncy w-full text-left flex items-center gap-3.5 bg-white rounded-3xl border p-5 cursor-pointer disabled:cursor-not-allowed transition-all ${
                unlocked ? 'border-[#EDE4D8] hover:border-[#B8E6D5]' : 'border-[#EDE4D8] opacity-60'
              }`}
            >
              <span className="w-12 h-12 rounded-2xl bg-[#F2FBF7] flex items-center justify-center shrink-0">
                {unlocked ? <Icon name={module.icon} className="w-7 h-7" /> : <Lock className="w-5 h-5 text-[#A39284]" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#8C7A6D]">Module {module.number} • {module.stage}</p>
                <h3 className="font-bold text-sm text-[#3B2F27] truncate">{module.title}</h3>
                <p className="text-[11px] text-[#8C7A6D] truncate">
                  {unlocked ? `${doneCount} / ${lessons.length} missions` : 'Finish the previous module\'s Growth Challenge to unlock'}
                </p>
              </div>
              {checkpointDone && (
                <span className="shrink-0 w-7 h-7 rounded-full bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {(() => {
        const allCheckpointIds = modules.map((m) => m.checkpointId);
        const allModulesDone = allCheckpointIds.length > 0 && allCheckpointIds.every((id) => completedChallengeIds.includes(id));
        const finalDone = completedChallengeIds.includes(finalChallenge.id);
        return (
          <button
            onClick={() => allModulesDone && setView({ kind: 'final-challenge-intro' })}
            disabled={!allModulesDone}
            className={`btn-bouncy w-full flex items-center justify-between gap-2 p-5 rounded-2xl border cursor-pointer disabled:cursor-not-allowed ${
              finalDone ? 'bg-[#EBFBF0] border-[#10B981]/40' : allModulesDone ? 'bg-gradient-to-r from-[#F7C948]/30 to-[#FF8FA3]/20 border-[#F7C948]' : 'bg-[#FAF7F2] border-[#EDE4D8] opacity-60'
            }`}
          >
            <div className="text-left">
              <p className="text-xs font-black text-[#7A341A] flex items-center gap-1.5">
                {allModulesDone ? <Icon name="level-grove" className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                The SproutSquad Business Challenge
              </p>
              <p className="text-[10px] text-[#8C5A3E]">
                {finalDone ? 'Completed — you can retry anytime' : allModulesDone ? 'All 21 decisions, one business, start to finish' : 'Finish every module\'s Growth Challenge to unlock'}
              </p>
            </div>
            <span className="text-lg">→</span>
          </button>
        );
      })()}

      <button
        onClick={onOpenSimulations}
        className="btn-bouncy w-full flex items-center justify-between gap-2 p-4 rounded-2xl bg-[#FFD3BA]/40 border border-[#F8BA9E] cursor-pointer"
      >
        <div className="text-left">
          <p className="text-xs font-black text-[#7A341A] flex items-center gap-1.5">
            <Icon name="leaderboard-business-builder" className="w-4 h-4" /> Practice anytime
          </p>
          <p className="text-[10px] text-[#8C5A3E]">Try an optional business simulation</p>
        </div>
        <span className="text-lg">→</span>
      </button>
    </div>
  );
};
