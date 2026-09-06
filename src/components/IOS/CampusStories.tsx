import React from 'react';
import { useApp } from '../../context/AppContext';
import { Business } from '../../types';
import { playIosTap } from '../../utils/haptics';
import { isSupabaseConfigured } from '../../lib/supabase';
import { CreateShopButton } from '../CreateShopButton';

interface CampusStoriesProps {
  onSelectBusiness: (business: Business) => void;
  selectedBizId?: string | null;
  onClearFilter?: () => void;
}

export const CampusStories: React.FC<CampusStoriesProps> = ({
  onSelectBusiness,
  selectedBizId,
  onClearFilter,
}) => {
  const { businesses, setCurrentView, setSellerTab } = useApp();

  const storyGradients = [
    'border-[#B8E6D5] bg-[#B8E6D5]/20',
    'border-[#FFD3BA] bg-[#FFD3BA]/20',
    'border-[#A8D8EA] bg-[#A8D8EA]/20',
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-1 px-1">
      <div className="flex items-center gap-3.5 min-w-max">
        {/* "All Shops" Story Circle */}
        <button
          onClick={() => {
            playIosTap();
            if (onClearFilter) onClearFilter();
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
        >
          <div
            className={`w-14 h-14 rounded-full p-0.5 border-2 flex items-center justify-center transition-all ${
              !selectedBizId
                ? 'border-[#194E3B] bg-[#B8E6D5]'
                : 'border-[#EDE4D8] bg-white'
            }`}
          >
            <div className="w-full h-full rounded-full bg-[#FFF9E6] flex items-center justify-center text-xl shadow-inner">
              ✨
            </div>
          </div>
          <span
            className={`text-[10px] font-extrabold max-w-[62px] truncate ${
              !selectedBizId ? 'text-[#194E3B]' : 'text-[#6B5B4F]'
            }`}
          >
            All Drops
          </span>
        </button>

        {/* Create Your Own Venture Pill — placed right after "All Drops" so
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

        {/* Verified Student Venture Stories */}
        {businesses.map((biz, index) => {
          const isSelected = selectedBizId === biz.id;
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
              <div
                className={`w-14 h-14 rounded-full p-0.5 border-2 flex items-center justify-center transition-all relative ${
                  isSelected ? 'border-[#194E3B] ring-2 ring-[#B8E6D5]' : borderStyle
                }`}
              >
                <img
                  src={biz.logo}
                  alt={biz.name}
                  className="w-full h-full rounded-full object-cover border border-white shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#B8E6D5] text-[#194E3B] text-[8px] font-black flex items-center justify-center border border-white">
                  ✓
                </span>
              </div>
              <span
                className={`text-[10px] font-bold max-w-[62px] truncate ${
                  isSelected ? 'text-[#194E3B] font-extrabold' : 'text-[#6B5B4F]'
                }`}
              >
                {biz.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
