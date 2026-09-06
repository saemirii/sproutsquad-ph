import { GardenItem } from '../types';

/**
 * Client-side mirror of the `garden_items` catalog seeded in
 * supabase/migration_10_academy_gamification.sql — used for the offline/
 * no-Supabase fallback mode and for instant render before the catalog
 * fetch resolves. Keep in sync with the migration's seed insert.
 */
export const initialGardenItems: GardenItem[] = [
  { id: 'plant-tulip', name: 'Tulip', category: 'plants', emoji: '🌷', priceSeeds: 60, rarity: 'common', sortOrder: 1 },
  { id: 'plant-sunflower', name: 'Sunflower', category: 'plants', emoji: '🌻', priceSeeds: 90, rarity: 'common', sortOrder: 2 },
  { id: 'plant-strawberry', name: 'Strawberry Plant', category: 'plants', emoji: '🍓', priceSeeds: 120, rarity: 'rare', sortOrder: 3 },
  { id: 'plant-small-tree', name: 'Small Tree', category: 'plants', emoji: '🌳', priceSeeds: 180, rarity: 'rare', sortOrder: 4 },
  { id: 'plant-cactus', name: 'Cactus', category: 'plants', emoji: '🌵', priceSeeds: 70, rarity: 'common', sortOrder: 5 },
  { id: 'plant-mushroom', name: 'Mushroom', category: 'plants', emoji: '🍄', priceSeeds: 50, rarity: 'common', sortOrder: 6 },
  { id: 'deco-butterfly', name: 'Butterfly', category: 'decorations', emoji: '🦋', priceSeeds: 80, rarity: 'common', sortOrder: 7 },
  { id: 'deco-bee', name: 'Bee', category: 'decorations', emoji: '🐝', priceSeeds: 80, rarity: 'common', sortOrder: 8 },
  { id: 'deco-rocks', name: 'Rocks', category: 'decorations', emoji: '🪨', priceSeeds: 40, rarity: 'common', sortOrder: 9 },
  { id: 'deco-sign', name: 'Garden Sign', category: 'decorations', emoji: '🪧', priceSeeds: 60, rarity: 'common', sortOrder: 10 },
  { id: 'deco-lantern', name: 'Lantern', category: 'decorations', emoji: '🏮', priceSeeds: 100, rarity: 'rare', sortOrder: 11 },
  { id: 'deco-bench', name: 'Small Bench', category: 'decorations', emoji: '🪑', priceSeeds: 150, rarity: 'rare', sortOrder: 12 },
  { id: 'struct-greenhouse', name: 'Tiny Greenhouse', category: 'structures', emoji: '🏡', priceSeeds: 300, rarity: 'epic', sortOrder: 13 },
  { id: 'struct-house', name: 'Garden House', category: 'structures', emoji: '🏠', priceSeeds: 400, rarity: 'epic', sortOrder: 14 },
  { id: 'struct-stand', name: 'Plant Stand', category: 'structures', emoji: '🪴', priceSeeds: 220, rarity: 'rare', sortOrder: 15 },
  { id: 'struct-watering', name: 'Watering Station', category: 'structures', emoji: '🚿', priceSeeds: 220, rarity: 'rare', sortOrder: 16 },
  { id: 'profile-frame-gold', name: 'Golden Frame', category: 'profile', emoji: '🖼️', priceSeeds: 250, rarity: 'rare', sortOrder: 17 },
  { id: 'profile-frame-mint', name: 'Mint Frame', category: 'profile', emoji: '🖼️', priceSeeds: 150, rarity: 'common', sortOrder: 18 },
  { id: 'profile-badge-sprout', name: 'Sprout Badge', category: 'profile', emoji: '🌱', priceSeeds: 100, rarity: 'common', sortOrder: 19 },
  { id: 'profile-name-sparkle', name: 'Sparkle Name', category: 'profile', emoji: '✨', priceSeeds: 200, rarity: 'rare', sortOrder: 20 },
  { id: 'season-halloween', name: 'Pumpkin Patch', category: 'seasonal', emoji: '🎃', priceSeeds: 90, rarity: 'common', seasonalTag: 'halloween', sortOrder: 21 },
  { id: 'season-christmas', name: 'Christmas Parol', category: 'seasonal', emoji: '🎄', priceSeeds: 120, rarity: 'rare', seasonalTag: 'christmas', sortOrder: 22 },
  { id: 'season-newyear', name: 'New Year Fireworks', category: 'seasonal', emoji: '🎆', priceSeeds: 100, rarity: 'common', seasonalTag: 'new_year', sortOrder: 23 },
  { id: 'season-valentine', name: 'Valentine Roses', category: 'seasonal', emoji: '🌹', priceSeeds: 90, rarity: 'common', seasonalTag: 'valentine', sortOrder: 24 },
  { id: 'season-spring', name: 'Cherry Blossom', category: 'seasonal', emoji: '🌸', priceSeeds: 100, rarity: 'common', seasonalTag: 'spring', sortOrder: 25 },
  { id: 'season-ph-sampaguita', name: 'Sampaguita Garland', category: 'seasonal', emoji: '🌼', priceSeeds: 130, rarity: 'rare', seasonalTag: 'ph_fiesta', sortOrder: 26 },
  { id: 'season-ph-buntings', name: 'Fiesta Buntings', category: 'seasonal', emoji: '🎊', priceSeeds: 110, rarity: 'common', seasonalTag: 'ph_fiesta', sortOrder: 27 },
];

/** Month numbers (1-12) each seasonal tag is "featured" in the shop. */
export const SEASONAL_TAG_MONTHS: Record<string, number[]> = {
  halloween: [10],
  christmas: [11, 12],
  new_year: [1],
  valentine: [2],
  spring: [3, 4],
  ph_fiesta: [5, 6],
};

export const isSeasonalItemFeatured = (item: GardenItem, now: Date = new Date()): boolean => {
  if (!item.seasonalTag) return true;
  const months = SEASONAL_TAG_MONTHS[item.seasonalTag];
  if (!months) return true;
  return months.includes(now.getMonth() + 1);
};
