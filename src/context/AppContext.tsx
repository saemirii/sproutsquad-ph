import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Business,
  Product,
  Order,
  Expense,
  Lesson,
  User,
  CartItem,
  BusinessMetrics,
  OrderStatus,
  Role,
  CampusUniversity,
  DeliveryMethod
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
  lessons: Lesson[];
  completedLessonIds: string[];
  cart: CartItem[];

  // Computed
  activeBusinessMetrics: BusinessMetrics;
  sellerOrders: Order[];
  sellerProducts: Product[];
  sellerExpenses: Expense[];
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
  updateBusinessProfile: (updated: Partial<Business>) => void;
  completeLesson: (lessonId: string) => void;
  createBusiness: (newBiz: Omit<Business, 'id' | 'sellerId' | 'rating' | 'reviewCount' | 'establishedDate' | 'badges'>) => void;

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

  const [lessons] = useState<Lesson[]>(initialLessons);

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('sproutsquad_completed_lessons');
    return saved ? JSON.parse(saved) : ['lesson-1'];
  });

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
  const PRODUCT_LIGHT_COLUMNS = 'id, business_id, business_name, university, name, description, price, cost_price, category, inventory_count, tags, is_available, unit, sku, sold_count';

  useEffect(() => {
    if (!supabase || !authUser) return;
    let cancelled = false;

    setIsRemoteDataLoading(true);
    Promise.all([
      supabase.from('businesses').select(BUSINESS_LIGHT_COLUMNS),
      supabase.from('products').select(PRODUCT_LIGHT_COLUMNS),
      supabase.from('orders').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
    ]).then(([businessesRes, productsRes, ordersRes, expensesRes, profileRes]) => {
      if (cancelled) return;

      if (businessesRes.error) console.error('Failed to load businesses', businessesRes.error);
      else setBusinesses((businessesRes.data || []).map(rowToBusiness));

      if (productsRes.error) console.error('Failed to load products', productsRes.error);
      else setProducts((productsRes.data || []).map(rowToProduct));

      if (ordersRes.error) console.error('Failed to load orders', ordersRes.error);
      else setOrders((ordersRes.data || []).map(rowToOrder));

      if (expensesRes.error) console.error('Failed to load expenses', expensesRes.error);
      else setExpenses((expensesRes.data || []).map(rowToExpense));

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
    safeSetItem('sproutsquad_completed_lessons', JSON.stringify(completedLessonIds));
  }, [completedLessonIds]);

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

  // Lesson actions
  const completeLesson = (lessonId: string) => {
    if (!completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds((prev) => [...prev, lessonId]);
      triggerConfetti();
    }
  };

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
      }));

      const totalAmount = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalCost = orderItems.reduce((s, i) => s + i.costPrice * i.quantity, 0);

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
    localStorage.removeItem('sproutsquad_completed_lessons');
    localStorage.removeItem('sproutsquad_cart');
    setCompletedLessonIds(['lesson-1']);
    setCart([]);

    // Real Supabase-backed business/product/order/expense data belongs to real
    // accounts now — don't let a "reset demo" action wipe it. Only the offline/
    // local-account fallback still resets to seed data.
    if (!isSupabaseConfigured) {
      localStorage.removeItem('sproutsquad_businesses');
      localStorage.removeItem('sproutsquad_products');
      localStorage.removeItem('sproutsquad_orders');
      localStorage.removeItem('sproutsquad_expenses');
      setBusinesses(initialBusinesses.map((business) => ({ ...business, university: defaultSchool })));
      setProducts(initialProducts.map((product) => ({ ...product, university: defaultSchool })));
      setOrders(initialOrders.map((order) => ({ ...order, customerUniversity: defaultSchool })));
      setExpenses(initialExpenses);
      setActiveBusinessId('biz-1');
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
        lessons,
        completedLessonIds,
        cart,
        activeBusinessMetrics,
        sellerOrders,
        sellerProducts,
        sellerExpenses,
        cartCount,
        cartTotal,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        updateDeliverySchedule,
        addExpense,
        deleteExpense,
        updateBusinessProfile,
        completeLesson,
        createBusiness,
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

