import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Challenge, ChallengeResult } from '../../types';
import { Icon } from '../Icon';
import { SimulationChallenge } from './SimulationChallenge';
import { CaseStudyChallenge } from './CaseStudyChallenge';

interface ChallengePlayerProps {
  challenge: Challenge;
  onBack: () => void;
  onComplete?: (result: ChallengeResult) => void;
}

/** Dispatches a Challenge to the right player by mode — one entry point
 * regardless of whether the content is a slider simulation or a sequential
 * case study. */
export const ChallengePlayer: React.FC<ChallengePlayerProps> = ({ challenge, onBack, onComplete }) => (
  <div className="space-y-5">
    <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[#8C7A6D] hover:text-[#3B2F27] cursor-pointer">
      <ArrowLeft className="w-3.5 h-3.5" /> Back
    </button>

    <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 space-y-1">
      <div className="flex items-center gap-2">
        <Icon name={challenge.icon} className="w-8 h-8" />
        <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">{challenge.title}</h2>
      </div>
      <p className="text-xs text-[#7A6B5F]">{challenge.tagline}</p>
      {challenge.mode === 'simulation' && (
        <div className="pt-3 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6D]">Starting Capital</span>
          <span className="text-sm font-black text-[#194E3B]">₱{challenge.startingCapital.toLocaleString()}</span>
        </div>
      )}
    </div>

    {challenge.mode === 'simulation' ? (
      <SimulationChallenge challenge={challenge} onComplete={onComplete} />
    ) : (
      <CaseStudyChallenge challenge={challenge} onComplete={onComplete} />
    )}
  </div>
);
