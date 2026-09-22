import React from 'react';

interface MissionProgressProps {
  steps: { key: string; label: string }[];
  currentIndex: number;
}

/** Named checklist progress (✓ done / → current / ○ locked) instead of a
 * plain bar + caption — feeds off the same steps/stepIndex LessonReader
 * already computes, no new pagination state. */
export const MissionProgress: React.FC<MissionProgressProps> = ({ steps, currentIndex }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1.5">
      {steps.map((step, idx) => (
        <span
          key={step.key}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
            idx < currentIndex ? 'bg-[#207559]' : idx === currentIndex ? 'bg-[#B8E6D5]' : 'bg-[#F0E9DF]'
          }`}
        />
      ))}
    </div>
    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
      {steps.map((step, idx) => (
        <span
          key={step.key}
          className={`text-[10px] font-bold ${
            idx < currentIndex ? 'text-[#207559]' : idx === currentIndex ? 'text-[#194E3B]' : 'text-[#C4B8AA]'
          }`}
        >
          {idx < currentIndex ? '✓' : idx === currentIndex ? '→' : '○'} {step.label}
        </span>
      ))}
    </div>
  </div>
);
