import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Business,
  Product,
  Order,
  Expense,
  Coupon,
  Lesson,
  User,
  CartItem,
  BusinessMetrics,
  OrderStatus,
  Role,
  CampusUniversity,
  DeliveryMethod,
  AcademyProfile,
  Achievement,
  GardenItem,
  UserGardenItem,
  Quest,
  QuestProgress,
  SquadChallenge,
  SquadChallengeProgress,
  RewardResult,
  LearningActivityType,
  AppNotification,
  NotificationAction,
  NotificationPreferences,
  NotificationPreferenceCategory,
} from '../types';
import {
  initialBusinesses,
  initialProducts,
  initialOrders,
  initialExpenses,
  initialLessons,
  initialUsers
} from '../data/seedData';
import { calculateBusinessMetrics } from '../utils/analytics';
import { safeSetItem } from '../utils/safeStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ACADEMY_LEVELS } from '../data/academyLevels';
import { initialAchievements } from '../data/academyAchievements';
import { initialGardenItems } from '../data/gardenItems';
import { initialQuests } from '../data/academyQuests';
import {
  rowToAcademyProfile,
  rowToUserGardenItem,
  rowToQuestProgress,
  rowToSquadChallenge,
} from '../lib/academyMappers';
import {
  OfflineAcademyState,
  createEmptyOfflineAcademyState,
  awardLearningActivityOffline,
  purchaseGardenItemOffline,
  equipGardenItemOffline,
  claimQuestRewardOffline,
} from '../lib/offlineAcademyEngine';
import {
  rowToNotification,
  rowToNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../lib/notificationMappers';
import type { IosActiveTab } from '../components/IOS/IosTabBar';
import type { Offerings, Package } from '@revenuecat/purchases-js';
import {
  identifyRevenueCatUser,
  resetRevenueCatUser,
  fetchSproutPlusOfferings,
  purchaseSproutPlus,
  fetchCustomerInfo,
  buildSubscriptionStatus,
  isUserCancelledError,
  describePurchasesError,
  isRevenueCatConfigured,
  DEFAULT_SUBSCRIPTION_STATUS,
  type SproutPlusStatus,
} from '../lib/revenuecat';
import {
  businessToRow,
  rowToBusiness,
  productToRow,
  rowToProduct,
  rowToOrder,
  expenseToRow,
  rowToExpense,
  rowToProfile,
  couponToRow,
  rowToCoupon,
} from '../lib/supabaseMappers';

interface AppContextType {
  // Navigation & Role
  currentView: 'marketplace' | 'seller' | 'academy' | 'business-detail';
  setCurrentView: (view: 'marketplace' | 'seller' | 'academy' | 'business-detail') => void;
  sellerTab: 'overview' | 'products' | 'orders' | 'delivery' | 'expenses' | 'academy' | 'settings';
  setSellerTab: (tab: 'overview' | 'products' | 'orders' | 'delivery' | 'expenses' | 'academy' | 'settings') => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  updateCurrentUser: (updated: Partial<User>) => void;
  activeBusiness: Business;
  setActiveBusiness: (business: Business) => void;
  accessibleBusinessIds: string[];
  unlockBusinessByKey: (besKey: string) => Promise<{ success: boolean; businessId?: string; businessName?: string; message?: string }>;
  selectedBusinessForDetail: Business | null;
  setSelectedBusinessForDetail: (business: Business | null) => void;
  selectedCampusFilter: CampusUniversity | 'All Campuses';
  setSelectedCampusFilter: (campus: CampusUniversity | 'All Campuses') => void;
  /** A one-shot request to switch the iOS tab bar's active tab (and optionally a business
   * or order to focus) — set by resolveNotificationAction() since the active iOS tab lives
   * outside this context, in App.tsx's local state. App.tsx applies the tab switch (and
   * clears it, for the business case); for the order case, IosBagView itself consumes
   * orderId (to highlight/scroll to that order) and clears it once it has. */
  pendingNavigation: { tab: IosActiveTab; businessId?: string; orderId?: string } | null;
  setPendingNavigation: (nav: { tab: IosActiveTab; businessId?: string; orderId?: string } | null) => void;

  // Data Collections
  businesses: Business[];
  products: Product[];
  orders: Order[];
  expenses: Expense[];
  coupons: Coupon[];
  lessons: Lesson[];
  completedLessonIds: string[];
  cart: CartItem[];

  // Sprout Academy Gamification
  academyProfile: AcademyProfile;
  achievements: Achievement[];
  unlockedAchievementIds: string[];
  /** Counts of learning_activities by activity_type, for locked-achievement progress display. */
  activityCounts: Record<string, number>;
  gardenCatalog: GardenItem[];
  ownedGardenItems: UserGardenItem[];
  quests: Quest[];
  questProgress: Record<string, QuestProgress>;
  activeSquadChallenge: SquadChallenge | null;
  squadChallengeProgress: SquadChallengeProgress | null;
  lastReward: RewardResult | null;
  clearLastReward: () => void;
  pendingLevelUp: { level: number; title: string; icon: string; seedBonus: number } | null;
  clearPendingLevelUp: () => void;

  // Computed
  activeBusinessMetrics: BusinessMetrics;
  sellerOrders: Order[];
  sellerProducts: Product[];
  sellerExpenses: Expense[];
  sellerCoupons: Coupon[];
  cartCount: number;
  cartTotal: number;

  // Actions
  addProduct: (product: Omit<Product, 'id' | 'businessId' | 'businessName' | 'soldCount'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateDeliverySchedule: (orderId: string, deliveryMethod: DeliveryMethod, deliveryDate: string) => void;
  confirmOrderReceived: (orderId: string) => Promise<{ success: boolean; message?: string }>;
  addExpense: (expense: Omit<Expense, 'id' | 'businessId'>) => void;
  deleteExpense: (expenseId: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'businessId' | 'redemptionCount' | 'createdAt'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;
  validateCoupon: (code: string, businessId: string, subtotal: number) => { coupon: Coupon; discount: number } | { error: string };
  updateBusinessProfile: (updated: Partial<Business>) => void;
  createBusiness: (newBiz: Omit<Business, 'id' | 'sellerId' | 'rating' | 'reviewCount' | 'establishedDate' | 'badges'>) => void;

  // Sprout Academy Gamification Actions
  awardLearningActivity: (activityType: LearningActivityType, refId: string, xp: number, seeds: number) => Promise<RewardResult>;
  completeLessonWithQuiz: (lessonId: string, isFirstAttempt: boolean) => Promise<RewardResult>;
  completeSimulation: (scenarioId: string, xp: number, seeds: number) => Promise<RewardResult>;
  purchaseGardenItem: (itemId: string) => Promise<{ success: boolean; message?: string }>;
  equipGardenItem: (itemId: string, equip: boolean) => Promise<void>;
  claimQuest: (questId: string, periodKey: string) => Promise<RewardResult>;
  refreshSquadChallenge: () => Promise<void>;
  claimSquadChallengeReward: () => Promise<RewardResult>;
  setLeaderboardOptIn: (optIn: boolean) => Promise<void>;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  notificationPreferences: NotificationPreferences;
  favoritedBusinessIds: string[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateNotificationPreference: (category: NotificationPreferenceCategory, enabled: boolean) => Promise<void>;
  toggleFavoriteBusiness: (businessId: string) => Promise<void>;
  resolveNotificationAction: (action?: NotificationAction) => void;
  /** Fetches an older page of notifications past what's currently loaded (online only — offline mode's small local list is always loaded in full). Returns the rows fetched, empty when there's nothing older. */
  loadMoreNotifications: () => Promise<AppNotification[]>;

  // Cart & Checkout Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (orderData: {
    customerName: string;
    customerContact: string;
    customerUniversity: CampusUniversity;
    paymentMethod: 'GCash' | 'Maya' | 'Cash on Campus Meetup';
    fulfillmentType: 'Campus Meetup' | 'Locker/Dept Pickup' | 'Dorm Delivery';
    deliveryMethod?: DeliveryMethod;
    deliveryDate?: string;
    meetupLocation: string;
    notes?: string;
    couponCode?: string;
  }) => Promise<{ success: boolean; orders: Order[]; failureReason?: string }>;

  // AI Business Coach
  askAiCoach: (userQuestion?: string) => Promise<{ advice: string; fallback: boolean }>;
  isAiCoachLoading: boolean;

  // Utilities
  triggerConfetti: () => void;
  resetToDefaultData: () => void;
  isRemoteDataLoading: boolean;
  signOut: () => void;

  // Sprout+ Subscription (RevenueCat)
  subscription: SproutPlusStatus;
  hasSproutPlus: boolean;
  isSubscriptionPageOpen: boolean;
  openSubscriptionPage: () => void;
  closeSubscriptionPage: () => void;
  offerings: Offerings | null;
  isRevenueCatReady: boolean;
  isOfferingsLoading: boolean;
  offeringsError: string | null;
  loadSproutPlusOfferings: () => Promise<void>;
  isPurchasingSproutPlus: boolean;
  purchaseSproutPlusPackage: (pkg: Package) => Promise<{ success: boolean; cancelled?: boolean; message?: string }>;
  restoreSproutPlusPurchases: () => Promise<{ success: boolean; message?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const seededBusinessNames = Object.fromEntries(
  initialBusinesses.map((business) => [business.id, business.name])
);

const defaultSchool: CampusUniversity = 'MGC New Life Christian Academy';

const EMPTY_BUSINESS: Business = {
  id: '',
  sellerId: '',
  name: 'No shop yet',
  handle: '',
  tagline: '',
  description: '',
  logo: '',
  banner: '',
  university: defaultSchool,
  campusPickupSpots: [],
  category: 'School Supplies',
  gcashNumber: '',
  rating: 0,
  reviewCount: 0,
  establishedDate: new Date().toISOString().split('T')[0],
  badges: [],
};

export interface AuthenticatedUser {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
}

interface AppProviderProps {
  children: React.ReactNode;
  authUser?: AuthenticatedUser;
  onSignOut?: () => void;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, authUser, onSignOut }) => {
  // Load state from localStorage or fallback to seeds (offline/local-account mode only —
  // when Supabase is configured, these start empty and are populated by the fetch effect below)
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem('sproutsquad_businesses');
    const storedBusinesses: Business[] = saved ? JSON.parse(saved) : initialBusinesses;
    const deletedSproutIds = storedBusinesses
      .filter((business) => business.name.trim().toLowerCase().startsWith('sprout '))
      .map((business) => business.id);
    if (deletedSproutIds.length > 0) {
      safeSetItem('sproutsquad_deleted_businesses', JSON.stringify(deletedSproutIds));
    }
    const storedById = new Map(storedBusinesses.map((business) => [business.id, business]));
    const mergedBusinesses = initialBusinesses.map((seedBusiness) => ({
      ...seedBusiness,
      ...storedById.get(seedBusiness.id),
      name: seedBusiness.name,
      logo: seedBusiness.logo,
      banner: seedBusiness.banner,
    }));
    const customBusinesses = storedBusinesses.filter(
      (business) => !initialBusinesses.some((seedBusiness) => seedBusiness.id === business.id)
    );
    return [...mergedBusinesses, ...customBusinesses]
      .filter((business) => !deletedSproutIds.includes(business.id))
      .map((business) => ({
      ...business,
      name: seededBusinessNames[business.id as keyof typeof seededBusinessNames] || business.name,
      university: defaultSchool,
      }));
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem('sproutsquad_products');
    const storedProducts: Product[] = saved ? JSON.parse(saved) : initialProducts;
    const deletedBusinessIds: string[] = JSON.parse(localStorage.getItem('sproutsquad_deleted_businesses') || '[]');
    const storedById = new Map(storedProducts.map((product) => [product.id, product]));
    const mergedProducts = initialProducts.map((seedProduct) => ({
      ...seedProduct,
      ...storedById.get(seedProduct.id),
      businessName: seededBusinessNames[seedProduct.businessId as keyof typeof seededBusinessNames] || seedProduct.businessName,
      university: defaultSchool,
      name: seedProduct.name,
      description: seedProduct.description,
      category: seedProduct.category,
      imageUrl: seedProduct.imageUrl,
      tags: seedProduct.tags,
      unit: seedProduct.unit,
    }));
    const customProducts = storedProducts.filter(
      (product) => !initialProducts.some((seedProduct) => seedProduct.id === product.id)
    );
    return [...mergedProducts, ...customProducts].filter((product) => !deletedBusinessIds.includes(product.businessId));
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem('sproutsquad_orders');
    const storedOrders: Order[] = saved ? JSON.parse(saved) : initialOrders;
    const deletedBusinessIds: string[] = JSON.parse(localStorage.getItem('sproutsquad_deleted_businesses') || '[]');
    return storedOrders.map((order) => ({
      ...order,
      businessName: seededBusinessNames[order.businessId as keyof typeof seededBusinessNames] || order.businessName,
      customerUniversity: defaultSchool,
    })).filter((order) => !deletedBusinessIds.includes(order.businessId));
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem('sproutsquad_expenses');
    const deletedBusinessIds: string[] = JSON.parse(localStorage.getItem('sproutsquad_deleted_businesses') || '[]');
    const storedExpenses: Expense[] = saved ? JSON.parse(saved) : initialExpenses;
    return storedExpenses.filter((expense) => !deletedBusinessIds.includes(expense.businessId));
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem('sproutsquad_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  const [lessons] = useState<Lesson[]>(initialLessons);

  // Sprout Academy Gamification state. Catalogs (achievements/garden items/
  // quests) are static content mirrored from the DB seed data — same
  // pattern as `lessons` above, which has never round-tripped through
  // Supabase either. Only per-user progress (profile, unlocks, ownership,
  // quest progress, completed lesson ids) is actually fetched/persisted.
  const [achievements] = useState<Achievement[]>(initialAchievements);
  const [gardenCatalog] = useState<GardenItem[]>(initialGardenItems);
  const [quests] = useState<Quest[]>(initialQuests);

  const [offlineAcademy, setOfflineAcademy] = useState<OfflineAcademyState>(() => {
    if (isSupabaseConfigured) return createEmptyOfflineAcademyState();
    const saved = localStorage.getItem('sproutsquad_academy_offline');
    return saved ? JSON.parse(saved) : createEmptyOfflineAcademyState();
  });
  // completeLessonWithQuiz/completeSimulation fire several sequential
  // awardLearningActivity calls before React re-renders — each would
  // otherwise read the same stale `offlineAcademy` closure and clobber the
  // previous call's update when it sets state. This ref is updated
  // synchronously alongside every setOfflineAcademy call so each subsequent
  // call in the same sequence reads the latest value instead.
  const offlineAcademyRef = useRef(offlineAcademy);
  const updateOfflineAcademy = (next: OfflineAcademyState) => {
    offlineAcademyRef.current = next;
    setOfflineAcademy(next);
  };

  // Online-mode copies (populated by the fetch effect / RPC calls below).
  // Ignored entirely in offline mode — `offlineAcademy` is the source of
  // truth there instead. Exposed to the rest of the app via the derived
  // consts further down (academyProfile, unlockedAchievementIds, etc.).
  const [onlineAcademyProfile, setOnlineAcademyProfile] = useState<AcademyProfile>({
    xp: 0, seeds: 0, streakCount: 0, longestStreak: 0, lastActivityDate: null, leaderboardOptIn: true,
  });
  const [onlineUnlockedAchievementIds, setOnlineUnlockedAchievementIds] = useState<string[]>([]);
  const [onlineOwnedGardenItems, setOnlineOwnedGardenItems] = useState<UserGardenItem[]>([]);
  const [onlineQuestProgressMap, setOnlineQuestProgressMap] = useState<Record<string, QuestProgress>>({});
  const [onlineCompletedLessonIds, setOnlineCompletedLessonIds] = useState<string[]>([]);
  const [onlineActivityCounts, setOnlineActivityCounts] = useState<Record<string, number>>({});
  const [activeSquadChallenge, setActiveSquadChallenge] = useState<SquadChallenge | null>(null);
  const [squadChallengeProgress, setSquadChallengeProgress] = useState<SquadChallengeProgress | null>(null);
  const [lastReward, setLastReward] = useState<RewardResult | null>(null);
  const [pendingLevelUp, setPendingLevelUp] = useState<{ level: number; title: string; icon: string; seedBonus: number } | null>(null);

  const academyProfile = isSupabaseConfigured ? onlineAcademyProfile : offlineAcademy.profile;
  const unlockedAchievementIds = isSupabaseConfigured ? onlineUnlockedAchievementIds : offlineAcademy.unlockedAchievementIds;
  const ownedGardenItems = isSupabaseConfigured ? onlineOwnedGardenItems : offlineAcademy.ownedGardenItems;
  const questProgress = isSupabaseConfigured ? onlineQuestProgressMap : offlineAcademy.questProgress;
  const completedLessonIds = isSupabaseConfigured
    ? onlineCompletedLessonIds
    : Object.keys(offlineAcademy.claimedActivities)
        .filter((key) => key.startsWith('lesson_complete:'))
        .map((key) => key.slice('lesson_complete:'.length));
  const activityCounts = isSupabaseConfigured
    ? onlineActivityCounts
    : Object.keys(offlineAcademy.claimedActivities).reduce<Record<string, number>>((acc, key) => {
        const type = key.split(':')[0];
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

  // Notifications state. Online rows come from Supabase (fetched + kept live
  // via Realtime below); offline/local-demo mode synthesizes equivalent
  // notifications inline at the relevant action (placeOrder, updateOrderStatus,
  // etc. — see synthesizeOfflineNotification) since there are no real
  // triggers to hook into there.
  const [onlineNotifications, setOnlineNotifications] = useState<AppNotification[]>([]);
  const [onlineNotificationPreferences, setOnlineNotificationPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [onlineFavoritedBusinessIds, setOnlineFavoritedBusinessIds] = useState<string[]>([]);

  const [offlineNotifications, setOfflineNotifications] = useState<AppNotification[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem(`sproutsquad_notifications_${authUser?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [offlineNotificationPreferences, setOfflineNotificationPreferences] = useState<NotificationPreferences>(() => {
    if (isSupabaseConfigured) return DEFAULT_NOTIFICATION_PREFERENCES;
    const saved = localStorage.getItem(`sproutsquad_notification_prefs_${authUser?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATION_PREFERENCES;
  });
  const [offlineFavoritedBusinessIds, setOfflineFavoritedBusinessIds] = useState<string[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem(`sproutsquad_favorites_${authUser?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : [];
  });

  const notifications = isSupabaseConfigured ? onlineNotifications : offlineNotifications;
  const notificationPreferences = isSupabaseConfigured ? onlineNotificationPreferences : offlineNotificationPreferences;
  const favoritedBusinessIds = isSupabaseConfigured ? onlineFavoritedBusinessIds : offlineFavoritedBusinessIds;
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  const [currentUser, setCurrentUser] = useState<User>(() => ({
    ...initialUsers[0],
    university: defaultSchool,
    id: authUser?.id || initialUsers[0].id,
    name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || initialUsers[0].name,
    email: authUser?.email || initialUsers[0].email,
  }));
  const [activeBusinessId, setActiveBusinessId] = useState<string>(isSupabaseConfigured ? '' : 'biz-1');
  const [isRemoteDataLoading, setIsRemoteDataLoading] = useState<boolean>(isSupabaseConfigured);
  const [unlockedBusinessIds, setUnlockedBusinessIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`sproutsquad_access_${authUser?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedBusinessForDetail, setSelectedBusinessForDetail] = useState<Business | null>(null);

  const [currentView, setCurrentView] = useState<'marketplace' | 'seller' | 'academy' | 'business-detail'>('marketplace');
  const [sellerTab, setSellerTab] = useState<'overview' | 'products' | 'orders' | 'delivery' | 'expenses' | 'academy' | 'settings'>('overview');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<CampusUniversity | 'All Campuses'>('All Campuses');
  const [pendingNavigation, setPendingNavigation] = useState<{ tab: IosActiveTab; businessId?: string; orderId?: string } | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sproutsquad_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAiCoachLoading, setIsAiCoachLoading] = useState<boolean>(false);

  // Sprout+ Subscription (RevenueCat) state
  const [subscription, setSubscription] = useState<SproutPlusStatus>(DEFAULT_SUBSCRIPTION_STATUS);
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [isOfferingsLoading, setIsOfferingsLoading] = useState(false);
  const [offeringsError, setOfferingsError] = useState<string | null>(null);
  const [isPurchasingSproutPlus, setIsPurchasingSproutPlus] = useState(false);
  const [isSubscriptionPageOpen, setIsSubscriptionPageOpen] = useState(false);

  const updateCurrentUser = (updated: Partial<User>) => {
    setCurrentUser((previous) => ({ ...previous, ...updated }));
    if (supabase && authUser) {
      const profileUpdate: Record<string, unknown> = {};
      if (updated.name !== undefined) profileUpdate.full_name = updated.name;
      if (updated.university !== undefined) profileUpdate.university = updated.university;
      if (updated.avatar !== undefined) profileUpdate.avatar = updated.avatar;
      if (Object.keys(profileUpdate).length > 0) {
        void supabase.from('profiles').update(profileUpdate).eq('id', authUser.id).then(({ error }) => {
          if (error) console.error('Failed to sync profile', error);
        });
      }
    }
  };

  const accessibleBusinessIds = businesses
    .filter((business) => business.sellerId === currentUser.id || unlockedBusinessIds.includes(business.id))
    .map((business) => business.id);

  // Joins a business by BES key alone — the server resolves which business
  // the key belongs to, so the client never needs to know/display a
  // business id (or browse a list of every business) to use it. Replaces
  // the older businessId+key check, which also depended on business.besKey
  // being cached client-side — no longer safe now that bes_key isn't
  // broadly fetched (see migration_11_bes_key_privacy.sql).
  const unlockBusinessByKey = async (besKey: string): Promise<{ success: boolean; businessId?: string; businessName?: string; message?: string }> => {
    const trimmed = besKey.trim();
    if (!trimmed) return { success: false, message: 'Enter a BES key.' };

    if (supabase) {
      const { data, error } = await supabase.rpc('join_business_by_bes_key_only', { entered_bes_key: trimmed });
      if (error) return { success: false, message: error.message || 'Could not unlock that shop.' };
      const row: any = Array.isArray(data) ? data[0] : data;
      if (!row?.business_id) return { success: false, message: 'That BES key is not valid.' };
      setUnlockedBusinessIds((previous) => (previous.includes(row.business_id) ? previous : [...previous, row.business_id]));
      setBusinesses((previous) => previous.map((b) => (b.id === row.business_id ? { ...b, besKey: trimmed } : b)));
      return { success: true, businessId: row.business_id, businessName: row.business_name };
    }

    // Offline/local-account fallback: search local demo businesses directly.
    const match = businesses.find((candidate) => candidate.besKey === trimmed);
    if (!match) return { success: false, message: 'That BES key is not valid.' };
    setUnlockedBusinessIds((previous) => (previous.includes(match.id) ? previous : [...previous, match.id]));
    return { success: true, businessId: match.id, businessName: match.name };
  };

  useEffect(() => {
    safeSetItem(`sproutsquad_access_${currentUser.id}`, JSON.stringify(unlockedBusinessIds));
  }, [currentUser.id, unlockedBusinessIds]);

  useEffect(() => {
    if (!authUser) return;
    setCurrentUser((previous) => ({
      ...previous,
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || previous.name,
      email: authUser.email || previous.email,
    }));
  }, [authUser]);

  // Identify this user with RevenueCat using their stable SproutSquad user id,
  // so the same person always maps to the same RevenueCat customer — never a
  // randomly generated one. Skipped entirely if RevenueCat isn't configured.
  //
  // isRevenueCatReady only flips true once this settles (success or failure).
  // Anything that calls the SDK (like loading offerings) must wait for it —
  // React runs a child's effects before its parent's, so without this guard
  // a page mounted alongside this provider could call the SDK before
  // `configure()` has actually run, and see a misleading "not configured" error.
  const [isRevenueCatReady, setIsRevenueCatReady] = useState(!isRevenueCatConfigured);
  useEffect(() => {
    if (!authUser?.id || !isRevenueCatConfigured) return;
    let cancelled = false;
    identifyRevenueCatUser(authUser.id)
      .then((customerInfo) => {
        if (cancelled) return;
        setSubscription(buildSubscriptionStatus(customerInfo));
      })
      .catch((error) => console.error('Failed to identify RevenueCat user', error))
      .finally(() => { if (!cancelled) setIsRevenueCatReady(true); });
    return () => { cancelled = true; };
  }, [authUser?.id]);

  // Best-effort refresh of subscription status: the Web SDK has no push
  // listener for entitlement changes, so re-check whenever the tab regains
  // focus (e.g. user just finished managing billing in another tab).
  useEffect(() => {
    if (!authUser?.id || !isRevenueCatConfigured) return;
    const handleFocus = () => {
      fetchCustomerInfo()
        .then((customerInfo) => setSubscription(buildSubscriptionStatus(customerInfo)))
        .catch((error) => console.error('Failed to refresh RevenueCat customer info', error));
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [authUser?.id]);

  const loadSproutPlusOfferings = useCallback(async () => {
    // Not a failure to retry — there's simply no RevenueCat key configured.
    // Leave both offerings and offeringsError null so the UI shows its
    // distinct "not configured" message instead of a misleading retry button.
    if (!isRevenueCatConfigured) return;
    // RevenueCat hasn't finished configuring yet (see isRevenueCatReady above).
    // Callers re-invoke once it flips true; don't show an error meanwhile.
    if (!isRevenueCatReady) return;

    setIsOfferingsLoading(true);
    setOfferingsError(null);
    try {
      const result = await fetchSproutPlusOfferings();
      setOfferings(result);
    } catch (error) {
      console.error('Failed to load Sprout+ offerings', error);
      setOfferingsError(describePurchasesError(error));
    } finally {
      setIsOfferingsLoading(false);
    }
  }, [isRevenueCatReady]);

  // A ref (not state) guards against double-submission so the check is never
  // subject to a stale closure, regardless of when this callback was created.
  const isPurchasingRef = useRef(false);
  const purchaseSproutPlusPackage = useCallback(async (pkg: Package) => {
    if (isPurchasingRef.current) return { success: false, message: 'A purchase is already in progress.' };
    isPurchasingRef.current = true;
    setIsPurchasingSproutPlus(true);
    try {
      const result = await purchaseSproutPlus(pkg);
      setSubscription(buildSubscriptionStatus(result.customerInfo));
      return { success: true };
    } catch (error) {
      if (isUserCancelledError(error)) {
        return { success: false, cancelled: true };
      }
      console.error('Sprout+ purchase failed', error);
      return { success: false, message: describePurchasesError(error) };
    } finally {
      isPurchasingRef.current = false;
      setIsPurchasingSproutPlus(false);
    }
  }, []);

  const restoreSproutPlusPurchases = useCallback(async () => {
    try {
      // The Web Billing SDK ties purchases to the identified app user id directly
      // (there's no separate device/store receipt to "restore" like on mobile),
      // so refreshing customer info for the current user is the web equivalent.
      const customerInfo = await fetchCustomerInfo();
      const status = buildSubscriptionStatus(customerInfo);
      setSubscription(status);
      return status.hasSproutPlus
        ? { success: true, message: 'Sprout+ is active on this account.' }
        : { success: true, message: 'No active Sprout+ subscription was found for this account.' };
    } catch (error) {
      console.error('Failed to restore Sprout+ purchases', error);
      return { success: false, message: describePurchasesError(error) };
    }
  }, []);

  // Load real data from Supabase (businesses/products are shared marketplace data,
  // orders/expenses/profile are scoped to this user via RLS).
  //
  // The `logo` / `image_url` columns hold base64 data URLs from user uploads and can
  // run into megabytes per row, which made the initial load painfully slow. We fetch
  // every other column first so the app can render almost immediately, then backfill
  // the images in the background without blocking or re-showing the loading screen.
  // bes_key is deliberately excluded here — see migration_11_bes_key_privacy.sql.
  // SELECT on that column is revoked for client roles entirely (an owner's
  // own key is fetched separately below via the get_my_business_bes_key RPC),
  // since this businesses query is shared, public marketplace data (RLS
  // allows anyone to read every row) and previously leaked every shop's
  // "secret" key to every signed-in user.
  const BUSINESS_LIGHT_COLUMNS = 'id, seller_id, name, handle, tagline, description, banner, university, campus_pickup_spots, category, gcash_number, maya_number, instagram_handle, tiktok_handle, rating, review_count, established_date, badges';
  const PRODUCT_LIGHT_COLUMNS = 'id, business_id, business_name, university, name, description, price, cost_price, category, inventory_count, tags, is_available, unit, sku, sold_count, bundled_product_ids, is_pre_order, pre_order_release_date, drop_date';

  useEffect(() => {
    if (!supabase || !authUser) return;
    let cancelled = false;

    setIsRemoteDataLoading(true);
    Promise.all([
      supabase.from('businesses').select(BUSINESS_LIGHT_COLUMNS),
      supabase.from('products').select(PRODUCT_LIGHT_COLUMNS),
      supabase.from('orders').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('coupons').select('*'),
      supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
    ]).then(([businessesRes, productsRes, ordersRes, expensesRes, couponsRes, profileRes]) => {
      if (cancelled) return;

      if (businessesRes.error) console.error('Failed to load businesses', businessesRes.error);
      else {
        const loadedBusinesses = (businessesRes.data || []).map(rowToBusiness);
        setBusinesses(loadedBusinesses);

        // bes_key can no longer be bulk-fetched (see BUSINESS_LIGHT_COLUMNS
        // above) — pull it in just for shops this user owns, one RPC call
        // each, so they can still view/share their own key.
        const ownedBusinessIds = loadedBusinesses
          .filter((b) => b.sellerId === authUser.id)
          .map((b) => b.id);
        for (const ownedId of ownedBusinessIds) {
          void supabase.rpc('get_my_business_bes_key', { target_business_id: ownedId }).then(({ data, error }) => {
            if (cancelled || error || !data) return;
            setBusinesses((previous) => previous.map((b) => (b.id === ownedId ? { ...b, besKey: data as string } : b)));
          });
        }
      }

      if (productsRes.error) console.error('Failed to load products', productsRes.error);
      else setProducts((productsRes.data || []).map(rowToProduct));

      if (ordersRes.error) console.error('Failed to load orders', ordersRes.error);
      else setOrders((ordersRes.data || []).map(rowToOrder));

      if (expensesRes.error) console.error('Failed to load expenses', expensesRes.error);
      else setExpenses((expensesRes.data || []).map(rowToExpense));

      if (couponsRes.error) console.error('Failed to load coupons', couponsRes.error);
      else setCoupons((couponsRes.data || []).map(rowToCoupon));

      if (profileRes.error) console.error('Failed to load profile', profileRes.error);
      else if (profileRes.data) {
        const profile = rowToProfile(profileRes.data);
        setCurrentUser((previous) => ({
          ...previous,
          name: profile.name || previous.name,
          university: profile.university || previous.university,
          avatar: profile.avatar || previous.avatar,
        }));
      }

      setIsRemoteDataLoading(false);

      void supabase.from('businesses').select('id, logo').then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const logoById = new Map(data.map((row) => [row.id, row.logo as string]));
        setBusinesses((previous) => previous.map((b) => (
          logoById.has(b.id) ? { ...b, logo: logoById.get(b.id) || b.logo } : b
        )));
      });

      void supabase.from('products').select('id, image_url').then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const imageById = new Map(data.map((row) => [row.id, row.image_url as string]));
        setProducts((previous) => previous.map((p) => (
          imageById.has(p.id) ? { ...p, imageUrl: imageById.get(p.id) || p.imageUrl } : p
        )));
      });
    });

    return () => { cancelled = true; };
  }, [authUser?.id]);

  // Load per-user Sprout Academy gamification progress. Catalogs
  // (achievements/garden items/quests) are static (see above) — only
  // progress specific to this student is fetched here.
  const syncAcademyProgress = useCallback(async () => {
    if (!supabase || !authUser) return;
    const [achRes, questRes] = await Promise.all([
      supabase.from('user_achievements').select('achievement_id').eq('user_id', authUser.id),
      supabase.from('user_quest_progress').select('*').eq('user_id', authUser.id),
    ]);
    if (!achRes.error && achRes.data) {
      setOnlineUnlockedAchievementIds(achRes.data.map((row: any) => row.achievement_id));
    }
    if (!questRes.error && questRes.data) {
      const map: Record<string, QuestProgress> = {};
      for (const row of questRes.data) {
        const qp = rowToQuestProgress(row);
        map[`${qp.questId}:${qp.periodKey}`] = qp;
      }
      setOnlineQuestProgressMap(map);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (!supabase || !authUser) return;
    let cancelled = false;

    Promise.all([
      supabase.from('academy_profiles').select('*').eq('user_id', authUser.id).maybeSingle(),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', authUser.id),
      supabase.from('user_garden_items').select('*').eq('user_id', authUser.id),
      supabase.from('user_quest_progress').select('*').eq('user_id', authUser.id),
      supabase.from('learning_activities').select('activity_type, ref_id').eq('user_id', authUser.id),
    ]).then(([profileRes, achRes, gardenRes, questRes, activityRes]) => {
      if (cancelled) return;

      if (profileRes.error) console.error('Failed to load academy profile', profileRes.error);
      else if (profileRes.data) setOnlineAcademyProfile(rowToAcademyProfile(profileRes.data));

      if (achRes.error) console.error('Failed to load achievements', achRes.error);
      else if (achRes.data) setOnlineUnlockedAchievementIds(achRes.data.map((row: any) => row.achievement_id));

      if (gardenRes.error) console.error('Failed to load garden items', gardenRes.error);
      else if (gardenRes.data) setOnlineOwnedGardenItems(gardenRes.data.map(rowToUserGardenItem));

      if (questRes.error) console.error('Failed to load quest progress', questRes.error);
      else if (questRes.data) {
        const map: Record<string, QuestProgress> = {};
        for (const row of questRes.data) {
          const qp = rowToQuestProgress(row);
          map[`${qp.questId}:${qp.periodKey}`] = qp;
        }
        setOnlineQuestProgressMap(map);
      }

      if (activityRes.error) console.error('Failed to load learning activities', activityRes.error);
      else if (activityRes.data) {
        setOnlineCompletedLessonIds(
          activityRes.data.filter((row: any) => row.activity_type === 'lesson_complete').map((row: any) => row.ref_id)
        );
        const counts: Record<string, number> = {};
        for (const row of activityRes.data) {
          counts[row.activity_type] = (counts[row.activity_type] || 0) + 1;
        }
        setOnlineActivityCounts(counts);
      }
    });

    return () => { cancelled = true; };
  }, [authUser?.id]);

  // Load this user's notifications, preferences, and favorited shops.
  useEffect(() => {
    if (!supabase || !authUser) return;
    let cancelled = false;

    Promise.all([
      supabase.from('notifications').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('notification_preferences').select('*').eq('user_id', authUser.id).maybeSingle(),
      supabase.from('business_favorites').select('business_id').eq('user_id', authUser.id),
    ]).then(([notifRes, prefRes, favRes]) => {
      if (cancelled) return;

      if (notifRes.error) console.error('Failed to load notifications', notifRes.error);
      else setOnlineNotifications((notifRes.data || []).map(rowToNotification));

      if (prefRes.error) console.error('Failed to load notification preferences', prefRes.error);
      else if (prefRes.data) setOnlineNotificationPreferences(rowToNotificationPreferences(prefRes.data));

      if (favRes.error) console.error('Failed to load favorited shops', favRes.error);
      else setOnlineFavoritedBusinessIds((favRes.data || []).map((row: any) => row.business_id));
    });

    return () => { cancelled = true; };
  }, [authUser?.id]);

  // Realtime: new notifications (an order status change, a new order, a
  // restock, etc.) arrive live without any polling or manual refresh.
  useEffect(() => {
    if (!supabase || !authUser) return;

    const channel = supabase
      .channel(`notifications:${authUser.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${authUser.id}` },
        (payload) => {
          setOnlineNotifications((previous) => [rowToNotification(payload.new), ...previous]);
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [authUser?.id]);

  // Realtime: order status changes. updateOrderStatus / confirm_order_received
  // only ever updated the *acting* client's own optimistic state plus the DB
  // row — with no subscription here, any other open session looking at the
  // same order (the customer's own "My Bag" tab, a teammate's Shop OS tab,
  // another device) stayed frozen on the old status until a manual reload.
  // No `filter` is needed: Postgres Changes is RLS-scoped, so each client
  // only ever receives rows the same "Customers and shop owners can view
  // orders" policy already lets them select — identical visibility to the
  // initial fetch above.
  useEffect(() => {
    if (!supabase || !authUser) return;

    const channel = supabase
      .channel(`orders:${authUser.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((previous) =>
            previous.some((o) => o.id === (payload.new as any).id) ? previous : [rowToOrder(payload.new), ...previous]
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((previous) => previous.map((o) => (o.id === (payload.new as any).id ? rowToOrder(payload.new) : o)));
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [authUser?.id]);

  // Sync to localStorage — only in offline/local-account mode. When Supabase is
  // configured, these arrays (which can carry large base64 image data URLs) are
  // already durably stored server-side, and mirroring them locally is both
  // pointless (nothing reads it back) and risky (can exceed the storage quota).
  useEffect(() => {
    if (isSupabaseConfigured) return;
    safeSetItem('sproutsquad_businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    safeSetItem('sproutsquad_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    safeSetItem('sproutsquad_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    safeSetItem('sproutsquad_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    safeSetItem('sproutsquad_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    safeSetItem('sproutsquad_academy_offline', JSON.stringify(offlineAcademy));
  }, [offlineAcademy]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    safeSetItem(`sproutsquad_notifications_${currentUser.id}`, JSON.stringify(offlineNotifications));
  }, [offlineNotifications, currentUser.id]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    safeSetItem(`sproutsquad_notification_prefs_${currentUser.id}`, JSON.stringify(offlineNotificationPreferences));
  }, [offlineNotificationPreferences, currentUser.id]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    safeSetItem(`sproutsquad_favorites_${currentUser.id}`, JSON.stringify(offlineFavoritedBusinessIds));
  }, [offlineFavoritedBusinessIds, currentUser.id]);

  useEffect(() => {
    safeSetItem('sproutsquad_cart', JSON.stringify(cart));
  }, [cart]);

  // Derived state for the active business
  const activeBusiness =
    businesses.find((b) => b.id === activeBusinessId)
    || businesses.find((b) => b.sellerId === currentUser.id)
    || businesses[0]
    || EMPTY_BUSINESS;
  const sellerProducts = products.filter((p) => p.businessId === activeBusiness.id);
  const sellerOrders = orders.filter((o) => o.businessId === activeBusiness.id);
  const sellerExpenses = expenses.filter((e) => e.businessId === activeBusiness.id);
  const sellerCoupons = coupons.filter((c) => c.businessId === activeBusiness.id);

  const activeBusinessMetrics = calculateBusinessMetrics(
    sellerOrders,
    sellerExpenses,
    sellerProducts,
    completedLessonIds
  );

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B8E6D5', '#FFD3BA', '#A8D8EA', '#71C7A5', '#F59E0B'],
      });
    } catch (e) {
      console.log('Confetti triggered', e);
    }
  };

  // Product Actions
  const addProduct = (prodData: Omit<Product, 'id' | 'businessId' | 'businessName' | 'soldCount'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      businessId: activeBusiness.id,
      businessName: activeBusiness.name,
      soldCount: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
    if (supabase) {
      void supabase.from('products').insert(productToRow(newProduct)).then(({ error }) => {
        if (error) console.error('Failed to save product', error);
      });
    }
    triggerConfetti();
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (supabase) {
      void supabase.from('products').update(productToRow(updated)).eq('id', updated.id).then(({ error }) => {
        if (error) console.error('Failed to update product', error);
      });
    }
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (supabase) {
      void supabase.from('products').delete().eq('id', productId).then(({ error }) => {
        if (error) console.error('Failed to delete product', error);
      });
    }
  };

  // Order Actions
  const ORDER_STATUS_NOTIFICATION: Partial<Record<OrderStatus, { type: AppNotification['type']; title: string; message: string }>> = {
    Preparing: { type: 'order_accepted', title: '🌿 Order accepted!', message: 'has been accepted and is being prepared.' },
    'Ready for Pickup': { type: 'order_ready', title: '🌸 Ready for pickup!', message: 'is ready for pickup.' },
    'Out for Delivery': { type: 'order_out_for_delivery', title: '🚚 Out for delivery!', message: 'is on its way.' },
    Completed: { type: 'order_completed', title: 'Order completed', message: 'is complete. Thanks for supporting a student shop!' },
    Cancelled: { type: 'order_cancelled', title: 'Order cancelled', message: 'was cancelled.' },
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    let nextPaymentStatus: Order['paymentStatus'] | undefined;
    const orderRef = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, orderStatus: status };
          if (status === 'Completed') {
            updated.paymentStatus = 'Paid';
          }
          nextPaymentStatus = updated.paymentStatus;
          return updated;
        }
        return o;
      })
    );
    if (supabase) {
      const patch: Record<string, unknown> = { order_status: status };
      if (nextPaymentStatus) patch.payment_status = nextPaymentStatus;
      void supabase.from('orders').update(patch).eq('id', orderId).then(({ error }) => {
        if (error) console.error('Failed to update order status', error);
      });
      // Online, a database trigger (notify_order_status_changed, see
      // migration_12) creates the customer's notification automatically —
      // no client call needed.
    } else if (orderRef) {
      // Offline/local-demo mode has no trigger, so synthesize the equivalent.
      const notice = ORDER_STATUS_NOTIFICATION[status];
      if (notice) {
        synthesizeOfflineNotification(
          notice.type, notice.title,
          `Your order from ${orderRef.businessName} ${notice.message}`,
          orderId, 'order', { view: 'customer_order', orderId }
        );
      }
    }
    if (status === 'Completed') {
      triggerConfetti();
    }
  };

  const updateDeliverySchedule = (orderId: string, deliveryMethod: DeliveryMethod, deliveryDate: string) => {
    let nextPaymentStatus: Order['paymentStatus'] | undefined;
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const nextOrder = { ...order, deliveryMethod, deliveryDate };
        if (deliveryMethod === 'Cash on Delivery') {
          nextOrder.paymentStatus = 'Pay on Delivery';
        }
        nextPaymentStatus = nextOrder.paymentStatus;
        return nextOrder;
      })
    );
    if (supabase) {
      const patch: Record<string, unknown> = { delivery_method: deliveryMethod, delivery_date: deliveryDate };
      if (nextPaymentStatus) patch.payment_status = nextPaymentStatus;
      void supabase.from('orders').update(patch).eq('id', orderId).then(({ error }) => {
        if (error) console.error('Failed to update delivery schedule', error);
      });
    }
  };

  // Lets the customer themselves close out an order (once it's Ready for
  // Pickup / Out for Delivery) instead of only ever waiting on the seller
  // to remember to mark it complete. Online, this goes through
  // confirm_order_received (migration_14) — a security-definer RPC rather
  // than a broadened RLS policy, so a customer can only ever move their
  // own order through this one validated transition, never edit price or
  // status fields directly.
  const confirmOrderReceived = async (orderId: string): Promise<{ success: boolean; message?: string }> => {
    const orderRef = orders.find((o) => o.id === orderId);
    if (!orderRef) return { success: false, message: 'Order not found' };

    if (supabase) {
      const { error } = await supabase.rpc('confirm_order_received', { p_order_id: orderId });
      if (error) {
        console.error('Failed to confirm order received', error);
        return { success: false, message: error.message || 'Could not confirm this order right now' };
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'Completed', paymentStatus: 'Paid' } : o)));
      // The RPC's own trigger notifies the customer; it also directly
      // notifies the seller's team that the customer confirmed receipt.
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'Completed', paymentStatus: 'Paid' } : o)));
      synthesizeOfflineNotification(
        'order_completed', 'Order completed', `Your order from ${orderRef.businessName} is complete. Thanks for supporting a student shop!`,
        orderId, 'order', { view: 'customer_order', orderId }
      );
    }
    triggerConfetti();
    return { success: true };
  };

  // Expense Actions
  const addExpense = (expenseData: Omit<Expense, 'id' | 'businessId'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      businessId: activeBusiness.id,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    if (supabase) {
      void supabase.from('expenses').insert(expenseToRow(newExpense)).then(({ error }) => {
        if (error) console.error('Failed to save expense', error);
      });
    }
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    if (supabase) {
      void supabase.from('expenses').delete().eq('id', expenseId).then(({ error }) => {
        if (error) console.error('Failed to delete expense', error);
      });
    }
  };

  // Coupon Actions (Sprout+)
  const addCoupon = (couponData: Omit<Coupon, 'id' | 'businessId' | 'redemptionCount' | 'createdAt'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      code: couponData.code.trim().toUpperCase(),
      id: `cpn-${Date.now()}`,
      businessId: activeBusiness.id,
      redemptionCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    if (supabase) {
      void supabase.from('coupons').insert(couponToRow(newCoupon)).then(({ error }) => {
        if (error) console.error('Failed to save coupon', error);
      });
    }
    triggerConfetti();
  };

  const updateCoupon = (updated: Coupon) => {
    const normalized = { ...updated, code: updated.code.trim().toUpperCase() };
    setCoupons((prev) => prev.map((c) => (c.id === normalized.id ? normalized : c)));
    if (supabase) {
      void supabase.from('coupons').update(couponToRow(normalized)).eq('id', normalized.id).then(({ error }) => {
        if (error) console.error('Failed to update coupon', error);
      });
    }
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    if (supabase) {
      void supabase.from('coupons').delete().eq('id', couponId).then(({ error }) => {
        if (error) console.error('Failed to delete coupon', error);
      });
    }
  };

  // Looks up and validates a coupon code for a specific shop's cart subtotal.
  // Returns the coupon plus the peso discount it produces, or a plain-English
  // error message — never throws, so checkout UI can just branch on the shape.
  const validateCoupon = (
    code: string,
    businessId: string,
    subtotal: number
  ): { coupon: Coupon; discount: number } | { error: string } => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { error: 'Enter a coupon code.' };

    const match = coupons.find((c) => c.businessId === businessId && c.code === normalized);
    if (!match) return { error: 'That coupon code was not found for this shop.' };
    if (!match.isActive) return { error: 'That coupon is no longer active.' };
    if (match.expiresAt && new Date(match.expiresAt).getTime() < Date.now()) {
      return { error: 'That coupon has expired.' };
    }
    if (match.maxRedemptions !== null && match.redemptionCount >= match.maxRedemptions) {
      return { error: 'That coupon has reached its redemption limit.' };
    }

    const discount = match.discountType === 'percentage'
      ? Math.round(subtotal * (match.discountValue / 100))
      : Math.min(match.discountValue, subtotal);

    return { coupon: match, discount };
  };

  // Business Profile Actions
  const updateBusinessProfile = (updatedData: Partial<Business>) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === activeBusiness.id ? { ...b, ...updatedData } : b))
    );
    if (supabase) {
      const merged = { ...activeBusiness, ...updatedData };
      void supabase.from('businesses').update(businessToRow(merged)).eq('id', activeBusiness.id).then(({ error }) => {
        if (error) console.error('Failed to update business profile', error);
      });
    }
  };

  const createBusiness = (newBizData: Omit<Business, 'id' | 'sellerId' | 'rating' | 'reviewCount' | 'establishedDate' | 'badges'>) => {
    const newId = `biz-${Date.now()}`;
    const newBiz: Business = {
      ...newBizData,
      id: newId,
      sellerId: currentUser.id,
      rating: 5.0,
      reviewCount: 0,
      establishedDate: new Date().toISOString().split('T')[0],
      badges: ['New Sprout 🌱', 'Campus Verified'],
      besKey: `BES-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    };
    setBusinesses((prev) => [newBiz, ...prev]);
    if (supabase) {
      void supabase.from('businesses').insert(businessToRow(newBiz)).then(({ error }) => {
        if (error) console.error('Failed to save business', error);
      });
    }
    setActiveBusinessId(newId);
    setCurrentView('seller');
    setSellerTab('settings');
    triggerConfetti();
  };

  // ===================================================================
  // Sprout Academy Gamification Actions
  // ===================================================================

  const applyLevelUpIfAny = (result: RewardResult) => {
    if (result.leveledUp && result.newLevel) {
      const levelInfo = ACADEMY_LEVELS.find((l) => l.level === result.newLevel);
      if (levelInfo) {
        setPendingLevelUp({ level: levelInfo.level, title: levelInfo.title, icon: levelInfo.icon, seedBonus: result.levelSeedBonus || 0 });
      }
    }
  };

  // The single core reward primitive — every other gamification action is
  // built on top of this. Online, it calls the award_learning_activity RPC
  // (security definer, anti-double-claim via a unique ledger constraint);
  // offline, the equivalent logic runs locally (see offlineAcademyEngine.ts).
  // Deliberately does NOT set lastReward/pendingLevelUp itself — callers that
  // may fire several of these for one user action (see completeLessonWithQuiz)
  // combine the results into a single toast/celebration.
  const awardLearningActivity = async (
    activityType: LearningActivityType,
    refId: string,
    xp: number,
    seeds: number
  ): Promise<RewardResult> => {
    if (supabase && authUser) {
      const { data, error } = await supabase.rpc('award_learning_activity', {
        p_activity_type: activityType,
        p_ref_id: refId,
        p_xp: xp,
        p_seeds: seeds,
      });
      if (error) {
        console.error('Failed to award learning activity', error);
        return { xpAwarded: 0, seedsAwarded: 0 };
      }
      const row: any = Array.isArray(data) ? data[0] : data;
      const result: RewardResult = {
        xpAwarded: Number(row?.xp_awarded) || 0,
        seedsAwarded: Number(row?.seeds_awarded) || 0,
        newStreak: Number(row?.new_streak) || 0,
        leveledUp: Boolean(row?.leveled_up),
        newLevel: Number(row?.new_level) || undefined,
        levelSeedBonus: Number(row?.level_seed_bonus) || 0,
      };

      if (result.xpAwarded > 0 || result.seedsAwarded > 0) {
        setOnlineAcademyProfile((prev) => ({
          ...prev,
          xp: prev.xp + result.xpAwarded,
          seeds: prev.seeds + result.seedsAwarded,
          streakCount: result.newStreak ?? prev.streakCount,
          longestStreak: Math.max(prev.longestStreak, result.newStreak ?? prev.longestStreak),
          lastActivityDate: new Date().toISOString().slice(0, 10),
        }));
        if (activityType === 'lesson_complete') {
          setOnlineCompletedLessonIds((prev) => (prev.includes(refId) ? prev : [...prev, refId]));
        }
        setOnlineActivityCounts((prev) => ({ ...prev, [activityType]: (prev[activityType] || 0) + 1 }));
        void syncAcademyProgress();
      }
      return result;
    }

    const { state: nextState, result } = awardLearningActivityOffline(offlineAcademyRef.current, activityType, refId, xp, seeds, quests, achievements);
    updateOfflineAcademy(nextState);
    return result;
  };

  const LESSON_XP = 50, LESSON_SEEDS = 25;
  const QUIZ_PASS_XP = 30, QUIZ_PASS_SEEDS = 20;
  const QUIZ_PERFECT_XP = 20, QUIZ_PERFECT_SEEDS = 15;
  const PATH_COMPLETE_XP = 100, PATH_COMPLETE_SEEDS = 50;

  // One lesson quiz answer, correctly submitted, is simultaneously "complete
  // the lesson", "pass the quiz", and (if first try) "perfect quiz score" —
  // each tagged as its own ledger entry so it counts toward the right
  // quests/achievements/leaderboards, then rolled up into one combined
  // reward toast. If it was the last lesson in its category, also awards
  // "complete a learning path".
  const completeLessonWithQuiz = async (lessonId: string, isFirstAttempt: boolean): Promise<RewardResult> => {
    const r1 = await awardLearningActivity('lesson_complete', lessonId, LESSON_XP, LESSON_SEEDS);
    const r2 = await awardLearningActivity('quiz_pass', lessonId, QUIZ_PASS_XP, QUIZ_PASS_SEEDS);
    const r3 = isFirstAttempt ? await awardLearningActivity('quiz_perfect', lessonId, QUIZ_PERFECT_XP, QUIZ_PERFECT_SEEDS) : null;

    let pathResult: RewardResult | null = null;
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson && r1.xpAwarded > 0) {
      const categoryLessonIds = lessons.filter((l) => l.category === lesson.category).map((l) => l.id);
      const nowCompleted = new Set([...completedLessonIds, lessonId]);
      if (categoryLessonIds.every((id) => nowCompleted.has(id))) {
        pathResult = await awardLearningActivity('path_complete', lesson.category, PATH_COMPLETE_XP, PATH_COMPLETE_SEEDS);
      }
    }

    [r1, r2, r3, pathResult].forEach((r) => { if (r) applyLevelUpIfAny(r); });

    const combined: RewardResult = {
      xpAwarded: r1.xpAwarded + r2.xpAwarded + (r3?.xpAwarded || 0) + (pathResult?.xpAwarded || 0),
      seedsAwarded: r1.seedsAwarded + r2.seedsAwarded + (r3?.seedsAwarded || 0) + (pathResult?.seedsAwarded || 0),
    };
    if (combined.xpAwarded > 0 || combined.seedsAwarded > 0) {
      setLastReward(combined);
      triggerConfetti();
    }
    return combined;
  };

  // "Business challenge" and "business simulation" are the same student
  // action here — completing a BusinessSimulation scenario — tagged with
  // two ledger entries so it satisfies both the simulation-focused and
  // challenge-focused quests/achievements/leaderboards without paying out
  // twice (the challenge_complete tag always carries zero reward).
  const completeSimulation = async (scenarioId: string, xp: number, seeds: number): Promise<RewardResult> => {
    const r1 = await awardLearningActivity('simulation_complete', scenarioId, xp, seeds);
    const r2 = await awardLearningActivity('challenge_complete', scenarioId, 0, 0);
    applyLevelUpIfAny(r1);
    applyLevelUpIfAny(r2);
    const combined: RewardResult = { xpAwarded: r1.xpAwarded + r2.xpAwarded, seedsAwarded: r1.seedsAwarded + r2.seedsAwarded };
    if (combined.xpAwarded > 0 || combined.seedsAwarded > 0) {
      setLastReward(combined);
      triggerConfetti();
    }
    return combined;
  };

  const purchaseGardenItem = async (itemId: string): Promise<{ success: boolean; message?: string }> => {
    const item = gardenCatalog.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Unknown item' };

    if (supabase && authUser) {
      const { error } = await supabase.rpc('purchase_garden_item', { p_item_id: itemId });
      if (error) return { success: false, message: error.message || 'Purchase failed' };
      setOnlineAcademyProfile((prev) => ({ ...prev, seeds: prev.seeds - item.priceSeeds }));
      setOnlineOwnedGardenItems((prev) => [...prev, { itemId, equipped: false, purchasedAt: new Date().toISOString() }]);
      return { success: true };
    }

    const { state: nextState, error } = purchaseGardenItemOffline(offlineAcademyRef.current, itemId, gardenCatalog);
    if (error) return { success: false, message: error };
    updateOfflineAcademy(nextState);
    return { success: true };
  };

  const equipGardenItem = async (itemId: string, equip: boolean): Promise<void> => {
    if (supabase && authUser) {
      const { error } = await supabase.rpc('equip_garden_item', { p_item_id: itemId, p_equip: equip });
      if (error) { console.error('Failed to equip garden item', error); return; }
      setOnlineOwnedGardenItems((prev) => prev.map((o) => (o.itemId === itemId ? { ...o, equipped: equip } : o)));
      return;
    }
    updateOfflineAcademy(equipGardenItemOffline(offlineAcademyRef.current, itemId, equip));
  };

  const claimQuest = async (questId: string, periodKey: string): Promise<RewardResult> => {
    if (supabase && authUser) {
      const { data, error } = await supabase.rpc('claim_quest_reward', { p_quest_id: questId, p_period_key: periodKey });
      if (error) { console.error('Failed to claim quest', error); return { xpAwarded: 0, seedsAwarded: 0 }; }
      const row: any = Array.isArray(data) ? data[0] : data;
      const result: RewardResult = { xpAwarded: Number(row?.xp_awarded) || 0, seedsAwarded: Number(row?.seeds_awarded) || 0 };
      if (result.xpAwarded > 0 || result.seedsAwarded > 0) {
        setOnlineAcademyProfile((prev) => ({ ...prev, xp: prev.xp + result.xpAwarded, seeds: prev.seeds + result.seedsAwarded }));
        setOnlineQuestProgressMap((prev) => {
          const key = `${questId}:${periodKey}`;
          const existing = prev[key];
          return existing ? { ...prev, [key]: { ...existing, claimed: true } } : prev;
        });
        setLastReward(result);
        triggerConfetti();
      }
      return result;
    }

    const { state: nextState, result } = claimQuestRewardOffline(offlineAcademyRef.current, questId, periodKey, quests);
    updateOfflineAcademy(nextState);
    if (result.xpAwarded > 0 || result.seedsAwarded > 0) {
      setLastReward(result);
      triggerConfetti();
    }
    return result;
  };

  const refreshSquadChallenge = async (): Promise<void> => {
    if (!supabase || !authUser || !activeBusiness.id) {
      setActiveSquadChallenge(null);
      setSquadChallengeProgress(null);
      return;
    }
    const { data: challengeData, error: challengeError } = await supabase.rpc('get_or_create_active_squad_challenge', {
      p_business_id: activeBusiness.id,
    });
    if (challengeError || !challengeData) {
      console.error('Failed to load squad challenge', challengeError);
      return;
    }
    const challenge = rowToSquadChallenge(Array.isArray(challengeData) ? challengeData[0] : challengeData);
    setActiveSquadChallenge(challenge);

    const { data: progressData, error: progressError } = await supabase.rpc('get_squad_challenge_progress', {
      p_challenge_id: challenge.id,
    });
    if (progressError) {
      console.error('Failed to load squad challenge progress', progressError);
      return;
    }
    const p: any = Array.isArray(progressData) ? progressData[0] : progressData;
    const lessonsCount = Number(p?.lessons) || 0;
    const quizzesCount = Number(p?.quizzes) || 0;
    const challengesCount = Number(p?.challenges) || 0;
    setSquadChallengeProgress({
      lessons: lessonsCount,
      quizzes: quizzesCount,
      challenges: challengesCount,
      myContribution: Number(p?.my_contribution) || 0,
      completed: lessonsCount >= challenge.goalLessons && quizzesCount >= challenge.goalQuizzes && challengesCount >= challenge.goalChallenges,
      claimedByMe: Boolean(p?.claimed_by_me),
    });
  };

  const claimSquadChallengeReward = async (): Promise<RewardResult> => {
    if (!supabase || !activeSquadChallenge) return { xpAwarded: 0, seedsAwarded: 0 };
    const { data, error } = await supabase.rpc('claim_squad_challenge_reward', { p_challenge_id: activeSquadChallenge.id });
    if (error) {
      console.error('Failed to claim squad challenge reward', error);
      return { xpAwarded: 0, seedsAwarded: 0 };
    }
    const row: any = Array.isArray(data) ? data[0] : data;
    const result: RewardResult = { xpAwarded: Number(row?.xp_awarded) || 0, seedsAwarded: Number(row?.seeds_awarded) || 0 };
    if (result.xpAwarded > 0 || result.seedsAwarded > 0) {
      setOnlineAcademyProfile((prev) => ({ ...prev, xp: prev.xp + result.xpAwarded, seeds: prev.seeds + result.seedsAwarded }));
      setSquadChallengeProgress((prev) => (prev ? { ...prev, claimedByMe: true } : prev));
      setLastReward(result);
      triggerConfetti();
    }
    return result;
  };

  const setLeaderboardOptIn = async (optIn: boolean): Promise<void> => {
    if (supabase && authUser) {
      const { error } = await supabase.rpc('set_leaderboard_opt_in', { p_opt_in: optIn });
      if (error) { console.error('Failed to update leaderboard opt-in', error); return; }
      setOnlineAcademyProfile((prev) => ({ ...prev, leaderboardOptIn: optIn }));
      return;
    }
    updateOfflineAcademy({ ...offlineAcademyRef.current, profile: { ...offlineAcademyRef.current.profile, leaderboardOptIn: optIn } });
  };

  // ===================================================================
  // Notifications
  // ===================================================================

  // Offline/local-demo mode has no triggers to hook into, so equivalent
  // notifications are synthesized inline at the relevant action (placeOrder,
  // updateOrderStatus, and product-stock changes below) — mirrors the
  // offlineAcademyEngine.ts precedent of keeping the demo experience
  // functionally equivalent, not silently degraded.
  const synthesizeOfflineNotification = (
    type: AppNotification['type'],
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: string,
    action?: NotificationAction
  ) => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      message,
      isRead: false,
      relatedId,
      relatedType,
      action,
      createdAt: new Date().toISOString(),
    };
    setOfflineNotifications((prev) => [notif, ...prev]);
  };

  const markNotificationRead = async (id: string): Promise<void> => {
    setOnlineNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setOfflineNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    if (supabase && authUser) {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) console.error('Failed to mark notification read', error);
    }
  };

  const markAllNotificationsRead = async (): Promise<void> => {
    setOnlineNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setOfflineNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (supabase && authUser) {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', authUser.id).eq('is_read', false);
      if (error) console.error('Failed to mark all notifications read', error);
    }
  };

  const NOTIFICATION_PREFERENCE_COLUMNS: Record<NotificationPreferenceCategory, string> = {
    orders: 'orders',
    newProducts: 'new_products',
    restocks: 'restocks',
    promotions: 'promotions',
    announcements: 'announcements',
  };

  const updateNotificationPreference = async (category: NotificationPreferenceCategory, enabled: boolean): Promise<void> => {
    setOnlineNotificationPreferences((prev) => ({ ...prev, [category]: enabled }));
    setOfflineNotificationPreferences((prev) => ({ ...prev, [category]: enabled }));
    if (supabase && authUser) {
      const column = NOTIFICATION_PREFERENCE_COLUMNS[category];
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({ user_id: authUser.id, [column]: enabled, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) console.error('Failed to update notification preference', error);
    }
  };

  const toggleFavoriteBusiness = async (businessId: string): Promise<void> => {
    const isFavorited = favoritedBusinessIds.includes(businessId);
    setOnlineFavoritedBusinessIds((prev) => (isFavorited ? prev.filter((id) => id !== businessId) : prev.includes(businessId) ? prev : [...prev, businessId]));
    setOfflineFavoritedBusinessIds((prev) => (isFavorited ? prev.filter((id) => id !== businessId) : prev.includes(businessId) ? prev : [...prev, businessId]));

    if (supabase && authUser) {
      if (isFavorited) {
        const { error } = await supabase.from('business_favorites').delete().eq('user_id', authUser.id).eq('business_id', businessId);
        if (error) console.error('Failed to unfavorite shop', error);
      } else {
        const { error } = await supabase.from('business_favorites').insert({ user_id: authUser.id, business_id: businessId });
        if (error) console.error('Failed to favorite shop', error);
      }
    }
  };

  // Resolves a notification's deep-link `action` into this app's existing
  // navigation state. The active iOS tab lives outside this context (in
  // App.tsx's local state), so switching it goes through pendingNavigation —
  // App.tsx applies it in an effect, then clears it back to null.
  const resolveNotificationAction = (action?: NotificationAction): void => {
    if (!action || typeof action !== 'object' || !('view' in action)) return;
    const view = (action as { view: string }).view;

    if (view === 'seller_order' || view === 'seller_products') {
      const businessId = (action as { businessId?: string }).businessId;
      const biz = businesses.find((b) => b.id === businessId);
      if (biz) setActiveBusinessId(biz.id);
      setCurrentView('seller');
      setSellerTab(view === 'seller_order' ? 'orders' : 'products');
      setPendingNavigation({ tab: 'seller' });
    } else if (view === 'business' || view === 'product') {
      setPendingNavigation({ tab: 'market', businessId: (action as { businessId?: string }).businessId });
    } else if (view === 'customer_order') {
      setPendingNavigation({ tab: 'bag', orderId: (action as { orderId?: string }).orderId });
    } else if (view === 'subscription') {
      setIsSubscriptionPageOpen(true);
    } else if (view === 'marketplace') {
      setPendingNavigation({ tab: 'market' });
    }
    // 'announcement' has no dedicated screen yet — reading it is the whole action.
  };

  const loadMoreNotifications = async (): Promise<AppNotification[]> => {
    if (!supabase || !authUser || onlineNotifications.length === 0) return [];
    const oldest = onlineNotifications[onlineNotifications.length - 1];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', authUser.id)
      .lt('created_at', oldest.createdAt)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Failed to load more notifications', error);
      return [];
    }
    const rows = (data || []).map(rowToNotification);
    setOnlineNotifications((prev) => [...prev, ...rows]);
    return rows;
  };

  useEffect(() => {
    if (!supabase || !authUser || !activeBusiness.id) {
      setActiveSquadChallenge(null);
      setSquadChallengeProgress(null);
      return;
    }
    void refreshSquadChallenge();
  }, [authUser?.id, activeBusiness.id]);

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.inventoryCount, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.inventoryCount, quantity) }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(item.product.inventoryCount, quantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout & Place Order
  // Online, each business's suborder is placed via the place_order RPC
  // (migration_12), which atomically checks AND decrements stock server-side
  // before inserting the order — if any item doesn't have enough stock left,
  // the whole call rolls back (nothing decremented, no order row inserted)
  // instead of the old behavior of computing the next inventory count from
  // this tab's possibly-stale cached `products` state and inserting
  // unconditionally, which let two customers both "successfully" buy the
  // last unit of something. A business whose suborder fails keeps its items
  // in the cart (so the customer can adjust); businesses that already
  // succeeded are removed as usual.
  const placeOrder = async (orderData: {
    customerName: string;
    customerContact: string;
    customerUniversity: CampusUniversity;
    paymentMethod: 'GCash' | 'Maya' | 'Cash on Campus Meetup';
    fulfillmentType: 'Campus Meetup' | 'Locker/Dept Pickup' | 'Dorm Delivery';
    deliveryMethod?: DeliveryMethod;
    deliveryDate?: string;
    meetupLocation: string;
    notes?: string;
    couponCode?: string;
  }): Promise<{ success: boolean; orders: Order[]; failureReason?: string }> => {
    if (cart.length === 0) return { success: false, orders: [] };

    // Group items by business so multi-store orders produce separate orders per seller
    const itemsByBiz: Record<string, CartItem[]> = {};
    cart.forEach((item) => {
      const bId = item.product.businessId;
      if (!itemsByBiz[bId]) itemsByBiz[bId] = [];
      itemsByBiz[bId].push(item);
    });

    const newCreatedOrders: Order[] = [];
    const succeededBusinessIds: string[] = [];
    let failureReason: string | undefined;

    const entries = Object.entries(itemsByBiz);
    for (let idx = 0; idx < entries.length; idx++) {
      const [bId, bizItems] = entries[idx];
      const businessObj = businesses.find((b) => b.id === bId) || activeBusiness;
      const orderItems = bizItems.map((bi) => ({
        productId: bi.product.id,
        productName: bi.product.name,
        price: bi.product.price,
        costPrice: bi.product.costPrice,
        quantity: bi.quantity,
        imageUrl: bi.product.imageUrl,
        unit: bi.product.unit,
        isPreOrder: bi.product.isPreOrder || undefined,
      }));

      const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalCost = orderItems.reduce((s, i) => s + i.costPrice * i.quantity, 0);

      // A coupon only applies to the one shop it was created for — if the cart
      // spans multiple shops, it discounts just that shop's suborder.
      let discountAmount = 0;
      let appliedCouponCode: string | undefined;
      if (orderData.couponCode) {
        const result = validateCoupon(orderData.couponCode, bId, subtotal);
        if ('coupon' in result) {
          discountAmount = result.discount;
          appliedCouponCode = result.coupon.code;
        }
      }
      const totalAmount = Math.max(0, subtotal - discountAmount);

      const newOrder: Order = {
        id: `ord-${Date.now()}-${idx}`,
        orderNumber: `SS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        customerId: currentUser.id,
        customerName: orderData.customerName,
        customerContact: orderData.customerContact,
        customerUniversity: orderData.customerUniversity,
        businessId: bId,
        businessName: businessObj.name,
        items: orderItems,
        totalAmount,
        totalCost,
        couponCode: appliedCouponCode,
        discountAmount: discountAmount || undefined,
        paymentMethod: orderData.paymentMethod,
        paymentStatus:
          orderData.paymentMethod === 'Cash on Campus Meetup'
            ? 'Pay on Meetup'
            : orderData.deliveryMethod === 'Cash on Delivery'
              ? 'Pay on Delivery'
              : 'Paid',
        fulfillmentType: orderData.fulfillmentType,
        deliveryMethod: orderData.deliveryMethod,
        deliveryDate: orderData.deliveryDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        meetupLocation: orderData.meetupLocation,
        orderStatus: 'Pending',
        createdAt: new Date().toISOString(),
        notes: orderData.notes,
      };

      if (supabase) {
        // place_order (migration_13) is fully server-authoritative on
        // pricing and the coupon discount — it only trusts this client for
        // productId + quantity per item. It raises on any failure (sold
        // out, invalid/expired/exhausted coupon, etc.), which surfaces
        // here as `error`, rather than returning a `success` flag — that
        // also makes it atomic: a raised exception rolls back everything
        // the function already did in this call, so a failure partway
        // through never leaves a partial stock decrement behind.
        const { data, error } = await supabase.rpc('place_order', { p_order: newOrder });
        if (error) {
          console.error('Failed to place order', error);
          failureReason = error.message || 'a technical issue — please try again';
          break;
        }
        const row: any = Array.isArray(data) ? data[0] : data;

        // Reconcile with the server's authoritative totals — never trust
        // this tab's own pre-submission guess for what was actually charged.
        newOrder.totalAmount = Number(row?.final_total_amount) || 0;
        newOrder.discountAmount = row?.final_discount_amount ? Number(row.final_discount_amount) : undefined;
        newOrder.items = (row?.final_items as typeof orderItems) || orderItems;

        setCoupons((prev) => prev.map((c) => (c.code === appliedCouponCode && c.businessId === bId ? { ...c, redemptionCount: c.redemptionCount + 1 } : c)));

        // Stock was already validated + decremented server-side inside
        // place_order — this just reflects that in the locally cached
        // products list so the UI updates instantly instead of waiting on
        // a refetch.
        setProducts((prevProducts) =>
          prevProducts.map((p) => {
            const bought = newOrder.items.find((oi) => oi.productId === p.id);
            if (!bought) return p;
            return { ...p, inventoryCount: Math.max(0, p.inventoryCount - bought.quantity), soldCount: p.soldCount + bought.quantity };
          })
        );

        // A database trigger (notify_order_created, see migration_12)
        // notifies the merchant + customer automatically — no client call needed.
      } else {
        // Offline/local-demo mode: validate stock client-side (no real
        // concurrency risk with a single local account) and synthesize the
        // notifications a trigger would otherwise create.
        const insufficient = orderItems.find((oi) => {
          const product = products.find((p) => p.id === oi.productId);
          return !product || product.inventoryCount < oi.quantity;
        });
        if (insufficient) {
          failureReason = `${insufficient.productName} just sold out`;
          break;
        }

        if (appliedCouponCode) {
          setCoupons((prev) => prev.map((c) => (c.code === appliedCouponCode && c.businessId === bId ? { ...c, redemptionCount: c.redemptionCount + 1 } : c)));
        }

        setProducts((prevProducts) =>
          prevProducts.map((p) => {
            const bought = orderItems.find((oi) => oi.productId === p.id);
            if (!bought) return p;
            return { ...p, inventoryCount: Math.max(0, p.inventoryCount - bought.quantity), soldCount: p.soldCount + bought.quantity };
          })
        );

        synthesizeOfflineNotification(
          'new_order', '🌱 New order!', `You have a new order from ${orderData.customerName}.`,
          newOrder.id, 'order', { view: 'seller_order', businessId: bId, orderId: newOrder.id }
        );
        synthesizeOfflineNotification(
          'order_placed', '🌱 Order placed!', `Your order from ${businessObj.name} has been placed.`,
          newOrder.id, 'order', { view: 'customer_order', orderId: newOrder.id }
        );
      }

      newCreatedOrders.push(newOrder);
      succeededBusinessIds.push(bId);
    }

    if (newCreatedOrders.length > 0) {
      setOrders((prev) => [...newCreatedOrders, ...prev]);
      setCart((prev) => prev.filter((item) => !succeededBusinessIds.includes(item.product.businessId)));
      triggerConfetti();
    }

    return { success: !failureReason, orders: newCreatedOrders, failureReason };
  };

  // AI Business Coach
  const askAiCoach = async (userQuestion?: string): Promise<{ advice: string; fallback: boolean }> => {
    setIsAiCoachLoading(true);
    try {
      // The endpoint requires a valid session token from any deployment
      // with Supabase configured (see isAuthorizedAiCoachRequest in
      // server/aiCoach.ts) — otherwise it's unauthenticated and anyone who
      // finds the URL can run up the Gemini bill.
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
      }

      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          businessName: activeBusiness.name,
          category: activeBusiness.category,
          university: activeBusiness.university,
          metrics: activeBusinessMetrics,
          // Deliberately a lean summary, not the raw Order objects — each
          // order's line items carry imageUrl (this app stores product
          // images as base64 data URLs, which can run into megabytes),
          // and the AI coach only ever uses recentOrders for its count
          // anyway (see server/aiCoach.ts). Sending full orders here used
          // to blow past Express's default 100kb JSON body limit, so the
          // request was silently rejected and the UI fell back to the
          // same canned rule-based tip regardless of what was asked.
          recentOrders: sellerOrders.slice(0, 5).map((o) => ({
            orderNumber: o.orderNumber,
            totalAmount: o.totalAmount,
            orderStatus: o.orderStatus,
            itemCount: o.items.length,
          })),
          recentExpenses: sellerExpenses.slice(0, 5),
          userQuestion: userQuestion || 'What are the top 3 high-impact steps I should take this week?',
        }),
      });

      if (!response.ok) {
        throw new Error('Server response not ok');
      }

      const data = await response.json();
      setIsAiCoachLoading(false);
      return {
        advice: data.advice || 'Keep your cost-of-goods-sold low and maintain consistent campus meetup windows!',
        fallback: !!data.fallback,
      };
    } catch (err) {
      console.error('AI Coach request failed, using local rule-based smart advice', err);
      setIsAiCoachLoading(false);
      // Fallback rule-based smart advice
      const topExpense = [...sellerExpenses].sort((a, b) => b.amount - a.amount)[0];
      const lowStock = sellerProducts.filter((p) => p.inventoryCount <= 5);

      const adviceText = `🦉 **Peanut the Sprout Owl's Action Plan for ${activeBusiness.name}**:

1. **Protect Profit Margin (${activeBusinessMetrics.profitMargin}%):**
   ${activeBusinessMetrics.profitMargin < 35 
     ? 'Your current margin is tight. Increase prices by ₱15-₱20 or introduce a "Value Bundle" (e.g. 2 boxes + iced latte) to raise your Average Order Value.' 
     : 'Your margin is in a great spot! Lock in bulk rates with your suppliers to preserve this advantage.'}

2. **Expense & Sourcing Audit:**
   ${topExpense 
     ? `Your largest recorded expense is "${topExpense.description}" (₱${topExpense.amount.toLocaleString()}). Try partnering with other student sellers to split wholesale batches in Divisoria or Shopee.` 
     : 'Record every small fare or tape purchase so your net calculations remain accurate.'}

3. **Inventory & Campus Meetup Readiness:**
   ${lowStock.length > 0 
     ? `You have ${lowStock.length} items low on stock (${lowStock.map(p => p.name).join(', ')}). Prep stock before Friday campus drops!` 
     : 'Inventory levels are healthy for incoming campus orders.'}

⚡ **15-Minute Actionable Step:** Review your best-selling product and create a 3-item combo discount for upcoming midterm study groups!`;

      return { advice: adviceText, fallback: true };
    }
  };

  const resetToDefaultData = () => {
    localStorage.removeItem('sproutsquad_cart');
    setCart([]);

    // Real Supabase-backed business/product/order/expense data belongs to real
    // accounts now — don't let a "reset demo" action wipe it. Only the offline/
    // local-account fallback still resets to seed data.
    if (!isSupabaseConfigured) {
      localStorage.removeItem('sproutsquad_businesses');
      localStorage.removeItem('sproutsquad_products');
      localStorage.removeItem('sproutsquad_orders');
      localStorage.removeItem('sproutsquad_expenses');
      localStorage.removeItem('sproutsquad_academy_offline');
      setBusinesses(initialBusinesses.map((business) => ({ ...business, university: defaultSchool })));
      setProducts(initialProducts.map((product) => ({ ...product, university: defaultSchool })));
      setOrders(initialOrders.map((order) => ({ ...order, customerUniversity: defaultSchool })));
      setExpenses(initialExpenses);
      setActiveBusinessId('biz-1');
      updateOfflineAcademy(createEmptyOfflineAcademyState());
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        sellerTab,
        setSellerTab,
        currentUser,
        setCurrentUser,
        updateCurrentUser,
        activeBusiness,
        setActiveBusiness: (b) => setActiveBusinessId(b.id),
        accessibleBusinessIds,
        unlockBusinessByKey,
        selectedBusinessForDetail,
        setSelectedBusinessForDetail,
        selectedCampusFilter,
        setSelectedCampusFilter,
        pendingNavigation,
        setPendingNavigation,
        businesses,
        products,
        orders,
        expenses,
        coupons,
        lessons,
        completedLessonIds,
        cart,
        academyProfile,
        achievements,
        unlockedAchievementIds,
        activityCounts,
        gardenCatalog,
        ownedGardenItems,
        quests,
        questProgress,
        activeSquadChallenge,
        squadChallengeProgress,
        lastReward,
        clearLastReward: () => setLastReward(null),
        pendingLevelUp,
        clearPendingLevelUp: () => setPendingLevelUp(null),
        activeBusinessMetrics,
        sellerOrders,
        sellerProducts,
        sellerExpenses,
        sellerCoupons,
        cartCount,
        cartTotal,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        updateDeliverySchedule,
        confirmOrderReceived,
        addExpense,
        deleteExpense,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,
        updateBusinessProfile,
        createBusiness,
        awardLearningActivity,
        completeLessonWithQuiz,
        completeSimulation,
        purchaseGardenItem,
        equipGardenItem,
        claimQuest,
        refreshSquadChallenge,
        claimSquadChallengeReward,
        setLeaderboardOptIn,
        notifications,
        unreadNotificationCount,
        notificationPreferences,
        favoritedBusinessIds,
        markNotificationRead,
        markAllNotificationsRead,
        updateNotificationPreference,
        toggleFavoriteBusiness,
        resolveNotificationAction,
        loadMoreNotifications,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        askAiCoach,
        isAiCoachLoading,
        triggerConfetti,
        resetToDefaultData,
        isRemoteDataLoading,
        signOut: () => {
          // Reset RevenueCat's identified user *before* the auth sign-out completes,
          // so the next person on this browser/tab never inherits this user's
          // entitlements. Best-effort — sign-out proceeds regardless of outcome.
          void resetRevenueCatUser().finally(() => onSignOut?.());
        },
        subscription,
        hasSproutPlus: subscription.hasSproutPlus,
        isSubscriptionPageOpen,
        openSubscriptionPage: () => setIsSubscriptionPageOpen(true),
        closeSubscriptionPage: () => setIsSubscriptionPageOpen(false),
        offerings,
        isRevenueCatReady,
        isOfferingsLoading,
        offeringsError,
        loadSproutPlusOfferings,
        isPurchasingSproutPlus,
        purchaseSproutPlusPackage,
        restoreSproutPlusPurchases,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

