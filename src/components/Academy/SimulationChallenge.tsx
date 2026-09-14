import React, { useState } from 'react';
import { useAcademy } from '../../context/AppContext';
import { SimulationChallengeDef, ChallengeResult } from '../../types';
import { Icon } from '../Icon';
import { ChallengeResultCard } from './shared/ChallengeResultCard';

interface SimulationChallengeProps {
  challenge: SimulationChallengeDef;
}

/** The pricing-toggle pattern, generalized — sliders/toggles over a pure
 * compute() function. Used by every module checkpoint (and practice
 * simulation) whose content is formula-driven. */
export const SimulationChallenge: React.FC<SimulationChallengeProps> = ({ challenge }) => {
  const { completeChallenge } = useAcademy();
  const [decisions, setDecisions] = useState<Record<string, number | boolean>>(() =>
    Object.fromEntries(challenge.decisions.map((d) => [d.key, d.default]))
  );
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRun = async () => {
    const computed = challenge.compute(decisions, challenge.startingCapital);
    setResult(computed);
    setIsSubmitting(true);
    await completeChallenge(challenge.id, computed);
    setIsSubmitting(false);
  };

  const handleRetry = () => {
    setResult(null);
    setDecisions(Object.fromEntries(challenge.decisions.map((d) => [d.key, d.default])));
  };

  return (
    <div className="space-y-5">
      {!result ? (
        <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D]">Make your decisions</h3>
          {challenge.decisions.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#3B2F27]">{field.label}</label>
                {field.type === 'number' && (
                  <span className="text-xs font-black text-[#207559]">
                    {field.unit === '₱' ? '₱' : ''}{decisions[field.key] as number}{field.unit && field.unit !== '₱' ? ` ${field.unit}` : ''}
                  </span>
                )}
              </div>
              {field.type === 'number' ? (
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={decisions[field.key] as number}
                  onChange={(e) => setDecisions((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                  className="w-full accent-[#207559]"
                />
              ) : (
                <button
                  onClick={() => setDecisions((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                  className={`btn-bouncy w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border text-xs font-bold cursor-pointer ${
                    decisions[field.key] ? 'bg-[#B8E6D5]/50 border-[#71C7A5] text-[#194E3B]' : 'bg-[#FAF7F2] border-[#E5DACD] text-[#8C7A6D]'
                  }`}
                >
                  <span>{decisions[field.key] ? 'Yes' : 'No'}</span>
                  <Icon name={decisions[field.key] ? 'decision-confirmed' : 'decision-unconfirmed'} className="w-4 h-4" />
                </button>
              )}
              {field.helpText && <p className="text-[10px] text-[#A39284]">{field.helpText}</p>}
            </div>
          ))}

          <button
            onClick={() => void handleRun()}
            disabled={isSubmitting}
            className="btn-bouncy w-full py-3 rounded-2xl bg-[#207559] hover:bg-[#194E3B] disabled:opacity-60 text-white text-xs font-black cursor-pointer flex items-center justify-center gap-1.5"
          >
            Run This Cycle <Icon name="celebration-burst" className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <ChallengeResultCard result={result} onRetry={handleRetry} />
      )}
    </div>
  );
};
