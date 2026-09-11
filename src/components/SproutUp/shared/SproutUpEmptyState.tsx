import React from 'react';

interface SproutUpEmptyStateProps {
  icon: string;
  text: string;
}

/** A dashed, airy placeholder instead of a plain bordered box — reads as
 * "still growing" rather than "nothing here / broken". */
export const SproutUpEmptyState: React.FC<SproutUpEmptyStateProps> = ({ icon, text }) => (
  <div className="bg-white/50 rounded-2xl border-2 border-dashed border-[#E5DACD] p-7 text-center space-y-2">
    <span className="text-3xl block animate-float-gentle">{icon}</span>
    <p className="text-xs font-bold text-[#8C7A6D] leading-relaxed max-w-[230px] mx-auto">{text}</p>
  </div>
);
