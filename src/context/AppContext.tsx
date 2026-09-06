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
  orderToRow,
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
  unlockBusiness: (businessId: string, besKey: string) => boolean;
  selectedBusinessForDetail: Business | null;
  setSelectedBusinessForDetail: (business: Business | null) => void;
  selectedCampusFilter: CampusUniversity | 'All Campuses';
  setSelectedCampusFilter: (campus: CampusUniversity | 'All Campuses') => void;

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
  }) => Order[];

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

  const unlockBusiness = (businessId: string, besKey: string) => {
    const business = businesses.find((candidate) => candidate.id === businessId);
    if (!business || !business.besKey || business.besKey !== besKey.trim()) return false;
    if (supabase) {
      void supabase.rpc('join_business_with_bes_key', {
        target_business_id: businessId,
        entered_bes_key: besKey.trim(),
      });
    }
    setUnlockedBusinessIds((previous) => previous.includes(businessId) ? previous : [...previous, businessId]);
    return true;
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
  const BUSINESS_LIGHT_COLUMNS = 'id, seller_id, name, handle, tagline, description, banner, university, campus_pickup_spots, category, gcash_number, maya_number, instagram_handle, tiktok_handle, rating, review_count, established_date, badges, bes_key';
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
      else setBusinesses((businessesRes.data || []).map(rowToBusiness));

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
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    let nextPaymentStatus: Order['paymentStatus'] | undefined;
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
  const placeOrder = (orderData: {
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
  }): Order[] => {
    if (cart.length === 0) return [];

    // Group items by business so multi-store orders produce separate orders per seller
    const itemsByBiz: Record<string, CartItem[]> = {};
    cart.forEach((item) => {
      const bId = item.product.businessId;
      if (!itemsByBiz[bId]) itemsByBiz[bId] = [];
      itemsByBiz[bId].push(item);
    });

    const newCreatedOrders: Order[] = [];

    Object.entries(itemsByBiz).forEach(([bId, bizItems], idx) => {
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
          if (supabase) {
            void supabase.rpc('redeem_coupon', { target_coupon_id: result.coupon.id }).then(({ error }) => {
              if (error) console.error('Failed to record coupon redemption', error);
            });
          }
          setCoupons((prev) => prev.map((c) => (
            c.id === result.coupon.id ? { ...c, redemptionCount: c.redemptionCount + 1 } : c
          )));
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

      newCreatedOrders.push(newOrder);

      if (supabase) {
        void supabase.from('orders').insert(orderToRow(newOrder)).then(({ error }) => {
          if (error) console.error('Failed to save order', error);
        });
      }

      // Decrement inventory count for each purchased product
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const bought = orderItems.find((oi) => oi.productId === p.id);
          if (bought) {
            const nextInventory = Math.max(0, p.inventoryCount - bought.quantity);
            const nextSoldCount = p.soldCount + bought.quantity;
            if (supabase) {
              void supabase.rpc('decrement_product_stock', {
                target_product_id: p.id,
                qty: bought.quantity,
              }).then(({ error }) => {
                if (error) console.error('Failed to update product inventory', error);
              });
            }
            return { ...p, inventoryCount: nextInventory, soldCount: nextSoldCount };
          }
          return p;
        })
      );
    });

    setOrders((prev) => [...newCreatedOrders, ...prev]);
    clearCart();
    triggerConfetti();
    return newCreatedOrders;
  };

  // AI Business Coach
  const askAiCoach = async (userQuestion?: string): Promise<{ advice: string; fallback: boolean }> => {
    setIsAiCoachLoading(true);
    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: activeBusiness.name,
          category: activeBusiness.category,
          university: activeBusiness.university,
          metrics: activeBusinessMetrics,
          recentOrders: sellerOrders.slice(0, 5),
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
        unlockBusiness,
        selectedBusinessForDetail,
        setSelectedBusinessForDetail,
        selectedCampusFilter,
        setSelectedCampusFilter,
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

