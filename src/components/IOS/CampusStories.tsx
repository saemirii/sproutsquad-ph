import React from 'react';
import { useShop, useSession } from '../../context/AppContext';
import { Business, ProductCategory } from '../../types';
import { playIosTap } from '../../utils/haptics';
import { isSupabaseConfigured } from '../../lib/supabase';
import { CreateShopButton } from '../CreateShopButton';

interface CampusStoriesProps {
  onSelectBusiness: (business: Business) => void;
  /** Only show shops in this category — omit or pass 'All' to show every shop. */
  categoryFilter?: ProductCategory | 'All';
}

export const CampusStories: React.FC<CampusStoriesProps> = ({
  onSelectBusiness,
  categoryFilter = 'All',
}) => {
  const { businesses } = useShop();
  const { setCurrentView, setSellerTab } = useSession();

  const visibleBusinesses = categoryFilter === 'All'
    ? businesses
    : businesses.filter((biz) => biz.category === categoryFilter);

  const storyGradients = [
    'border-[#B8E6D5] bg-[#B8E6D5]/20',
    'border-[#FFD3BA] bg-[#FFD3BA]/20',
    'border-[#A8D8EA] bg-[#A8D8EA]/20',
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-1 px-1">
      <div className="flex items-center gap-3.5 min-w-max">
        {/* Create Your Own Venture Pill — placed first so
            it's visible without scrolling through every business first. */}
        <CreateShopButton
          onBeforeClick={() => {
            playIosTap();
            // Offline demo mode creates the shop instantly, so it's worth
            // jumping straight to it. Online, this just opens the
            // application form + waiting modal — nothing to navigate to yet.
            if (!isSupabaseConfigured) {
              setCurrentView('seller');
              setSellerTab('settings');
            }
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-full p-0.5 border-2 border-dashed border-[#B8E6D5] hover:border-[#194E3B] flex items-center justify-center bg-[#B8E6D5]/20">
            <span className="text-xl text-[#194E3B] font-black">+</span>
          </div>
          <span className="text-[10px] font-black text-[#194E3B] max-w-[62px] truncate">
            Create Shop
          </span>
        </CreateShopButton>

        {/* Verified Student Venture Stories — tapping one opens that shop's profile. */}
        {visibleBusinesses.map((biz, index) => {
          const borderStyle = storyGradients[index % storyGradients.length];

          return (
            <button
              key={biz.id}
              onClick={() => {
                playIosTap();
                onSelectBusiness(biz);
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 rounded-full p-0.5 border-2 flex items-center justify-center transition-all relative ${borderStyle}`}>
                <img
                  src={biz.logo}
                  alt={biz.name}
                  className="w-full h-full rounded-full object-cover border border-white shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#B8E6D5] text-[#194E3B] text-[8px] font-black flex items-center justify-center border border-white">
                  ✓
                </span>
              </div>
              <span className="text-[10px] font-bold max-w-[62px] truncate text-[#6B5B4F]">
                {biz.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
