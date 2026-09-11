import React from 'react';
import { Business } from '../../types';
import { useSproutUp } from '../../context/AppContext';
import { SproutUpBusinessCard } from './SproutUpBusinessCard';
import { SproutUpSectionHeader } from './shared/SproutUpSectionHeader';
import { SproutUpEmptyState } from './shared/SproutUpEmptyState';

interface RisingSproutsSectionProps {
  onSelectBusiness: (business: Business) => void;
  highlightedBusinessId?: string;
}

export const RisingSproutsSection: React.FC<RisingSproutsSectionProps> = ({ onSelectBusiness, highlightedBusinessId }) => {
  const { sproutUpRisingSprouts } = useSproutUp();

  return (
    <section className="space-y-3">
      <SproutUpSectionHeader
        icon="📈"
        iconBg="bg-[#A8D8EA]"
        title="Rising Sprouts"
        subtitle="This business is growing fast!"
      />

      {sproutUpRisingSprouts.length === 0 ? (
        <SproutUpEmptyState icon="📈" text="We're watching for the next big mover. Check back soon!" />
      ) : (
        <div className="space-y-2.5">
          {sproutUpRisingSprouts.map((business) => (
            <SproutUpBusinessCard
              key={business.id}
              business={business}
              featureType="rising_sprout"
              onSelect={onSelectBusiness}
              highlighted={business.id === highlightedBusinessId}
            />
          ))}
        </div>
      )}
    </section>
  );
};
