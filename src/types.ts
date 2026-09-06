export type Role = 'seller' | 'customer' | 'both';

export type ProductCategory =
  | 'Bakes & Treats'
  | 'Crochet & Crafts'
  | 'Stickers & Stationery'
  | 'Thrift & Fashion'
  | 'Eco & Planters'
  | 'Tech & Accessories'
  | 'School Supplies'
  | 'Art & Prints';

export type CampusUniversity =
  | 'MGC New Life Christian Academy'
  | 'UP Diliman'
  | 'Ateneo de Manila'
  | 'UST Manila'
  | 'DLSU Manila'
  | 'PUP Sta. Mesa'
  | 'Mapua University'
  | 'FEU Manila'
  | 'Polytechnic & State Universities'
  | 'All Campuses';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  university: CampusUniversity;
  courseAndYear?: string;
  avatar: string;
  role: Role;
  contactNumber?: string;
}

export interface Business {
  id: string;
  sellerId: string;
  name: string;
  handle: string;
  tagline: string;
  description: string;
  logo: string;
  banner: string;
  university: CampusUniversity;
  campusPickupSpots: string[];
  category: ProductCategory;
  gcashNumber: string;
  mayaNumber?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  rating: number;
  reviewCount: number;
  establishedDate: string;
  badges: string[];
  besKey?: string;
}

export interface Product {
  id: string;
  businessId: string;
  businessName: string;
  university: CampusUniversity;
  name: string;
  description: string;
  price: number; // in PHP ₱ (selling price)
  costPrice: number; // in PHP ₱ (COGS - cost of goods sold per unit)
  category: ProductCategory;
  inventoryCount: number;
  imageUrl: string;
  tags: string[];
  isAvailable: boolean;
  unit: string; // e.g., 'box of 4', 'piece', 'set', 'pack'
  sku?: string;
  soldCount: number;
  /** If set, this product IS a bundle combining these other product ids (Sprout+ Bundle Builder). */
  bundledProductIds?: string[];
  /** Sprout+ Pre-Order System: accept orders before the product actually ships. */
  isPreOrder?: boolean;
  preOrderReleaseDate?: string | null; // ISO date string
  /** Sprout+ Product Drop Scheduler: hidden from the marketplace until this moment, then shows automatically. */
  dropDate?: string | null; // ISO datetime string
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'GCash' | 'Maya' | 'Cash on Campus Meetup';
export type DeliveryMethod = 'Lalamove' | 'J&T Express' | 'Cash on Delivery';
export type FulfillmentType = 'Campus Meetup' | 'Locker/Dept Pickup' | 'Dorm Delivery';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  costPrice: number;
  quantity: number;
  imageUrl: string;
  unit: string;
  isPreOrder?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerContact: string;
  customerUniversity: CampusUniversity;
  businessId: string;
  businessName: string;
  items: OrderItem[];
  totalAmount: number;
  totalCost: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending Verification' | 'Pay on Meetup' | 'Pay on Delivery';
  fulfillmentType: FulfillmentType;
  deliveryMethod?: DeliveryMethod;
  deliveryDate?: string;
  meetupLocation: string;
  orderStatus: OrderStatus;
  createdAt: string;
  notes?: string;
  couponCode?: string;
  discountAmount?: number;
}

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  businessId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number; // % (1-100) for 'percentage', PHP amount for 'fixed'
  isActive: boolean;
  maxRedemptions: number | null; // null = unlimited
  redemptionCount: number;
  expiresAt: string | null; // ISO date string, null = never expires
  createdAt: string;
}

export type ExpenseCategory =
  | 'Materials & Supplies'
  | 'Packaging'
  | 'Marketing & Promo'
  | 'Logistics & Campus Fare'
  | 'Stall & Fair Booth'
  | 'Tools & Equipment'
  | 'Other Expenses';

export interface Expense {
  id: string;
  businessId: string;
  date: string;
  description: string;
  amount: number; // in PHP ₱
  category: ExpenseCategory;
  supplierOrStore?: string;
  notes?: string;
}

export interface HealthInsight {
  id: string;
  type: 'warning' | 'positive' | 'tip' | 'action_needed';
  title: string;
  description: string;
  metricImpact?: string;
  recommendedAction: string;
  actionTab?: 'products' | 'expenses' | 'orders' | 'academy' | 'analytics';
  category: 'Margin' | 'Inventory' | 'Packaging' | 'Volume' | 'Cashflow';
}

export interface HealthScoreBreakdown {
  marginScore: number; // 0 - 35
  expenseScore: number; // 0 - 25
  orderScore: number; // 0 - 20
  inventoryScore: number; // 0 - 10
  academyScore: number; // 0 - 10
}

