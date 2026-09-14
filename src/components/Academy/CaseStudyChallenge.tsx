import React, { useState } from 'react';
import { useAcademy } from '../../context/AppContext';
import { CaseStudyChallengeDef, ChallengeResult } from '../../types';
import { Icon } from '../Icon';
import { ChallengeResultCard } from './shared/ChallengeResultCard';

interface CaseStudyChallengeProps {
  challenge: CaseStudyChallengeDef;
}

/** Sequential decision points, each a scenario + 2-4 choices with their own
 * score delta and feedback. Used by module checkpoints whose content is a
 * judgment call rather than a formula (positioning, structure, funding). */
export const CaseStudyChallenge: React.FC<CaseStudyChallengeProps> = ({ challenge }) => {
  const { completeChallenge } = useAcademy();
  const [stepIndex, setStepIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxPossibleScore = challenge.steps.reduce(
    (sum, step) => sum + Math.max(...step.choices.map((c) => c.scoreDelta)),
    0
  );
  const step = challenge.steps[stepIndex];
  const isLastStep = stepIndex === challenge.steps.length - 1;

  const handleChoose = (choiceIndex: number) => {
    if (chosenIndex !== null) return;
    setChosenIndex(choiceIndex);
  };

  const handleNext = async () => {
    if (chosenIndex === null) return;
    const nextTotal = totalScore + step.choices[chosenIndex].scoreDelta;

    if (isLastStep) {
      const computed = challenge.scoreToResult(nextTotal, maxPossibleScore);
      setTotalScore(nextTotal);
      setResult(computed);
      setIsSubmitting(true);
      await completeChallenge(challenge.id, computed);
      setIsSubmitting(false);
      return;
    }

    setTotalScore(nextTotal);
    setChosenIndex(null);
    setStepIndex((i) => i + 1);
  };

  const handleRetry = () => {
    setStepIndex(0);
    setTotalScore(0);
    setChosenIndex(null);
    setResult(null);
  };

  if (result) {
    return <ChallengeResultCard result={result} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5">
        {challenge.steps.map((s, i) => (
          <span
            key={s.id}
            className={`h-1.5 flex-1 rounded-full ${i < stepIndex ? 'bg-[#71C7A5]' : i === stepIndex ? 'bg-[#B8E6D5]' : 'bg-[#F0E9DF]'}`}
          />
        ))}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6D]">
        Decision {stepIndex + 1} of {challenge.steps.length}
      </p>

      <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 space-y-4">
        <p className="text-sm font-bold text-[#3B2F27] leading-relaxed">{step.prompt}</p>

        <div className="space-y-2.5">
          {step.choices.map((choice, idx) => {
            const isChosen = chosenIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => handleChoose(idx)}
                disabled={chosenIndex !== null}
                className={`w-full text-left p-4 rounded-2xl border text-xs transition-all cursor-pointer disabled:cursor-default ${
                  isChosen
                    ? 'bg-[#B8E6D5]/50 border-[#71C7A5] text-[#194E3B] font-bold'
                    : chosenIndex !== null
                    ? 'bg-[#FAF7F2] border-[#EDE4D8] text-[#A39284]'
                    : 'bg-[#FAF7F2] border-[#E5DACD] text-[#4A3D35] hover:bg-[#F2EAE0]'
                }`}
              >
                {choice.label}
              </button>
            );
          })}
        </div>

        {chosenIndex !== null && (
          <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] text-xs text-[#54453C] space-y-1">
            <span className="font-bold text-[#207559]">Peanut's Take:</span>
            <p>{step.choices[chosenIndex].feedback}</p>
          </div>
        )}

        <button
          onClick={() => void handleNext()}
          disabled={chosenIndex === null || isSubmitting}
          className="btn-bouncy w-full py-3 rounded-2xl bg-[#207559] hover:bg-[#194E3B] disabled:opacity-40 text-white text-xs font-black cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isLastStep ? 'See Your Result' : 'Next Decision'} <Icon name="celebration-burst" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
