import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { useAcademy, useSession } from '../../context/AppContext';
import { Lesson } from '../../types';
import { Icon } from '../Icon';
import { QuizRunner } from './QuizRunner';

interface LessonReaderProps {
  lesson: Lesson;
  onBack: () => void;
}

interface LessonStep {
  key: string;
  label: string;
  render: () => React.ReactNode;
}

/** Paginating into one focused step at a time (instead of one long scroll
 * of hook → explanation → concept → activity → scenario → shop tie-in →
 * quiz stacked together) is what actually fixes the "too wordy" feeling —
 * each screen only ever shows one chunk of content. */
export const LessonReader: React.FC<LessonReaderProps> = ({ lesson, onBack }) => {
  const { completedLessonIds, completeLessonWithQuiz } = useAcademy();
  const { setSellerTab, setCurrentView } = useSession();
  const isCompleted = completedLessonIds.includes(lesson.id);
  const [stepIndex, setStepIndex] = useState(0);

  const handleShopOsTieIn = () => {
    if (!lesson.shopOsTieIn?.deepLink) return;
    setCurrentView('seller');
    setSellerTab(lesson.shopOsTieIn.deepLink.sellerTab);
  };

  const steps: LessonStep[] = [
    {
      key: 'learn',
      label: 'The Idea',
      render: () => (
        <>
          <p className="text-xs sm:text-sm italic text-[#7A6B5F]">{lesson.hook}</p>
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] space-y-2">
            <h3 className="font-bold text-xs sm:text-sm text-[#3B2F27]">Simplified Explanation</h3>
            <p className="text-xs sm:text-sm text-[#54453C] leading-relaxed whitespace-pre-line">{lesson.simplifiedExplanation}</p>
          </div>
        </>
      ),
    },
    {
      key: 'concept',
      label: 'Backed By',
      render: () => (
        <>
          <div className="p-4 bg-white rounded-2xl border-2 border-[#B8E6D5]/70 space-y-2">
            <h3 className="font-bold text-xs sm:text-sm text-[#194E3B] flex items-center gap-1.5">
              <Icon name="lesson-formula" className="w-3.5 h-3.5" /> Source-Backed Concept
            </h3>
            <p className="text-xs sm:text-sm text-[#54453C] leading-relaxed">{lesson.concept.body}</p>
            <div className="pt-1 space-y-1">
              {lesson.concept.sources.map((source) => (
                <p key={source.url} className="text-[11px] text-[#8C7A6D]">
                  {source.title} — <span className="italic">{source.url}</span>
                </p>
              ))}
            </div>
          </div>
          {lesson.jurisdictionNote && (
            <div className="p-4 bg-[#FFF3E8] rounded-2xl border border-[#F8BA9E] space-y-1">
              <h3 className="font-bold text-xs sm:text-sm text-[#7A341A]">Jurisdiction Note</h3>
              <p className="text-xs sm:text-sm text-[#7A341A] leading-relaxed">{lesson.jurisdictionNote}</p>
            </div>
          )}
        </>
      ),
    },
    {
      key: 'activity',
      label: 'Try It',
      render: () => (
        <div className="p-4 bg-[#EAF3FB] rounded-2xl border border-[#A8D8EA] space-y-1.5">
          <h3 className="font-bold text-xs sm:text-sm text-[#1B4E6B]">SproutSquad Activity: {lesson.activity.title}</h3>
          <p className="text-xs sm:text-sm text-[#1B4E6B] leading-relaxed">{lesson.activity.prompt}</p>
        </div>
      ),
    },
    ...(lesson.inLessonScenario
      ? [
          {
            key: 'scenario',
            label: 'Think It Through',
            render: () => (
              <div className="p-4 bg-[#FDEEF3] rounded-2xl border border-[#F3B8CB] space-y-1.5">
                <h3 className="font-bold text-xs sm:text-sm text-[#8C2F52]">Business Simulation: {lesson.inLessonScenario!.title}</h3>
                <p className="text-xs sm:text-sm text-[#8C2F52] leading-relaxed">{lesson.inLessonScenario!.prompt}</p>
              </div>
            ),
          } as LessonStep,
        ]
      : []),
    ...(lesson.shopOsTieIn
      ? [
          {
            key: 'shopos',
            label: 'Apply It',
            render: () => (
              <div className="p-4 bg-[#F2FBF7] rounded-2xl border border-[#9FD9C3] space-y-2">
                <h3 className="font-bold text-xs sm:text-sm text-[#194E3B]">Apply It in Shop OS</h3>
                <p className="text-xs sm:text-sm text-[#194E3B] leading-relaxed">{lesson.shopOsTieIn!.note}</p>
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
      label: 'Quick Check',
      render: () => (
        <QuizRunner
          quiz={lesson.quiz}
          alreadyCompleted={isCompleted}
          onComplete={(isFirstAttemptAllCorrect) => { void completeLessonWithQuiz(lesson.id, isFirstAttemptAllCorrect); }}
        />
      ),
    },
  ];

  const currentStep = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isQuizStep = currentStep.key === 'quiz';
  const nextLabel = steps[stepIndex + 1]?.key === 'quiz' ? 'Start Quiz' : 'Next';

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[#8C7A6D] hover:text-[#3B2F27] cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to module
      </button>

      <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-3 pb-4 border-b border-[#F0E9DF]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF4ED] text-[#6E5D52] border border-[#EADBCE]">
              Lesson {lesson.number}
            </span>
            <span className="text-xs font-semibold text-[#8C7A6D] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {lesson.estimatedMinutes} min
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3B2F27] font-['Nunito',sans-serif]">{lesson.title}</h1>

          <div className="flex items-center gap-1.5 pt-1">
            {steps.map((step, idx) => (
              <span
                key={step.key}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  idx < stepIndex ? 'bg-[#207559]' : idx === stepIndex ? 'bg-[#B8E6D5]' : 'bg-[#F0E9DF]'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#8C7A6D]">
            Step {stepIndex + 1} of {steps.length} — {currentStep.label}
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
