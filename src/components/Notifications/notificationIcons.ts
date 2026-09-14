import { NotificationType } from '../../types';

// Values are keys into src/assets/icons/ (rendered via <Icon name={...} />).
// Only 5 notification types have dedicated art (generic/promotion/
// announcement/xp-earned/lesson-available) — the rest reuse the closest
// order-status, SproutUp, or Academy icon for the event they describe.
export const NOTIFICATION_ICON: Record<NotificationType, string> = {
  order_placed: 'order-preparing',
  new_order: 'order-preparing',
  order_accepted: 'order-preparing',
  order_ready: 'order-out-for-delivery',
  order_out_for_delivery: 'order-out-for-delivery',
  order_completed: 'order-completed',
  order_cancelled: 'streak-warning',
  order_received: 'order-completed',
  order_issue_reported: 'badge-low-stock',
  low_stock: 'badge-low-stock',
  out_of_stock: 'badge-low-stock',
  shop_new_product: 'notification-generic',
  shop_restock: 'notification-generic',
  shop_promotion: 'notification-promotion',
  welcome: 'notification-generic',
  subscription_update: 'celebration-burst',
  announcement: 'notification-announcement',
  sproutup_hidden_gem: 'sproutup-hidden-gem',
  sproutup_rising_sprout: 'level-grower',
  sproutup_shop_featured: 'sproutup-featured-sprout',
  sproutup_nomination_published: 'celebration-burst',
  sproutup_ambassador_pick_published: 'sproutup-ambassador-pick',
  sproutup_featured_sprout_live: 'sproutup-featured-sprout',
  academy_lesson_available: 'notification-lesson-available',
  academy_lesson_completed: 'lesson-continue-learning',
  academy_xp_earned: 'notification-xp-earned',
  academy_achievement_unlocked: 'achievements-header',
  academy_streak_maintained: 'streak-warning',
};

export { formatRelativeTime } from '../../utils/formatRelativeTime';
