import test from 'node:test';
import assert from 'node:assert/strict';
import { makeDefaultShopDraft, applyBusinessUpdate } from './shop';
import type { Business } from '../types';

const seedBusinesses: Business[] = [
  {
    id: 'biz-1',
    sellerId: 'user-1',
    name: 'Old Shop',
    handle: 'oldshop',
    tagline: 'Old vibe',
    description: 'Old description',
    logo: 'https://example.com/logo.png',
    banner: 'https://example.com/banner.png',
    university: 'UP Diliman',
    campusPickupSpots: ['Gate 1'],
    category: 'Food & Drinks',
    gcashNumber: '0917-000-0000',
    rating: 5,
    reviewCount: 1,
    establishedDate: '2025-01-01',
    badges: ['Campus Verified'],
  },
  {
    id: 'biz-2',
    sellerId: 'user-1',
    name: 'Second Shop',
    handle: 'secondshop',
    tagline: 'Second vibe',
    description: 'Second description',
    logo: 'https://example.com/logo2.png',
    banner: 'https://example.com/banner2.png',
    university: 'Ateneo de Manila',
    campusPickupSpots: ['Gate 2'],
    category: 'Lifestyle & Gifts',
    gcashNumber: '0917-111-1111',
    rating: 4.9,
    reviewCount: 2,
    establishedDate: '2025-02-02',
    badges: ['New'],
  },
];

test('makeDefaultShopDraft creates a valid first store with a handle and default pickup spot', () => {
  const draft = makeDefaultShopDraft('user-1', 1, 'UP Diliman');

  assert.equal(draft.name.startsWith('Sprout'), true);
  assert.match(draft.handle, /^sprout/);
  assert.equal(draft.university, 'UP Diliman');
  assert.ok(draft.campusPickupSpots.includes('Campus Main Gate'));
  assert.equal(draft.gcashNumber.length > 0, true);
});

test('applyBusinessUpdate only updates the active business', () => {
  const updated = applyBusinessUpdate(seedBusinesses, 'biz-1', { tagline: 'New tagline', category: 'Digital & Tech' });

  assert.equal(updated[0].tagline, 'New tagline');
  assert.equal(updated[0].category, 'Digital & Tech');
  assert.equal(updated[1].tagline, 'Second vibe');
});
