import React from 'react';
import { SkillMastery } from '../../../data/academySkills';
import { Icon } from '../../Icon';

interface SkillMasteryBarsProps {
  skills: SkillMastery[];
  compact?: boolean;
}

export const SkillMasteryBars: React.FC<SkillMasteryBarsProps> = ({ skills, compact }) => (
  <div className={compact ? 'space-y-2' : 'space-y-3'}>
    {skills.map((skill) => (
      <div key={skill.id} className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 font-bold text-[#3B2F27]">
            <Icon name={skill.icon} className="w-3.5 h-3.5" /> {skill.name}
          </span>
          <span className="font-black text-[#207559]">{skill.percent}%</span>
        </div>
        <div className="w-full h-2 bg-[#F0E9DF] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#B8E6D5] to-[#207559] rounded-full transition-all duration-500"
            style={{ width: `${skill.percent}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);
