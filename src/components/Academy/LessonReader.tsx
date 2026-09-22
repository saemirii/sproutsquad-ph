import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { useAcademy, useSession } from '../../context/AppContext';
import { Lesson, RewardResult } from '../../types';
import { ACADEMY_SKILLS, getSkillMastery } from '../../data/academySkills';
import { Icon } from '../Icon';
import { QuizRunner } from './QuizRunner';
import { RichText } from './shared/RichText';
import { LessonIllustration } from './shared/LessonIllustrations';
import { MissionProgress } from './shared/MissionProgress';
import { MissionCompleteScreen } from './shared/MissionCompleteScreen';

interface LessonReaderProps {
  lesson: Lesson;
  onBack: () => void;
}

interface LessonStep {
  key: string;
  label: string;
  render: () => React.ReactNode;
}

interface SkillDelta {
  name: string;
  before: number;
  after: number;
}

/** Paginating into one focused step at a time (instead of one long scroll
 * of hook → explanation → concept → activity → scenario → shop tie-in →
 * quiz stacked together) is what actually fixes the "too wordy" feeling —
 * each screen only ever shows one chunk of content. Framed as a mission's
 * challenges rather than plain "steps," ending in a Mission Complete
 * screen instead of just dropping the learner back to the module. */
export const LessonReader: React.FC<LessonReaderProps> = ({ lesson, onBack }) => {
  const { modules, completedLessonIds, completedChallengeIds, completeLessonWithQuiz, clearLastReward } = useAcademy();
  const { setSellerTab, setCurrentView } = useSession();
  const isCompleted = completedLessonIds.includes(lesson.id);
  const [stepIndex, setStepIndex] = useState(0);
  const [revealedBeats, setRevealedBeats] = useState(1);
  const [missionComplete, setMissionComplete] = useState<{ reward: RewardResult; skillDelta: SkillDelta | null } | null>(null);

  const handleShopOsTieIn = () => {
    if (!lesson.shopOsTieIn?.deepLink) return;
    setCurrentView('seller');
    setSellerTab(lesson.shopOsTieIn.deepLink.sellerTab);
  };

  const handleQuizComplete = async (isFirstAttemptAllCorrect: boolean) => {
    const module = modules.find((m) => m.id === lesson.moduleId);
    const skill = module ? ACADEMY_SKILLS.find((s) => s.moduleIds.includes(module.id)) : undefined;
    const before = skill ? getSkillMastery(modules, completedLessonIds, completedChallengeIds).find((s) => s.id === skill.id)?.percent ?? 0 : 0;

    const reward = await completeLessonWithQuiz(lesson.id, isFirstAttemptAllCorrect);

    const after = skill ? getSkillMastery(modules, [...completedLessonIds, lesson.id], completedChallengeIds).find((s) => s.id === skill.id)?.percent ?? 0 : 0;
    // The Mission Complete screen below owns this reward moment, so the
    // floating toast shouldn't also fire for the same completion.
    clearLastReward();
    setMissionComplete({ reward, skillDelta: skill ? { name: skill.name, before, after } : null });
  };

  const steps: LessonStep[] = [
    {
      key: 'learn',
      label: '🌱 Discover: The Idea',
      render: () => (
        <>
          <p className="text-xs sm:text-sm italic text-[#7A6B5F]"><RichText text={lesson.hook} /></p>
          <div className="space-y-2.5">
            {lesson.beats.slice(0, revealedBeats).map((beat, idx) => (
              <p
                key={idx}
                className="text-xs sm:text-sm text-[#54453C] leading-relaxed bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] p-3.5 animate-in fade-in slide-in-from-bottom-1 duration-300"
              >
                <RichText text={beat} />
              </p>
            ))}
            {revealedBeats < lesson.beats.length && (
              <button
                type="button"
                onClick={() => setRevealedBeats((n) => n + 1)}
                className="btn-bouncy w-full p-3.5 rounded-2xl border-2 border-dashed border-[#C4A876]/60 text-[#8C7A6D] text-xs font-bold cursor-pointer hover:bg-[#FAF7F2] flex items-center justify-center gap-1.5"
              >
                🕵️ Keep discovering...
              </button>
            )}
          </div>
        </>
      ),
    },
    {
      key: 'concept',
      label: '🌱 Discover: Why It Matters',
      render: () => (
        <>
          <div className="p-4 bg-white rounded-2xl border-2 border-[#B8E6D5]/70 space-y-2.5">
            <h3 className="font-bold text-xs sm:text-sm text-[#194E3B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Why It Matters
            </h3>
            <p className="text-xs sm:text-sm text-[#54453C] leading-relaxed"><RichText text={lesson.whyItMatters} /></p>
            {lesson.quickStat && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#F7C948]/15 border border-[#F7C948]/50 rounded-xl">
                <Icon name="lesson-tip-insight" className="w-4 h-4 shrink-0" />
                <p className="text-[11px] font-bold text-[#7A341A]"><RichText text={lesson.quickStat} /></p>
              </div>
            )}
            {lesson.image && (
              <figure className="pt-1">
                <img src={lesson.image.url} alt={lesson.image.alt} className="w-full rounded-xl border border-[#EDE4D8] object-cover" />
                <figcaption className="mt-1 text-[10px] text-[#A39284]">{lesson.image.attribution}</figcaption>
              </figure>
            )}
          </div>
          {lesson.jurisdictionNote && (
            <div className="p-4 bg-[#FFF3E8] rounded-2xl border border-[#F8BA9E] space-y-1">
              <h3 className="font-bold text-xs sm:text-sm text-[#7A341A]">Jurisdiction Note</h3>
              <p className="text-xs sm:text-sm text-[#7A341A] leading-relaxed"><RichText text={lesson.jurisdictionNote} /></p>
            </div>
          )}
        </>
      ),
    },
    {
      key: 'activity',
      label: '💡 Try It',
      render: () => (
        <div className="p-4 bg-[#EAF3FB] rounded-2xl border border-[#A8D8EA] space-y-2">
          <h3 className="font-bold text-xs sm:text-sm text-[#1B4E6B]">SproutSquad Activity: {lesson.activity.title}</h3>
          <div className="space-y-1.5">
            {lesson.activity.steps.map((step, idx) => (
              <p key={idx} className="text-xs sm:text-sm text-[#1B4E6B] leading-relaxed"><RichText text={step} /></p>
            ))}
          </div>
          {lesson.activity.image && (
            <figure className="pt-1">
              <img src={lesson.activity.image.url} alt={lesson.activity.image.alt} className="w-full rounded-xl border border-[#A8D8EA]/60 object-cover" />
              <figcaption className="mt-1 text-[10px] text-[#7A93A8]">{lesson.activity.image.attribution}</figcaption>
            </figure>
          )}
          {lesson.activity.illustration && <LessonIllustration name={lesson.activity.illustration} />}
        </div>
      ),
    },
    ...(lesson.inLessonScenario
      ? [
          {
            key: 'scenario',
            label: '🌿 Apply: Think It Through',
            render: () => (
              <div className="p-4 bg-[#FDEEF3] rounded-2xl border border-[#F3B8CB] space-y-2">
                <h3 className="font-bold text-xs sm:text-sm text-[#8C2F52]">Business Simulation: {lesson.inLessonScenario!.title}</h3>
                <div className="space-y-1.5">
                  {lesson.inLessonScenario!.steps.map((step, idx) => (
                    <p key={idx} className="text-xs sm:text-sm text-[#8C2F52] leading-relaxed"><RichText text={step} /></p>
                  ))}
                </div>
                {lesson.inLessonScenario!.image && (
                  <figure className="pt-1">
                    <img src={lesson.inLessonScenario!.image.url} alt={lesson.inLessonScenario!.image.alt} className="w-full rounded-xl border border-[#F3B8CB]/60 object-cover" />
                    <figcaption className="mt-1 text-[10px] text-[#B87C97]">{lesson.inLessonScenario!.image.attribution}</figcaption>
                  </figure>
                )}
                {lesson.inLessonScenario!.illustration && <LessonIllustration name={lesson.inLessonScenario!.illustration} />}
              </div>
            ),
          } as LessonStep,
        ]
      : []),
    ...(lesson.shopOsTieIn
      ? [
          {
            key: 'shopos',
            label: '🌿 Apply: In Shop OS',
            render: () => (
              <div className="p-4 bg-[#F2FBF7] rounded-2xl border border-[#9FD9C3] space-y-2">
                <h3 className="font-bold text-xs sm:text-sm text-[#194E3B]">Apply It in Shop OS</h3>
                <p className="text-xs sm:text-sm text-[#194E3B] leading-relaxed"><RichText text={lesson.shopOsTieIn!.note} /></p>
                {lesson.shopOsTieIn!.deepLink && (
                  <button
                    onClick={handleShopOsTieIn}
                    className="btn-bouncy inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#194E3B] text-white text-[11px] font-black cursor-pointer"
                  >
                    Go apply it now <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            ),
          } as LessonStep,
        ]
      : []),
    {
      key: 'quiz',
      label: '🧠 Quick Check',
      render: () => (
        <QuizRunner
          quiz={lesson.quiz}
          alreadyCompleted={isCompleted}
          onComplete={handleQuizComplete}
        />
      ),
    },
  ];

  if (missionComplete) {
    return (
      <MissionCompleteScreen
        lessonTitle={lesson.title}
        stepLabels={steps.map((s) => s.label)}
        reward={missionComplete.reward}
        skillDelta={missionComplete.skillDelta}
        onContinue={onBack}
      />
    );
  }

  const currentStep = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isQuizStep = currentStep.key === 'quiz';
  const nextLabel = steps[stepIndex + 1]?.key === 'quiz' ? 'Start Quiz' : 'Next Challenge';

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[#8C7A6D] hover:text-[#3B2F27] cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to module
      </button>

      <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-3 pb-4 border-b border-[#F0E9DF]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF4ED] text-[#6E5D52] border border-[#EADBCE]">
              🌱 Mission {lesson.number}
            </span>
            <span className="text-xs font-semibold text-[#8C7A6D] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {lesson.estimatedMinutes} min
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3B2F27] font-['Nunito',sans-serif]">{lesson.title}</h1>
          <p className="text-[11px] text-[#8C7A6D]">Grow your business by completing today's challenge.</p>

          <div className="pt-1">
            <MissionProgress steps={steps} currentIndex={stepIndex} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#8C7A6D]">
            Challenge {stepIndex + 1} of {steps.length}
          </p>
        </div>

        <div className="space-y-4">{currentStep.render()}</div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={isFirstStep}
            className="flex items-center gap-1 text-xs font-bold text-[#8C7A6D] hover:text-[#3B2F27] disabled:opacity-0 disabled:pointer-events-none cursor-pointer transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          {!isQuizStep && (
            <button
              onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
              className="btn-bouncy px-5 py-2.5 bg-[#207559] hover:bg-[#194E3B] text-white font-extrabold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {nextLabel} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
