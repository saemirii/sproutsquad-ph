import React from 'react';
import { Business } from '../../types';
import { useSproutUp } from '../../context/AppContext';
import { SproutUpBusinessCard } from './SproutUpBusinessCard';
import { SproutUpSectionHeader } from './shared/SproutUpSectionHeader';
import { SproutUpEmptyState } from './shared/SproutUpEmptyState';

interface HiddenGemsSectionProps {
  onSelectBusiness: (business: Business) => void;
  highlightedBusinessId?: string;
}

export const HiddenGemsSection: React.FC<HiddenGemsSectionProps> = ({ onSelectBusiness, highlightedBusinessId }) => {
  const { sproutUpHiddenGems } = useSproutUp();

  return (
    <section className="space-y-3">
      <SproutUpSectionHeader
        icon="👀"
        iconBg="bg-[#B8E6D5]"
        title="Hidden Gems"
        subtitle="A growing business worth discovering."
      />

      {sproutUpHiddenGems.length === 0 ? (
        <SproutUpEmptyState icon="👀" text="We're looking for the next Hidden Gem. Check back soon!" />
      ) : (
        <div className="space-y-2.5">
          {sproutUpHiddenGems.map((business) => (
            <SproutUpBusinessCard
              key={business.id}
              business={business}
              featureType="hidden_gem"
              onSelect={onSelectBusiness}
              highlighted={business.id === highlightedBusinessId}
            />
          ))}
        </div>
      )}
    </section>
  );
};
