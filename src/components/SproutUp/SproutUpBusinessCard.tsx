import React from 'react';
import { Heart, ChevronRight } from 'lucide-react';
import { Business, SproutUpFeatureType } from '../../types';
import { useNotifications } from '../../context/AppContext';
import { playIosTap } from '../../utils/haptics';

interface SproutUpBusinessCardProps {
  business: Business & { sproutUpRank: number; sproutUpScore: number };
  featureType: Extract<SproutUpFeatureType, 'hidden_gem' | 'rising_sprout'>;
  onSelect: (business: Business) => void;
  highlighted?: boolean;
}

const ACCENT = {
  hidden_gem: { ring: 'ring-[#B8E6D5]', border: 'border-[#B8E6D5]' },
  rising_sprout: { ring: 'ring-[#A8D8EA]', border: 'border-[#A8D8EA]' },
} as const;

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export const SproutUpBusinessCard: React.FC<SproutUpBusinessCardProps> = ({
  business,
  featureType,
  onSelect,
  highlighted,
}) => {
  const { favoritedBusinessIds, toggleFavoriteBusiness } = useNotifications();
  const isFavorited = favoritedBusinessIds.includes(business.id);
  const accent = ACCENT[featureType];
  const medal = MEDALS[business.sproutUpRank];

  const whyChip =
    featureType === 'hidden_gem'
      ? `⭐ ${business.rating} rating`
      : `📈 +${business.sproutUpScore}% orders this week`;

  return (
    <div
      onClick={() => {
        playIosTap();
        onSelect(business);
      }}
      className={`relative bg-white rounded-2xl border p-3 flex items-center gap-3 shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer btn-bouncy ${
        highlighted ? `${accent.border} ring-2 ${accent.ring} animate-pulse-ring` : 'border-[#EDE4D8]'
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={business.logo}
          alt={business.name}
          className={`w-14 h-14 rounded-2xl object-cover border-2 ${accent.border}`}
        />
        {medal && (
          <span className="absolute -top-1.5 -left-1.5 text-base drop-shadow-sm leading-none">{medal}</span>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <h3 className="font-extrabold text-xs text-[#3B2F27] truncate font-['Nunito',sans-serif]">
            {business.name}
          </h3>
          <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black bg-[#A8D8EA] text-[#1B4E6B] shrink-0">
            {business.category.split(' ')[0]}
          </span>
        </div>
        <p className="text-[10px] text-[#6B5B4F] line-clamp-1">{business.description || business.tagline}</p>
        <div className="flex items-center gap-2 text-[10px] pt-0.5">
          <span className="text-[#194E3B] font-bold">📍 {business.university.split(' ')[0]}</span>
          <span className="text-[#7A341A] font-bold">{whyChip}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            void toggleFavoriteBusiness(business.id);
          }}
          title={isFavorited ? 'Unfollow this shop' : 'Follow this shop'}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
            isFavorited ? 'bg-[#FFD3BA] text-[#7A341A]' : 'bg-[#FAF3DE] text-[#8C7A6D]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-[#7A341A]' : ''}`} />
        </button>
        <ChevronRight className="w-4 h-4 text-[#8C7A6D]" />
      </div>
    </div>
  );
};
