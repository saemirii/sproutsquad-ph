import React, { useState } from 'react';
import { Quote } from 'lucide-react';
import { Business } from '../../types';
import { useSproutUp, useSession } from '../../context/AppContext';
import { playIosTap } from '../../utils/haptics';
import { AmbassadorPickForm } from './AmbassadorPickForm';
import { SproutUpSectionHeader } from './shared/SproutUpSectionHeader';
import { SproutUpEmptyState } from './shared/SproutUpEmptyState';

interface AmbassadorPicksSectionProps {
  onSelectBusiness: (business: Business) => void;
}

export const AmbassadorPicksSection: React.FC<AmbassadorPicksSectionProps> = ({ onSelectBusiness }) => {
  const { sproutUpAmbassadorPicks } = useSproutUp();
  const { currentUser } = useSession();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section className="space-y-3">
      <SproutUpSectionHeader
        icon="🌟"
        iconBg="bg-[#FFE9A8]"
        title="Ambassador Picks"
        subtitle="Recommended by trusted Sprout Ambassadors."
        action={currentUser.isAmbassador && (
          <button
            onClick={() => { playIosTap(); setIsFormOpen(true); }}
            className="shrink-0 px-3 py-2 bg-[#FFE9A8] hover:bg-[#FFDF7E] text-[#7A5B0E] font-black text-[11px] rounded-2xl shadow-xs cursor-pointer btn-bouncy whitespace-nowrap"
          >
            Submit a Pick
          </button>
        )}
      />

      {sproutUpAmbassadorPicks.length === 0 ? (
        <SproutUpEmptyState icon="🌟" text="Our ambassadors are scouting for their next pick!" />
      ) : (
        <div className="space-y-2.5">
          {sproutUpAmbassadorPicks.map((pick) => (
            <div
              key={pick.id}
              onClick={() => { if (pick.business) { playIosTap(); onSelectBusiness(pick.business); } }}
              className="relative bg-white rounded-2xl border border-l-[5px] border-[#EDE4D8] border-l-[#FFE9A8] p-4 shadow-xs hover:shadow-md cursor-pointer active:scale-[0.98] transition-all btn-bouncy space-y-2 overflow-hidden"
            >
              <Quote className="absolute -top-1 right-3 w-10 h-10 text-[#FFE9A8]/70 rotate-180" fill="currentColor" strokeWidth={0} />
              <div className="relative flex items-center gap-2.5">
                {pick.business && (
                  <img src={pick.business.logo} alt={pick.business.name} className="w-11 h-11 rounded-xl object-cover border-2 border-[#FFE9A8]" />
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-[#7A5B0E]">🌟 Ambassador Pick</p>
                  <h3 className="font-extrabold text-xs text-[#3B2F27] truncate">{pick.headline}</h3>
                </div>
              </div>
              <p className="relative text-[11px] text-[#6E5D52] leading-relaxed italic">"{pick.description}"</p>
              <p className="relative text-[10px] font-bold text-[#194E3B]">— {pick.business?.name || 'A student shop'}</p>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && <AmbassadorPickForm onClose={() => setIsFormOpen(false)} />}
    </section>
  );
};
