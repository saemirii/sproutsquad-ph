import React, { useState } from 'react';
import { Quote } from 'lucide-react';
import { Business } from '../../types';
import { useSproutUp } from '../../context/AppContext';
import { playIosTap } from '../../utils/haptics';
import { NominationForm } from './NominationForm';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { SproutUpSectionHeader } from './shared/SproutUpSectionHeader';
import { SproutUpEmptyState } from './shared/SproutUpEmptyState';

interface CommunityPicksSectionProps {
  onSelectBusiness: (business: Business) => void;
}

export const CommunityPicksSection: React.FC<CommunityPicksSectionProps> = ({ onSelectBusiness }) => {
  const { sproutUpNominations } = useSproutUp();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section className="space-y-3">
      <SproutUpSectionHeader
        icon="💌"
        iconBg="bg-[#F7D6E0]"
        title="Community Picks"
        subtitle="Know a business that deserves a little more love?"
        action={
          <button
            onClick={() => { playIosTap(); setIsFormOpen(true); }}
            className="shrink-0 px-3 py-2 bg-[#F7D6E0] hover:bg-[#F3BFD1] text-[#9D3A63] font-black text-[11px] rounded-2xl shadow-xs cursor-pointer btn-bouncy whitespace-nowrap"
          >
            Nominate
          </button>
        }
      />

      {sproutUpNominations.length === 0 ? (
        <SproutUpEmptyState icon="💌" text="Know a business worth discovering? Nominate them!" />
      ) : (
        <div className="space-y-2.5">
          {sproutUpNominations.map((nomination) => (
            <div
              key={nomination.id}
              onClick={() => { if (nomination.business) { playIosTap(); onSelectBusiness(nomination.business); } }}
              className="relative bg-white rounded-2xl border border-l-[5px] border-[#EDE4D8] border-l-[#F7D6E0] p-4 shadow-xs hover:shadow-md cursor-pointer active:scale-[0.98] transition-all btn-bouncy space-y-2 overflow-hidden"
            >
              <Quote className="absolute -top-1 right-3 w-10 h-10 text-[#F7D6E0]/80 rotate-180" fill="currentColor" strokeWidth={0} />
              <div className="relative flex items-center gap-2.5">
                {nomination.business && (
                  <img src={nomination.business.logo} alt={nomination.business.name} className="w-11 h-11 rounded-xl object-cover border-2 border-[#F7D6E0]" />
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-[#9D3A63]">💌 Community Pick</p>
                  <h3 className="font-extrabold text-xs text-[#3B2F27] truncate">{nomination.business?.name || 'A student shop'}</h3>
                </div>
              </div>
              <p className="relative text-[11px] text-[#6E5D52] leading-relaxed italic">"{nomination.reason}"</p>
              {nomination.publishedAt && (
                <p className="relative text-[10px] text-[#8C7A6D]">{formatRelativeTime(nomination.publishedAt)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {isFormOpen && <NominationForm onClose={() => setIsFormOpen(false)} />}
    </section>
  );
};
