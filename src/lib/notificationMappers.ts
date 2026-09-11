import { AppNotification, NotificationAction, NotificationPreferences, NotificationType } from '../types';

export const rowToNotification = (row: any): AppNotification => ({
  id: row.id,
  type: row.type as NotificationType,
  title: row.title,
  message: row.message,
  isRead: Boolean(row.is_read),
  relatedId: row.related_id || undefined,
  relatedType: row.related_type || undefined,
  action: (row.action as NotificationAction) || undefined,
  createdAt: row.created_at,
});

export const rowToNotificationPreferences = (row: any): NotificationPreferences => ({
  orders: row.orders !== false,
  newProducts: row.new_products !== false,
  restocks: row.restocks !== false,
  promotions: row.promotions !== false,
  announcements: row.announcements !== false,
  sproutup: row.sproutup !== false,
});

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  orders: true,
  newProducts: true,
  restocks: true,
  promotions: true,
  announcements: true,
  sproutup: true,
};
