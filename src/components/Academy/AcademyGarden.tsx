import React from 'react';
import { useAcademy } from '../../context/AppContext';
import { getLevelForXp } from '../../data/academyLevels';
import { GardenItem } from '../../types';
import { Icon } from '../Icon';

interface GrowthStage {
  name: string;
  icon: string;
}

const growthStageForLevel = (level: number): GrowthStage => {
  if (level >= 9) return { name: 'Grove', icon: 'level-grove' };
  if (level >= 7) return { name: 'Bloom', icon: 'level-bloom' };
  if (level >= 5) return { name: 'Bud', icon: 'level-bud' };
  if (level >= 3) return { name: 'Sprout', icon: 'level-sprout' };
  if (level >= 2) return { name: 'Seedling', icon: 'tab-academy' };
  return { name: 'Seed', icon: 'level-sprout' };
};

/** A fixed-size plot of soil — always 9 slots. Simpler than gating plot
 * count by level (a nice-to-have for later); every equipped item gets a
 * real, deliberate spot instead of free-floating in a pile. */
const PLOT_COUNT = 9;

const RARITY_RING: Record<GardenItem['rarity'], string> = {
  common: '',
  rare: 'ring-2 ring-[#A8D8EA]',
  epic: 'ring-2 ring-[#F7C948] animate-epic-glow',
};

interface AcademyGardenProps {
  onCustomize: () => void;
}

export const AcademyGarden: React.FC<AcademyGardenProps> = ({ onCustomize }) => {
  const { academyProfile, gardenCatalog, ownedGardenItems } = useAcademy();
  const level = getLevelForXp(academyProfile.xp);
  const stage = growthStageForLevel(level.level);

  const equippedItems = ownedGardenItems
    .filter((o) => o.equipped)
    .map((o) => gardenCatalog.find((g) => g.id === o.itemId))
    .filter((g): g is GardenItem => Boolean(g));

  const equippedByCategory = (category: string) => equippedItems.filter((i) => i.category === category);
  const plots: (GardenItem | null)[] = Array.from({ length: PLOT_COUNT }, (_, i) => equippedItems[i] || null);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-1">
        <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif] flex items-center gap-1.5">
          <Icon name="level-grove" className="w-5 h-5" /> Your Garden
        </h2>
        <p className="text-xs text-[#7A6B5F]">A living picture of your entrepreneurial growth — no stats required.</p>
      </div>

      <div className="rounded-3xl border border-[#EDE4D8] overflow-hidden shadow-xs">
        {/* Sky */}
        <div className="relative bg-gradient-to-b from-[#A8D8EA]/70 via-[#B8E6D5]/60 to-[#B8E6D5]/40 px-6 pt-8 pb-6 flex flex-col items-center gap-2 overflow-hidden">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/20 blur-xl" />
          <div className="absolute -top-4 -right-8 w-28 h-28 rounded-full bg-white/15 blur-xl" />
          <Icon name={stage.icon} className="w-24 h-24 animate-float-gentle relative z-10" />
          <p className="text-xs font-black text-[#194E3B] relative z-10">{stage.name} Stage</p>
          <p className="text-[11px] text-[#4A6B5E] relative z-10">Level {level.level} — {level.title}</p>
        </div>

        {/* Grass */}
        <div className="h-3 bg-gradient-to-b from-[#9FD9C3] to-[#7FC8A2]" />

        {/* Garden bed — a real grid of soil plots, not a floating pile */}
        <div className="bg-gradient-to-b from-[#7FC8A2] to-[#E4CFA5] px-5 pt-5 pb-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {plots.map((item, idx) => (
              <div
                key={item?.id || `empty-${idx}`}
                className={`aspect-square rounded-2xl flex items-center justify-center ${
                  item
                    ? `bg-[#D9C4A3] border border-[#C4A876] shadow-xs ${RARITY_RING[item.rarity]}`
                    : 'bg-[#E4CFA5]/50 border-2 border-dashed border-[#C4A876]/60'
                }`}
              >
                {item ? (
                  <Icon name={item.icon} alt={item.name} className="w-8 h-8 animate-float-gentle" />
                ) : (
                  <span className="text-[#C4A876] text-lg font-black">+</span>
                )}
              </div>
            ))}
          </div>

          {equippedItems.length === 0 && (
            <p className="text-center text-xs text-[#4A3D2E] flex items-center justify-center gap-1 flex-wrap">
              Your garden bed is empty — visit the Seed Shop to plant your first decoration
              <Icon name="level-sprout" className="w-3.5 h-3.5" />
            </p>
          )}

          <div className="flex items-center justify-center gap-4 text-[10px] text-[#4A3D2E] font-semibold pt-1 border-t border-[#C4A876]/40">
            <span className="flex items-center gap-1"><Icon name="shop-plant-sunflower" className="w-3 h-3" /> {equippedByCategory('plants').length} plants</span>
            <span className="flex items-center gap-1"><Icon name="shop-deco-butterfly" className="w-3 h-3" /> {equippedByCategory('decorations').length} decorations</span>
            <span className="flex items-center gap-1"><Icon name="shop-struct-garden-house" className="w-3 h-3" /> {equippedByCategory('structures').length} structures</span>
          </div>
        </div>
      </div>

      <button
        onClick={onCustomize}
        className="btn-bouncy w-full py-3 rounded-2xl bg-[#207559] hover:bg-[#194E3B] text-white text-xs font-black cursor-pointer flex items-center justify-center gap-1.5"
      >
        Customize Garden <Icon name="shop-frame-mint" className="w-4 h-4" />
      </button>
    </div>
  );
};
