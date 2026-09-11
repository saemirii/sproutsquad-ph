import React, { useEffect, useState } from 'react';
import { Business } from '../../types';
import { useSproutUp, useSession } from '../../context/AppContext';
import { HiddenGemsSection } from './HiddenGemsSection';
import { RisingSproutsSection } from './RisingSproutsSection';
import { AmbassadorPicksSection } from './AmbassadorPicksSection';
import { FeaturedSproutsSection } from './FeaturedSproutsSection';
import { CommunityPicksSection } from './CommunityPicksSection';
import { Loader2 } from 'lucide-react';

interface SproutUpTabProps {
  onSelectBusiness: (business: Business) => void;
}

export const SproutUpTab: React.FC<SproutUpTabProps> = ({ onSelectBusiness }) => {
  const { refreshSproutUpFeatures, isSproutUpLoading } = useSproutUp();
  const { pendingNavigation, setPendingNavigation } = useSession();
  const [highlightedBusinessId, setHighlightedBusinessId] = useState<string | undefined>(undefined);

  useEffect(() => {
    void refreshSproutUpFeatures();
  }, []);

  // Consumes a notification deep-link's businessId (App.tsx deliberately
  // withholds clearing pendingNavigation for this tab+businessId
  // combination so this effect gets a chance to read it first).
  useEffect(() => {
    if (pendingNavigation?.tab === 'sproutup' && pendingNavigation.businessId) {
      setHighlightedBusinessId(pendingNavigation.businessId);
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  return (
    <div className="p-4 space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#194E3B] to-[#0E2B25] px-5 py-5 shadow-md">
        <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full bg-[#B8E6D5]/10" />
        <div className="absolute right-4 top-14 w-14 h-14 rounded-full bg-[#B8E6D5]/10" />
        <span className="relative text-3xl block animate-float-gentle w-fit">🚀</span>
        <h1 className="relative mt-2 text-lg font-extrabold text-white font-['Nunito',sans-serif]">SproutUp!</h1>
        <p className="relative text-xs text-[#B8E6D5] mt-0.5">Give a growing business a boost.</p>
      </div>

      {isSproutUpLoading ? (
        <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-[#207559] animate-spin" />
          <p className="text-[11px] font-bold text-[#8C7A6D]">Finding this week's Sprouts...</p>
        </div>
      ) : (
        <>
          <FeaturedSproutsSection onSelectBusiness={onSelectBusiness} />
          <HiddenGemsSection onSelectBusiness={onSelectBusiness} highlightedBusinessId={highlightedBusinessId} />
          <AmbassadorPicksSection onSelectBusiness={onSelectBusiness} />
          <RisingSproutsSection onSelectBusiness={onSelectBusiness} highlightedBusinessId={highlightedBusinessId} />
          <CommunityPicksSection onSelectBusiness={onSelectBusiness} />
        </>
      )}
    </div>
  );
};
