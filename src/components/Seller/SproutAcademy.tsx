import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Zap,
  Calculator,
  Package,
  Megaphone,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lesson } from '../../types';
import { triggerConfetti } from '../../utils/confetti';

export const SproutAcademy: React.FC = () => {
  const { lessons, completedLessonIds, completeLesson } = useApp();
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || 'lesson-1');
  const [activeQuizQuestionIndex, setActiveQuizQuestionIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [showRewardBanner, setShowRewardBanner] = useState<boolean>(false);

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];
  const isLessonCompleted = completedLessonIds.includes(selectedLesson.id);

  const currentQuestion = selectedLesson?.quiz?.[activeQuizQuestionIndex] || selectedLesson?.quiz?.[0];

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
    setActiveQuizQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);
  };

  const handleSelectAnswer = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswerIndex(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswerIndex === null) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedAnswerIndex === currentQuestion.correctIndex;
    if (isCorrect) {
      completeLesson(selectedLesson.id);
      triggerConfetti();
      setShowRewardBanner(true);
      setTimeout(() => setShowRewardBanner(false), 3500);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);
  };

  const getMascotIcon = (mascot: string) => {
    switch (mascot) {
      case 'owl':
        return '🦉';
      case 'bunny':
        return '🐰';
      case 'fox':
        return '🦊';
      default:
        return '🌱';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#EDE4D8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD3BA] border border-[#F8BA9E] text-2xl flex items-center justify-center shadow-xs">
            🦉
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#3B2F27] font-['Nunito',sans-serif]">
                Sprout Entrepreneurship Academy
              </h2>
              <span className="text-xs bg-[#B8E6D5] text-[#194E3B] font-bold px-2 py-0.5 rounded-md">
                Peanut's Hub
              </span>
            </div>
            <p className="text-xs text-[#6B5B4F] mt-0.5">
              Practical 5-minute modules designed for Philippine student founders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#FFF9E6] px-4 py-2.5 rounded-2xl border border-[#EDE4D8] shadow-xs">
          <Award className="w-5 h-5 text-[#7A341A]" />
          <div className="text-xs">
            <span className="font-extrabold text-[#3B2F27]">
              {completedLessonIds.length} of {lessons.length} Modules Completed
            </span>
            <p className="text-[10px] text-[#194E3B] font-bold">
              +{completedLessonIds.length * 2} pts added to Health Score
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Lesson Index (4 cols) + Reader & Quiz (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Lesson Directory */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D] px-1">
            Learning Curriculum
          </h3>

          <div className="space-y-2.5">
            {lessons.map((lesson, idx) => {
              const isSelected = lesson.id === selectedLesson.id;
              const isDone = completedLessonIds.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#B8E6D5] ring-2 ring-[#B8E6D5]/60 shadow-xs'
                      : 'bg-white/80 border-[#EDE4D8] hover:bg-white hover:border-[#E0D5C5]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getMascotIcon(lesson.mascot)}</span>
                        <span className="text-[10px] font-bold text-[#8C7A6D]">
                          Module {idx + 1}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#A39284]">
                          <Clock className="w-3 h-3" /> {lesson.estimatedMinutes} mins
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#3B2F27] line-clamp-1">
                        {lesson.title}
                      </h4>
                    </div>

                    {isDone ? (
                      <span className="w-6 h-6 rounded-full bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center text-xs shrink-0 font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#E0D5C5] text-[#A39284] flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#7A6B5F] pt-2 border-t border-[#F5EFEB]">
                    <span className="truncate">{lesson.category}</span>
                    <span className="font-semibold text-[#207559] text-[10px]">
                      {lesson.badgeReward.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Lesson Content & Interactive Quiz */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#EDE4D8] p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Header */}
          <div className="space-y-2 pb-4 border-b border-[#F0E9DF]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMascotIcon(selectedLesson.mascot)}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF4ED] text-[#6E5D52] border border-[#EADBCE]">
                  {selectedLesson.category} • {selectedLesson.level}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#8C7A6D] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {selectedLesson.estimatedMinutes} min read
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#3B2F27] font-['Nunito',sans-serif]">
              {selectedLesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6B5F]">
              {selectedLesson.tagline}
            </p>
          </div>

          {/* Lesson Sections */}
          <div className="space-y-4">
            {selectedLesson.sections.map((sec, sIdx) => (
              <div
                key={sIdx}
                className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] space-y-2"
              >
                <h3 className="font-bold text-xs sm:text-sm text-[#3B2F27]">
                  {sec.heading}
                </h3>
                <p className="text-xs sm:text-sm text-[#54453C] leading-relaxed whitespace-pre-line">
                  {sec.body}
                </p>

                {sec.practicalFormula && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-[#EADBCE] space-y-1">
                    <p className="text-[11px] font-bold text-[#207559] uppercase tracking-wider">
                      📐 {sec.practicalFormula.title}
                    </p>
                    <p className="text-xs font-mono font-bold text-[#3B2F27] bg-[#FAF7F2] p-1.5 rounded-lg border border-[#E5DACD]">
                      {sec.practicalFormula.formula}
                    </p>
                    <p className="text-[11px] text-[#6E5D52] italic">
                      Example: {sec.practicalFormula.example}
                    </p>
                  </div>
                )}

                {sec.keyTakeaway && (
                  <div className="mt-2 pt-2 border-t border-[#EADBCE]/60 flex items-start gap-2 text-xs font-bold text-[#207559]">
                    <span>💡</span>
                    <span>{sec.keyTakeaway}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Check for Understanding Quiz */}
          {currentQuestion && (
            <div className="p-6 rounded-3xl bg-white border-2 border-[#B8E6D5] space-y-4 shadow-xs relative">
              {showRewardBanner && (
                <div className="absolute inset-0 bg-[#B8E6D5]/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center z-10 animate-in zoom-in-95 duration-200">
                  <span className="text-4xl animate-bounce">🎉</span>
                  <h3 className="font-black text-lg text-[#194E3B] font-['Nunito',sans-serif] mt-2">
                    Correct! Badge Unlocked!
                  </h3>
                  <p className="text-xs text-[#194E3B] font-bold mt-1">
                    You earned: "{selectedLesson.badgeReward.name}"
                  </p>
                  <p className="text-[11px] text-[#2C6B56] mt-2">
                    Your Business Health Score was boosted!
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <h3 className="font-extrabold text-sm text-[#3B2F27] font-['Nunito',sans-serif]">
                    Quick Founder Quiz
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#8C3A27] bg-[#FFD3BA]/50 px-2 py-0.5 rounded-md">
                  Reward: {selectedLesson.badgeReward.name}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-[#3B2F27]">
                {currentQuestion.question}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswerIndex === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let optionClasses = 'bg-[#FAF7F2] border-[#E5DACD] text-[#4A3D35] hover:bg-[#F2EAE0]';

                  if (isAnswerSubmitted || isLessonCompleted) {
                    if (isCorrect) {
                      optionClasses = 'bg-[#EBFBF0] border-[#10B981] text-[#065F46] font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionClasses = 'bg-[#FEE2E2] border-[#EF4444] text-[#991B1B] font-bold';
                    }
                  } else if (isSelected) {
                    optionClasses = 'bg-[#B8E6D5]/60 border-[#207559] text-[#194E3B] font-bold';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between ${optionClasses}`}
                    >
                      <span>{option}</span>
                      {(isAnswerSubmitted || isLessonCompleted) && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation on submit */}
              {(isAnswerSubmitted || isLessonCompleted) && (
                <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] text-xs text-[#54453C] space-y-1">
                  <span className="font-bold text-[#207559]">Peanut's Explanation:</span>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                {isAnswerSubmitted && !isLessonCompleted && (
                  <button
                    onClick={handleResetQuiz}
                    className="flex items-center gap-1 text-xs text-[#8C7A6D] hover:text-[#3B2F27] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Try again
                  </button>
                )}

                {!isAnswerSubmitted && !isLessonCompleted && (
                  <button
                    disabled={selectedAnswerIndex === null}
                    onClick={handleCheckAnswer}
                    className="ml-auto px-5 py-2.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] disabled:opacity-40 text-[#194E3B] font-extrabold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer btn-bouncy"
                  >
                    Submit Answer ✨
                  </button>
                )}

                {isLessonCompleted && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#207559]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Module Completed & Badge Earned!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
