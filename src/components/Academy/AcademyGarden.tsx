import React from 'react';
import { useApp } from '../../context/AppContext';
import { getLevelForXp } from '../../data/academyLevels';

interface GrowthStage {
  name: string;
  icon: string;
}

const growthStageForLevel = (level: number): GrowthStage => {
  if (level >= 9) return { name: 'Grove', icon: '🌳' };
  if (level >= 7) return { name: 'Bloom', icon: '🌸' };
  if (level >= 5) return { name: 'Bud', icon: '🌷' };
  if (level >= 3) return { name: 'Sprout', icon: '🌿' };
  if (level >= 2) return { name: 'Seedling', icon: '🌱' };
  return { name: 'Seed', icon: '🌰' };
};

interface AcademyGardenProps {
  onCustomize: () => void;
}

export const AcademyGarden: React.FC<AcademyGardenProps> = ({ onCustomize }) => {
  const { academyProfile, gardenCatalog, ownedGardenItems } = useApp();
  const level = getLevelForXp(academyProfile.xp);
  const stage = growthStageForLevel(level.level);

  const equippedItems = ownedGardenItems
    .filter((o) => o.equipped)
    .map((o) => gardenCatalog.find((g) => g.id === o.itemId))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  const equippedByCategory = (category: string) => equippedItems.filter((i) => i.category === category);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-1">
        <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">🌳 Your Garden</h2>
        <p className="text-xs text-[#7A6B5F]">A living picture of your entrepreneurial growth — no stats required.</p>
      </div>

      <div className="rounded-3xl border border-[#EDE4D8] overflow-hidden shadow-xs">
        <div className="bg-gradient-to-b from-[#A8D8EA]/50 to-[#B8E6D5]/40 px-6 pt-8 pb-4 flex flex-col items-center gap-2">
          <span className="text-7xl animate-float-gentle">{stage.icon}</span>
          <p className="text-xs font-black text-[#194E3B]">{stage.name} Stage</p>
          <p className="text-[11px] text-[#4A6B5E]">Level {level.level} — {level.title}</p>
        </div>
        <div className="bg-[#EFE6D6] px-5 py-5 space-y-3">
          {equippedItems.length === 0 ? (
            <p className="text-center text-xs text-[#8C7A6D] py-2">
              Your garden bed is empty — visit the Seed Shop to plant your first decoration 🌱
            </p>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {equippedItems.map((item) => (
                <span key={item.id} title={item.name} className="text-3xl">{item.emoji}</span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center gap-4 text-[10px] text-[#8C7A6D] pt-1">
            <span>🌷 {equippedByCategory('plants').length} plants</span>
            <span>🦋 {equippedByCategory('decorations').length} decorations</span>
            <span>🏡 {equippedByCategory('structures').length} structures</span>
          </div>
        </div>
      </div>

      <button
        onClick={onCustomize}
        className="btn-bouncy w-full py-3 rounded-2xl bg-[#207559] hover:bg-[#194E3B] text-white text-xs font-black cursor-pointer"
      >
        Customize Garden 🛍️
      </button>
    </div>
  );
};
