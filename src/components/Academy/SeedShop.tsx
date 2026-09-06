import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SeedBalance } from './shared/SeedBalance';
import { GardenItemCategory } from '../../types';
import { isSeasonalItemFeatured } from '../../data/gardenItems';

const CATEGORY_LABELS: Record<GardenItemCategory, string> = {
  plants: '🌷 Plants',
  decorations: '🦋 Decorations',
  structures: '🏡 Structures',
  profile: '🖼️ Profile',
  seasonal: '🎉 Seasonal',
};

const CATEGORY_ORDER: GardenItemCategory[] = ['seasonal', 'plants', 'decorations', 'structures', 'profile'];

const rarityBorder: Record<string, string> = {
  common: 'border-[#EDE4D8]',
  rare: 'border-[#A8D8EA]',
  epic: 'border-[#FFD3BA]',
};

export const SeedShop: React.FC = () => {
  const { academyProfile, gardenCatalog, ownedGardenItems, purchaseGardenItem, equipGardenItem } = useApp();
  const [activeCategory, setActiveCategory] = useState<GardenItemCategory>('plants');
  const [message, setMessage] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const ownedById = new Map(ownedGardenItems.map((o) => [o.itemId, o]));

  const items = gardenCatalog
    .filter((item) => item.category === activeCategory)
    .filter((item) => activeCategory !== 'seasonal' || isSeasonalItemFeatured(item))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handlePurchase = async (itemId: string) => {
    setBusyItemId(itemId);
    setMessage(null);
    const result = await purchaseGardenItem(itemId);
    if (!result.success) setMessage(result.message || 'Purchase failed');
    setBusyItemId(null);
  };

  const handleEquipToggle = async (itemId: string, equipped: boolean) => {
    setBusyItemId(itemId);
    await equipGardenItem(itemId, !equipped);
    setBusyItemId(null);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">🛍️ Seed Shop</h2>
          <p className="text-xs text-[#7A6B5F]">Spend Seeds on garden decorations — purely cosmetic, never a shortcut.</p>
        </div>
        <SeedBalance seeds={academyProfile.seeds} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn-bouncy shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer border ${
              activeCategory === cat ? 'bg-[#B8E6D5] border-[#71C7A5] text-[#194E3B]' : 'bg-white border-[#EDE4D8] text-[#8C7A6D]'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {message && (
        <div className="bg-[#FEE2E2] border border-[#EF4444]/40 text-[#991B1B] text-xs font-bold rounded-2xl px-4 py-2.5">
          {message}
        </div>
      )}

      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6 text-center space-y-1">
          <span className="text-2xl block">🗓️</span>
          <p className="text-xs font-bold text-[#3B2F27]">No seasonal items are featured right now</p>
          <p className="text-[11px] text-[#8C7A6D]">Check back closer to the next campus event or holiday!</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const owned = ownedById.get(item.id);
          const isBusy = busyItemId === item.id;
          return (
            <div key={item.id} className={`bg-white rounded-2xl border-2 ${rarityBorder[item.rarity]} p-4 space-y-2 text-center`}>
              <span className="text-3xl block">{item.emoji}</span>
              <p className="text-xs font-bold text-[#3B2F27] truncate">{item.name}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#A39284]">{item.rarity}</p>

              {!owned ? (
                <button
                  onClick={() => void handlePurchase(item.id)}
                  disabled={isBusy || academyProfile.seeds < item.priceSeeds}
                  className="btn-bouncy w-full py-2 rounded-xl bg-[#207559] hover:bg-[#194E3B] disabled:opacity-40 text-white text-[11px] font-black cursor-pointer flex items-center justify-center gap-1"
                >
                  🌰 {item.priceSeeds}
                </button>
              ) : (
                <button
                  onClick={() => void handleEquipToggle(item.id, owned.equipped)}
                  disabled={isBusy}
                  className={`btn-bouncy w-full py-2 rounded-xl text-[11px] font-black cursor-pointer ${
                    owned.equipped ? 'bg-[#194E3B] text-white' : 'bg-[#FAF7F2] border border-[#E5DACD] text-[#3B2F27]'
                  }`}
                >
                  {owned.equipped ? 'Equipped ✓' : 'Equip'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