export interface BusinessMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number; // %
  orderCount: number;
  unitsSold: number;
  averageOrderValue: number;
  inventoryValue: number;
  lowStockCount: number;
  healthScore: number; // 0 - 100
  healthStatus: 'Thriving Sprout' | 'Growing Seedling' | 'Sprouting Sprout' | 'Needs Nurturing';
  healthScoreBreakdown: HealthScoreBreakdown;
  insights: HealthInsight[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSection {
  heading: string;
  body: string;
  keyTakeaway?: string;
  practicalFormula?: {
    title: string;
    formula: string;
    example: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  tagline: string;
  category: 'Pricing & Profit' | 'Campus Marketing' | 'Cashflow & Allowances' | 'Sourcing & COGS' | 'Customer Retention';
  level: 'Beginner' | 'Intermediate';
  estimatedMinutes: number;
  mascot: 'owl' | 'bunny' | 'fox' | 'sprout';
  icon: string;
  summary: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
  badgeReward: {
    name: string;
    icon: string;
    color: string;
  };
}

export type SellerTab = 'overview' | 'products' | 'orders' | 'delivery' | 'expenses' | 'academy' | 'settings';

// ===================================================================
// Sprout Academy Gamification
// ===================================================================

export type LearningActivityType =
  | 'lesson_complete'
  | 'quiz_pass'
  | 'quiz_perfect'
  | 'simulation_complete'
  | 'challenge_complete'
  | 'path_complete';

export interface AcademyProfile {
  xp: number;
  seeds: number;
  streakCount: number;
  longestStreak: number;
  lastActivityDate: string | null;
  leaderboardOptIn: boolean;
}

export interface AcademyLevel {
  level: number;
  title: string;
  icon: string;
  xpRequired: number;
  seedReward: number;
}

export type AchievementRequirementType =
  | 'lessons_completed'
  | 'streak_days'
  | 'quizzes_passed'
  | 'perfect_quizzes'
  | 'challenges_completed'
  | 'simulations_completed'
  | 'path_completed';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirementType: AchievementRequirementType;
  requirementValue: number;
  rewardXp: number;
  rewardSeeds: number;
  sortOrder: number;
}

export type GardenItemCategory = 'plants' | 'decorations' | 'structures' | 'profile' | 'seasonal';
export type GardenItemRarity = 'common' | 'rare' | 'epic';

export interface GardenItem {
  id: string;
  name: string;
  category: GardenItemCategory;
  emoji: string;
  priceSeeds: number;
  rarity: GardenItemRarity;
  seasonalTag?: string;
  sortOrder: number;
}

export interface UserGardenItem {
  itemId: string;
  equipped: boolean;
  purchasedAt: string;
}

export type QuestType = 'daily' | 'weekly';

export interface Quest {
  id: string;
  name: string;
  description: string;
  icon: string;
  questType: QuestType;
  activityType: LearningActivityType | 'streak_maintain';
  requirementValue: number;
  rewardXp: number;
  rewardSeeds: number;
  active: boolean;
  sortOrder: number;
}

export interface QuestProgress {
  questId: string;
  periodKey: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface SquadChallenge {
  id: string;
  businessId: string;
  name: string;
  description: string;
  icon: string;
  goalLessons: number;
  goalQuizzes: number;
  goalChallenges: number;
  rewardXp: number;
  rewardSeeds: number;
  startsAt: string;
  endsAt: string;
}

export interface SquadChallengeProgress {
  lessons: number;
  quizzes: number;
  challenges: number;
  myContribution: number;
  completed: boolean;
  claimedByMe: boolean;
}

/** Reward feedback returned from any award-granting action, for toast/level-up UI. */
export interface RewardResult {
  xpAwarded: number;
  seedsAwarded: number;
  newStreak?: number;
  leveledUp?: boolean;
  newLevel?: number;
  levelSeedBonus?: number;
}

export interface SimulationDecisionField {
  key: string;
  label: string;
  type: 'number' | 'toggle';
  min?: number;
  max?: number;
  step?: number;
  default: number | boolean;
  unit?: string;
  helpText?: string;
}

export interface SimulationResult {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  remainingCash: number;
  businessHealth: 'Thriving' | 'Stable' | 'Struggling' | 'At Risk';
  healthScore: number; // 0-100
  xpAwarded: number;
  seedsAwarded: number;
  feedback: string[];
}

export interface SimulationScenario {
  id: string;
  title: string;
  icon: string;
  tagline: string;
  category: string;
  startingCapital: number;
  decisions: SimulationDecisionField[];
  compute: (decisions: Record<string, number | boolean>, startingCapital: number) => SimulationResult;
}

export interface AiCoachMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
