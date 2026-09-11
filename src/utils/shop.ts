import { Business, CampusUniversity, ProductCategory } from '../types';

const defaultCategories: ProductCategory[] = [
  'Art & Creative',
  'Fashion & Accessories',
  'Food & Drinks',
  'Lifestyle & Gifts',
  'Digital & Tech',
  'Beauty & Self-Care',
  'Education & Services',
];

const campusFallbacks: Record<CampusUniversity, string> = {
  'MGC New Life Christian Academy': 'mgc',
  'UP Diliman': 'upd',
  'Ateneo de Manila': 'ateneo',
  'UST Manila': 'ust',
  'DLSU Manila': 'dlsu',
  'PUP Sta. Mesa': 'pup',
  'Mapua University': 'mapua',
  'FEU Manila': 'feu',
  'Polytechnic & State Universities': 'state',
  'All Campuses': 'campus',
};

export const makeDefaultShopDraft = (
  sellerId: string,
  orderIndex = 1,
  university: CampusUniversity | 'All Campuses' = 'MGC New Life Christian Academy'
) => {
  const safeUniversity = university === 'All Campuses' ? 'MGC New Life Christian Academy' : university;
  const baseName = `Sprout ${defaultCategories[(orderIndex - 1) % defaultCategories.length].split(' ')[0]}`.trim();
  const businessName = `${baseName} ${orderIndex}`.trim();
  const handle = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.${campusFallbacks[safeUniversity]}`;

  return {
    name: businessName,
    handle,
    tagline: 'Fresh campus finds, handmade with heart, and sold before your next class.',
    description: 'A brand-new student business built for campus hustle. Add your story, products, and meetup spots so classmates can discover your shop.',
    logo: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop&q=80',
    university: safeUniversity,
    campusPickupSpots: ['Campus Main Gate', 'Student Center Steps'],
    category: defaultCategories[(orderIndex - 1) % defaultCategories.length],
    gcashNumber: `0917-${String(100 + orderIndex).padStart(3, '0')}-${String(1000 + orderIndex).slice(-4)}`,
    instagramHandle: `@${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '')}`,
    tiktokHandle: `@${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '')}`,
    mayaNumber: `0917-${String(200 + orderIndex).padStart(3, '0')}-${String(1000 + orderIndex).slice(-4)}`,
  } satisfies Omit<Business, 'id' | 'sellerId' | 'rating' | 'reviewCount' | 'establishedDate' | 'badges'>;
};

export const applyBusinessUpdate = (
  businesses: Business[],
  businessId: string,
  updates: Partial<Business>
) => businesses.map((business) => (business.id === businessId ? { ...business, ...updates } : business));
