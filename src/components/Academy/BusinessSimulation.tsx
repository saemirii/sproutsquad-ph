import React, { useState } from 'react';
import { practiceSimulations } from '../../data/simulationScenarios';
import { Challenge } from '../../types';
import { Icon } from '../Icon';
import { ChallengePlayer } from './ChallengePlayer';

/** Optional, always-available practice sandboxes — not gated, not tied to
 * any module's progression. The 8 module checkpoints (graded, tied to
 * unlocking the next module) live inside each ModuleDetail instead. */
export const BusinessSimulation: React.FC = () => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  if (activeChallenge) {
    return <ChallengePlayer challenge={activeChallenge} onBack={() => setActiveChallenge(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-1">
        <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif] flex items-center gap-1.5">
          <Icon name="simulation-retail" className="w-5 h-5" /> Practice Simulations
        </h2>
        <p className="text-xs text-[#7A6B5F]">
          Optional practice, anytime — stock inventory, set your price, and manage marketing, then see how your business performs. These don't count toward a module checkpoint.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {practiceSimulations.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setActiveChallenge(scenario)}
            className="btn-bouncy text-left bg-white rounded-3xl border border-[#EDE4D8] p-5 space-y-2 cursor-pointer hover:border-[#B8E6D5]"
          >
            <div className="flex items-center gap-2">
              <Icon name={scenario.icon} className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-black text-[#3B2F27]">{scenario.title}</h3>
            <p className="text-xs text-[#7A6B5F]">{scenario.tagline}</p>
            {scenario.mode === 'simulation' && (
              <p className="text-[11px] font-bold text-[#194E3B]">Starting Capital: ₱{scenario.startingCapital.toLocaleString()}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
