import { SproutUpAmbassadorPick, SproutUpFeaturedSprout, SproutUpNomination } from '../types';

export const rowToSproutUpNomination = (row: any): SproutUpNomination => ({
  id: row.id,
  businessId: row.business_id,
  nominatedBy: row.nominated_by,
  reason: row.reason,
  status: row.status,
  moderatorId: row.moderator_id || undefined,
  moderatorNote: row.moderator_note || undefined,
  publishedAt: row.published_at || undefined,
  expiresAt: row.expires_at || undefined,
  createdAt: row.created_at,
});

export const rowToSproutUpAmbassadorPick = (row: any): SproutUpAmbassadorPick => ({
  id: row.id,
  businessId: row.business_id,
  ambassadorId: row.ambassador_id,
  headline: row.headline,
  description: row.description,
  status: row.status,
  moderatorId: row.moderator_id || undefined,
  moderatorNote: row.moderator_note || undefined,
  publishedAt: row.published_at || undefined,
  expiresAt: row.expires_at || undefined,
  createdAt: row.created_at,
});

export const rowToSproutUpFeaturedSprout = (row: any): SproutUpFeaturedSprout => ({
  id: row.id,
  businessId: row.business_id,
  title: row.title,
  description: row.description || '',
  imageUrl: row.image_url || undefined,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  isPublished: Boolean(row.is_published),
  sortOrder: row.sort_order,
  createdBy: row.created_by || undefined,
  createdAt: row.created_at,
});
