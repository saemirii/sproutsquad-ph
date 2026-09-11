import React, { useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useAcademy } from '../../context/AppContext';
import { simulationScenarios } from '../../data/simulationScenarios';
import { SimulationResult, SimulationScenario } from '../../types';

const healthColor: Record<SimulationResult['businessHealth'], string> = {
  Thriving: 'bg-[#EBFBF0] text-[#065F46] border-[#10B981]',
  Stable: 'bg-[#B8E6D5]/40 text-[#194E3B] border-[#71C7A5]',
  Struggling: 'bg-[#FFF3D6] text-[#7A5A17] border-[#F0C555]',
  'At Risk': 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]',
};

const ScenarioPlayer: React.FC<{ scenario: SimulationScenario; onBack: () => void }> = ({ scenario, onBack }) => {
  const { completeSimulation } = useAcademy();
  const [decisions, setDecisions] = useState<Record<string, number | boolean>>(() =>
    Object.fromEntries(scenario.decisions.map((d) => [d.key, d.default]))
  );
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRun = async () => {
    const computed = scenario.compute(decisions, scenario.startingCapital);
    setResult(computed);
    setIsSubmitting(true);
    await completeSimulation(scenario.id, computed.xpAwarded, computed.seedsAwarded);
    setIsSubmitting(false);
  };

  const handleRetry = () => {
    setResult(null);
    setDecisions(Object.fromEntries(scenario.decisions.map((d) => [d.key, d.default])));
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[#8C7A6D] hover:text-[#3B2F27] cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to scenarios
      </button>

      <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{scenario.icon}</span>
          <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">{scenario.title}</h2>
        </div>
        <p className="text-xs text-[#7A6B5F]">{scenario.tagline}</p>
        <div className="pt-3 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6D]">Starting Capital</span>
          <span className="text-sm font-black text-[#194E3B]">₱{scenario.startingCapital.toLocaleString()}</span>
        </div>
      </div>

      {!result ? (
        <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D]">Make your decisions</h3>
          {scenario.decisions.map((field) => (
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
                  <span>{decisions[field.key] ? '✅' : '⬜️'}</span>
                </button>
              )}
              {field.helpText && <p className="text-[10px] text-[#A39284]">{field.helpText}</p>}
            </div>
          ))}

          <button
            onClick={handleRun}
            disabled={isSubmitting}
            className="btn-bouncy w-full py-3 rounded-2xl bg-[#207559] hover:bg-[#194E3B] disabled:opacity-60 text-white text-xs font-black cursor-pointer"
          >
            Run This Cycle 🚀
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`rounded-3xl border-2 p-6 text-center space-y-1 ${healthColor[result.businessHealth]}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Business Health</p>
            <p className="text-xl font-black font-['Nunito',sans-serif]">{result.businessHealth}</p>
            <p className="text-xs font-bold">Health Score: {result.healthScore} / 100</p>
          </div>

          <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Revenue', value: `₱${result.revenue.toLocaleString()}` },
              { label: 'Expenses', value: `₱${result.expenses.toLocaleString()}` },
              { label: 'Profit', value: `₱${result.profit.toLocaleString()}` },
              { label: 'Profit Margin', value: `${result.profitMargin}%` },
              { label: 'Remaining Cash', value: `₱${result.remainingCash.toLocaleString()}` },
            ].map((row) => (
              <div key={row.label} className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6D]">{row.label}</p>
                <p className="text-sm font-black text-[#3B2F27]">{row.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#FAF7F2] rounded-3xl border border-[#EDE4D8] p-5 space-y-2">
            <p className="text-xs font-bold text-[#207559]">Peanut's Takeaways</p>
            {result.feedback.map((line, i) => (
              <p key={i} className="text-xs text-[#54453C] leading-relaxed">• {line}</p>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 bg-white rounded-2xl border border-[#EDE4D8] py-3 text-xs font-black text-[#7A341A]">
            <span>+{result.xpAwarded} XP</span>
            <span className="opacity-40">•</span>
            <span>+{result.seedsAwarded} 🌰 Seeds</span>
          </div>

          <button
            onClick={handleRetry}
            className="btn-bouncy w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DACD] text-[#3B2F27] text-xs font-black cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try a different strategy
          </button>
        </div>
      )}
    </div>
  );
};

export const BusinessSimulation: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);

  if (activeScenario) {
    return <ScenarioPlayer scenario={activeScenario} onBack={() => setActiveScenario(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-1">
        <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">💼 Business Simulations</h2>
        <p className="text-xs text-[#7A6B5F]">
          Apply what you've learned. Stock inventory, set your price, and manage marketing — then see how your business performs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {simulationScenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setActiveScenario(scenario)}
            className="btn-bouncy text-left bg-white rounded-3xl border border-[#EDE4D8] p-5 space-y-2 cursor-pointer hover:border-[#B8E6D5]"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{scenario.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6D]">{scenario.category}</span>
            </div>
            <h3 className="text-sm font-black text-[#3B2F27]">{scenario.title}</h3>
            <p className="text-xs text-[#7A6B5F]">{scenario.tagline}</p>
            <p className="text-[11px] font-bold text-[#194E3B]">Starting Capital: ₱{scenario.startingCapital.toLocaleString()}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
