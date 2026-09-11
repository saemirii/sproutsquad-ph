import { NotificationType } from '../../types';

export const NOTIFICATION_ICON: Record<NotificationType, string> = {
  order_placed: '🌱',
  new_order: '🌱',
  order_accepted: '🌿',
  order_ready: '🌸',
  order_out_for_delivery: '🚚',
  order_completed: '✅',
  order_cancelled: '🥀',
  order_received: '✅',
  low_stock: '🍃',
  out_of_stock: '🍃',
  shop_new_product: '🌱',
  shop_restock: '🌿',
  shop_promotion: '🏷️',
  welcome: '🌱',
  subscription_update: '✨',
  announcement: '📣',
  sproutup_hidden_gem: '👀',
  sproutup_rising_sprout: '📈',
  sproutup_shop_featured: '🚀',
  sproutup_nomination_published: '💌',
  sproutup_ambassador_pick_published: '🌟',
  sproutup_featured_sprout_live: '✨',
  academy_lesson_available: '📚',
  academy_lesson_completed: '🌿',
  academy_xp_earned: '⭐',
  academy_achievement_unlocked: '🏆',
  academy_streak_maintained: '🔥',
};

export { formatRelativeTime } from '../../utils/formatRelativeTime';
