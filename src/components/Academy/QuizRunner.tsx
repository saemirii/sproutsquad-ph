import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Eye } from 'lucide-react';
import { QuizQuestion } from '../../types';
import { Icon } from '../Icon';

interface QuizRunnerProps {
  quiz: QuizQuestion[];
  /** Already completed in an earlier visit — shows every question in its
   * resolved state instead of replaying the quiz. */
  alreadyCompleted: boolean;
  /** isFirstAttemptAllCorrect: true only if every multiple_choice question
   * was answered correctly on the first try (short_answer questions are
   * self-checked, not graded, and never break a "perfect" run). */
  onComplete: (isFirstAttemptAllCorrect: boolean) => void;
}

type QuestionState = 'unanswered' | 'correct' | 'incorrect' | 'revealed';

export const QuizRunner: React.FC<QuizRunnerProps> = ({ quiz, alreadyCompleted, onComplete }) => {
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [states, setStates] = useState<QuestionState[]>(() => quiz.map(() => 'unanswered'));
  const [usedRetry, setUsedRetry] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const question = quiz[index];
  const state = alreadyCompleted ? (question.format === 'short_answer' ? 'revealed' : 'correct') : states[index];
  const isLast = index === quiz.length - 1;

  const handleSelect = (optionIdx: number) => {
    if (state !== 'unanswered') return;
    setSelectedOption(optionIdx);
  };

  const handleSubmitMultipleChoice = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === question.correctIndex;
    setStates((prev) => prev.map((s, i) => (i === index ? (isCorrect ? 'correct' : 'incorrect') : s)));
    if (!isCorrect) setUsedRetry(true);
  };

  const handleRetryQuestion = () => {
    setSelectedOption(null);
    setStates((prev) => prev.map((s, i) => (i === index ? 'unanswered' : s)));
  };

  const handleReveal = () => {
    setStates((prev) => prev.map((s, i) => (i === index ? 'revealed' : s)));
  };

  const handleNext = () => {
    if (isLast) {
      if (!alreadyCompleted) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 3500);
        onComplete(!usedRetry);
      }
      return;
    }
    setIndex((i) => i + 1);
    setSelectedOption(null);
  };

  const canAdvance = state === 'correct' || state === 'revealed';

  return (
    <div className="p-6 rounded-3xl bg-white border-2 border-[#B8E6D5] space-y-4 shadow-xs relative">
      {showReward && (
        <div className="absolute inset-0 bg-[#B8E6D5]/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center z-10 animate-in zoom-in-95 duration-200">
          <Icon name="celebration-burst" className="w-14 h-14 animate-bounce" />
          <h3 className="font-black text-lg text-[#194E3B] font-['Nunito',sans-serif] mt-2">Quiz Complete!</h3>
          <p className="text-[11px] text-[#2C6B56] mt-2">Nice work — your garden just grew a little.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="quests-header" className="w-5 h-5" />
          <h3 className="font-extrabold text-sm text-[#3B2F27] font-['Nunito',sans-serif]">Quick Check</h3>
        </div>
        <span className="text-[10px] font-bold text-[#8C7A6D]">Question {index + 1} of {quiz.length}</span>
      </div>

      <p className="text-xs sm:text-sm font-bold text-[#3B2F27]">{question.prompt}</p>

      {question.format === 'multiple_choice' ? (
        <>
          <div className="space-y-2">
            {(question.options || []).map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === question.correctIndex;
              let optionClasses = 'bg-[#FAF7F2] border-[#E5DACD] text-[#4A3D35] hover:bg-[#F2EAE0]';
              if (state === 'correct' || state === 'incorrect') {
                if (isCorrectOption) optionClasses = 'bg-[#EBFBF0] border-[#10B981] text-[#065F46] font-bold';
                else if (isSelected) optionClasses = 'bg-[#FEE2E2] border-[#EF4444] text-[#991B1B] font-bold';
              } else if (isSelected) {
                optionClasses = 'bg-[#B8E6D5]/60 border-[#207559] text-[#194E3B] font-bold';
              }
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between ${optionClasses}`}
                >
                  <span>{option}</span>
                  {(state === 'correct' || state === 'incorrect') && isCorrectOption && (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
          {(state === 'correct' || state === 'incorrect') && (
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] text-xs text-[#54453C] space-y-1">
              <span className="font-bold text-[#207559]">Peanut's Explanation:</span>
              <p>{question.explanation}</p>
            </div>
          )}
          <div className="pt-2 flex items-center justify-between">
            {state === 'incorrect' && (
              <button onClick={handleRetryQuestion} className="flex items-center gap-1 text-xs text-[#8C7A6D] hover:text-[#3B2F27] cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5" /> Try again
              </button>
            )}
            {state === 'unanswered' && (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitMultipleChoice}
                className="ml-auto px-5 py-2.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] disabled:opacity-40 text-[#194E3B] font-extrabold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer btn-bouncy"
              >
                Submit Answer
              </button>
            )}
            {canAdvance && (
              <button onClick={handleNext} className="ml-auto px-5 py-2.5 bg-[#207559] hover:bg-[#194E3B] text-white font-extrabold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer btn-bouncy">
                {isLast ? 'Finish Quiz' : 'Next Question'}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {state === 'revealed' ? (
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] text-xs text-[#54453C] space-y-2">
              <div>
                <span className="font-bold text-[#207559]">Model Answer:</span>
                <p>{question.modelAnswer}</p>
              </div>
              <div>
                <span className="font-bold text-[#207559]">Why:</span>
                <p>{question.explanation}</p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-[#8C7A6D] italic">Think through your answer, then reveal the model answer to check yourself — no penalty either way.</p>
          )}
          <div className="pt-2 flex items-center justify-end">
            {state === 'unanswered' ? (
              <button onClick={handleReveal} className="px-5 py-2.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-extrabold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer btn-bouncy flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Reveal Model Answer
              </button>
            ) : (
              <button onClick={handleNext} className="px-5 py-2.5 bg-[#207559] hover:bg-[#194E3B] text-white font-extrabold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer btn-bouncy">
                {isLast ? 'Finish Quiz' : 'Next Question'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
