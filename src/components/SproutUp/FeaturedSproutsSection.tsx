import React from 'react';
import { Business } from '../../types';
import { useSproutUp } from '../../context/AppContext';
import { playIosTap } from '../../utils/haptics';
import { SproutUpSectionHeader } from './shared/SproutUpSectionHeader';

interface FeaturedSproutsSectionProps {
  onSelectBusiness: (business: Business) => void;
}

/** Admin-curated spotlights — intentionally renders nothing at all when
 * empty (not even an empty state): this section is purely admin-curated,
 * so an empty state here would read as a bug rather than "still growing". */
export const FeaturedSproutsSection: React.FC<FeaturedSproutsSectionProps> = ({ onSelectBusiness }) => {
  const { sproutUpFeaturedSprouts } = useSproutUp();
  if (sproutUpFeaturedSprouts.length === 0) return null;

  return (
    <section className="space-y-3">
      <SproutUpSectionHeader
        icon="✨"
        iconBg="bg-[#FFD3BA]"
        title="Featured Sprouts"
        subtitle="Meet one of the student businesses we're loving this week."
      />

      <div className="flex gap-3.5 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
        {sproutUpFeaturedSprouts.map((feature) => (
          <div
            key={feature.id}
            onClick={() => { if (feature.business) { playIosTap(); onSelectBusiness(feature.business); } }}
            className="shrink-0 w-[270px] rounded-3xl overflow-hidden shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98] transition-all btn-bouncy border border-[#EDE4D8] bg-white"
          >
            <div className="relative h-36 w-full bg-gradient-to-br from-[#B8E6D5] to-[#194E3B]">
              <img
                src={feature.imageUrl || feature.business?.banner}
                alt={feature.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[9px] font-black bg-[#FFD3BA] text-[#7A2E1E] shadow-xs">
                ✨ Featured This Week
              </span>
              <div className="absolute bottom-2.5 left-3 right-3">
                <h3 className="font-extrabold text-sm text-white truncate font-['Nunito',sans-serif] drop-shadow-sm">{feature.title}</h3>
                {feature.business && (
                  <p className="text-[11px] font-bold text-[#FFF9E6]/90 truncate">{feature.business.name}</p>
                )}
              </div>
            </div>
            <div className="p-3.5">
              <p className="text-[11px] text-[#6E5D52] leading-relaxed line-clamp-2">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
