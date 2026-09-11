import React from 'react';
import { useSproutUp } from '../../context/AppContext';
import { SproutUpFeatureType } from '../../types';

const STYLES: Record<SproutUpFeatureType, { label: string; className: string }> = {
  hidden_gem: { label: '👀 Hidden Gem', className: 'bg-[#B8E6D5] text-[#194E3B]' },
  rising_sprout: { label: '📈 Rising Sprout', className: 'bg-[#A8D8EA] text-[#1B4E6B]' },
  ambassador_pick: { label: '🌟 Ambassador Pick', className: 'bg-[#FFE9A8] text-[#7A5B0E]' },
  community_pick: { label: '💌 Community Pick', className: 'bg-[#F7D6E0] text-[#9D3A63]' },
  featured_sprout: { label: '✨ Featured Sprout', className: 'bg-[#FFD3BA] text-[#7A341A]' },
};

interface SproutedUpBadgeProps {
  businessId: string;
}

/** Renders this week's SproutUp! recognition (if any) for a business —
 * sourced from the live `sproutUpFeaturesByBusinessId` map, not the legacy
 * static `business.badges` array, so this stays fully additive. Each
 * recognition type gets its own color so a business with more than one
 * badge reads as distinct accolades, not a repeated chip. */
export const SproutedUpBadge: React.FC<SproutedUpBadgeProps> = ({ businessId }) => {
  const { sproutUpFeaturesByBusinessId } = useSproutUp();
  const featureTypes = sproutUpFeaturesByBusinessId[businessId];
  if (!featureTypes || featureTypes.length === 0) return null;

  return (
    <>
      {featureTypes.map((type) => (
        <span
          key={type}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs ${STYLES[type].className}`}
        >
          {STYLES[type].label}
        </span>
      ))}
    </>
  );
};
