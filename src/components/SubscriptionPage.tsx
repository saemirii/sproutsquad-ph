import React, { useEffect, useState } from 'react';
import type { Package } from '@revenuecat/purchases-js';
import {
  X,
  Sparkles,
  Crown,
  RefreshCw,
  CalendarClock,
  Percent,
  Boxes,
  FileSpreadsheet,
  Rocket,
  Users,
  GraduationCap,
  Handshake,
  Store,
  ClipboardList,
  TrendingUp,
  ShoppingBag,
  Bot,
  BookOpen,
  Gauge,
  Wallet,
  KeyRound,
  PackageCheck,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { triggerConfetti } from '../utils/confetti';
import { isRevenueCatConfigured, SPROUT_PLUS_PRODUCTS } from '../lib/revenuecat';

interface SubscriptionPageProps {
  onClose: () => void;
}

interface PlanFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const freeFeatures: PlanFeature[] = [
  { icon: <ShoppingBag className="w-4 h-4" />, title: 'Campus Marketplace', description: 'Browse & buy from student businesses across your campus.' },
  { icon: <Gauge className="w-4 h-4" />, title: 'Shop OS', description: 'Manage your products, orders, delivery & expenses in one place.' },
  { icon: <Bot className="w-4 h-4" />, title: 'AI Co-Pilot', description: 'Get instant business coaching from Peanut the Owl.' },
  { icon: <BookOpen className="w-4 h-4" />, title: 'Sprout Academy', description: 'Learn practical business skills through bite-sized lessons.' },
  { icon: <PackageCheck className="w-4 h-4" />, title: 'Business Health Score', description: "Track your shop's financial performance at a glance." },
  { icon: <Wallet className="w-4 h-4" />, title: 'GCash & Maya Payments', description: 'Accept the payment methods your customers already use.' },
  { icon: <KeyRound className="w-4 h-4" />, title: 'BES Key Team Access', description: 'Invite teammates to help manage your shop.' },
];

const sproutFeatures: PlanFeature[] = [
  { icon: <RefreshCw className="w-4 h-4" />, title: 'Real-Time Inventory Tracking', description: 'Keep your stock updated automatically with Google Sheets integration.' },
  { icon: <CalendarClock className="w-4 h-4" />, title: 'Pre-Order System', description: 'Accept orders before a product is officially available.' },
  { icon: <Percent className="w-4 h-4" />, title: 'Discount & Coupon Generator', description: 'Create custom discounts and coupon codes for your customers.' },
  { icon: <Boxes className="w-4 h-4" />, title: 'Bundle Builder', description: 'Combine products into special bundles with their own pricing and inventory.' },
  { icon: <FileSpreadsheet className="w-4 h-4" />, title: 'Order Export', description: 'Export your orders for easy record-keeping, accounting, and management.' },
  { icon: <Rocket className="w-4 h-4" />, title: 'Product Drop Scheduler', description: 'Schedule products and collections to launch automatically at a set date and time.' },
];

const bloomFeatures: PlanFeature[] = [
  { icon: <Users className="w-4 h-4" />, title: '1-on-1 Mentoring', description: 'Get personalized business guidance from an experienced mentor.' },
  { icon: <GraduationCap className="w-4 h-4" />, title: 'Business Masterclasses', description: 'Learn practical skills through exclusive workshops and lessons.' },
  { icon: <Handshake className="w-4 h-4" />, title: 'Merchant Collaboration Matching', description: 'Connect with other student businesses for potential collaborations and partnerships.' },
  { icon: <Store className="w-4 h-4" />, title: 'Pop-Up & Market Access', description: 'Get access to SproutSquad-organized markets, pop-ups, and selling opportunities.' },
  { icon: <ClipboardList className="w-4 h-4" />, title: 'Opportunity Board', description: 'Discover curated competitions, grants, internships, suppliers, and business opportunities.' },
  { icon: <TrendingUp className="w-4 h-4" />, title: 'Business Growth Review', description: 'Review your performance and get guidance on where to improve and grow.' },
];

const planLabelForProduct = (productId: string | null): string => {
  if (productId === SPROUT_PLUS_PRODUCTS.monthly) return 'Sprout+ Monthly';
  if (productId === SPROUT_PLUS_PRODUCTS.yearly) return 'Sprout+ Yearly';
  return 'Sprout+';
};

const formatDate = (date: Date | null): string => {
  if (!date) return '—';
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onClose }) => {
  const {
    subscription,
    hasSproutPlus,
    offerings,
    isRevenueCatReady,
    isOfferingsLoading,
    offeringsError,
    loadSproutPlusOfferings,
    isPurchasingSproutPlus,
    purchaseSproutPlusPackage,
    restoreSproutPlusPurchases,
  } = useApp();

  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadSproutPlusOfferings();
  }, [loadSproutPlusOfferings]);

  const handlePurchase = async (pkg: Package, label: string) => {
    if (isPurchasingSproutPlus) return;
    setBanner(null);
    setPurchasingPackageId(pkg.identifier);
    const result = await purchaseSproutPlusPackage(pkg);
    setPurchasingPackageId(null);

    if (result.success) {
      triggerConfetti();
      setBanner({ type: 'success', text: `🎉 Welcome to ${label}! Your Sprout+ features are unlocked.` });
    } else if (result.cancelled) {
      // User closed the checkout themselves — not an error, just return to normal.
    } else {
      setBanner({ type: 'error', text: result.message || 'Something went wrong. Please try again.' });
    }
  };

  const handleRestore = async () => {
    setBanner(null);
    setIsRestoring(true);
    const result = await restoreSproutPlusPurchases();
    setIsRestoring(false);
    setBanner({ type: result.success ? 'info' : 'error', text: result.message || 'Something went wrong. Please try again.' });
  };

  const monthlyPkg = offerings?.current?.monthly ?? null;
  const yearlyPkg = offerings?.current?.annual ?? null;
  const hasOfferings = Boolean(monthlyPkg || yearlyPkg);

  return (
    <div className="absolute inset-0 z-[65] bg-[#FFF9E6] overflow-y-auto">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#194E3B] to-[#0E2B25] px-5 pt-6 pb-12 text-center overflow-hidden">
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-[#B8E6D5]/10 blur-xl" />
        <div className="absolute -bottom-10 -right-6 w-36 h-36 rounded-full bg-[#FFC2D1]/10 blur-xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8E6D5]">SproutSquad Membership</p>
        <h1 className="mt-2 text-2xl font-black text-white font-['Nunito',sans-serif] leading-tight">
          Grow your shop further 🌱 → 🌸
        </h1>
        <p className="mt-2 text-xs text-[#CFE9DD] max-w-xs mx-auto leading-5">
          Unlock the tools, mentorship, and opportunities serious student sellers use to level up their business.
        </p>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-5">
        {banner && (
          <div className={`rounded-xl text-xs font-bold text-center py-2.5 px-3 ${
            banner.type === 'success' ? 'bg-[#194E3B] text-[#B8E6D5]'
              : banner.type === 'error' ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#F8BA9E]'
              : 'bg-[#EAF6F0] text-[#194E3B] border border-[#9FD9C3]'
          }`}>
            {banner.text}
          </div>
        )}

        {/* Current Sprout+ status card — only shown when actively subscribed */}
        {hasSproutPlus && (
          <section className="rounded-3xl bg-white border-2 border-[#9FD9C3] shadow-md p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center">
                  <Crown className="w-4.5 h-4.5" />
                </span>
                <div>
                  <h2 className="text-sm font-black text-[#3B2F27] font-['Nunito',sans-serif]">
                    {planLabelForProduct(subscription.productIdentifier)}
                  </h2>
                  <p className="text-[11px] text-[#8C7A6D]">
                    {subscription.status === 'active' ? 'Active — renews automatically' : 'Active — ends at period end'}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                subscription.status === 'active' ? 'bg-[#B8E6D5] text-[#194E3B]' : 'bg-[#FFD3BA] text-[#7A2E1E]'
              }`}>
                {subscription.status === 'active' ? 'Active' : 'Cancelling'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-[#FAF3DE] p-2.5">
                <p className="text-[10px] font-bold text-[#8C7A6D]">
                  {subscription.status === 'active' ? 'Next renewal' : 'Access ends'}
                </p>
                <p className="font-black text-[#3B2F27]">{formatDate(subscription.expirationDate)}</p>
              </div>
              <div className="rounded-xl bg-[#FAF3DE] p-2.5">
                <p className="text-[10px] font-bold text-[#8C7A6D]">Member since</p>
                <p className="font-black text-[#3B2F27]">{formatDate(subscription.purchaseDate)}</p>
              </div>
            </div>

            {subscription.status === 'cancelling' && (
              <p className="text-[11px] text-[#7A2E1E] bg-[#FFF3E8] border border-[#F8BA9E] rounded-xl p-2.5">
                Your subscription is scheduled to end on {formatDate(subscription.expirationDate)}. You'll keep Sprout+ features until then.
              </p>
            )}

            <div className="flex gap-2">
              {subscription.managementURL && (
                <a
                  href={subscription.managementURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bouncy flex-1 rounded-xl bg-[#207559] hover:bg-[#194E3B] text-white text-xs font-black py-2.5 flex items-center justify-center gap-1.5"
                >
                  Manage subscription
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="flex-1 rounded-xl border border-[#E5DACD] bg-white hover:bg-[#FAF7F2] text-xs font-black text-[#3B2F27] py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isRestoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Refresh status
              </button>
            </div>
          </section>
        )}

        {/* Free plan */}
        <section className="rounded-3xl bg-white border border-[#EDE4D8] shadow-xs p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8C7A6D]">Basic</p>
              <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">Sprout</h2>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-[#3B2F27]">₱0</p>
              <p className="text-[10px] font-bold text-[#8C7A6D]">forever free</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2.5">
            {freeFeatures.map((feature) => (
              <li key={feature.title} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 w-6 h-6 rounded-lg bg-[#F2EAE0] text-[#8C7A6D] flex items-center justify-center">
                  {feature.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#3B2F27]">{feature.title}</p>
                  <p className="text-[11px] leading-4 text-[#7A6B5F]">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
          {!hasSproutPlus && (
            <div className="mt-4 rounded-xl bg-[#FAF3DE] border border-[#EDE4D8] py-2.5 text-center text-xs font-black text-[#8C7A6D]">
              Your current plan
            </div>
          )}
        </section>

        {/* Loading offerings — includes the brief window where RevenueCat is
            still finishing configuration (see isRevenueCatReady in AppContext),
            so this never flashes a misleading "not configured" message. */}
        {(isOfferingsLoading || (isRevenueCatConfigured && !isRevenueCatReady)) && !hasOfferings && (
          <section className="rounded-3xl bg-white border border-[#EDE4D8] shadow-xs p-8 flex flex-col items-center justify-center gap-2 text-center">
            <Loader2 className="w-6 h-6 text-[#207559] animate-spin" />
            <p className="text-xs font-bold text-[#6B5B4F]">Loading Sprout+...</p>
          </section>
        )}

        {/* Offerings failed to load */}
        {isRevenueCatReady && !isOfferingsLoading && offeringsError && !hasOfferings && (
          <section className="rounded-3xl bg-white border border-[#F8BA9E] shadow-xs p-6 flex flex-col items-center text-center gap-2">
            <AlertTriangle className="w-6 h-6 text-[#EA580C]" />
            <p className="text-xs font-bold text-[#3B2F27]">{offeringsError}</p>
            <button
              onClick={() => loadSproutPlusOfferings()}
              className="btn-bouncy mt-2 rounded-xl bg-[#207559] hover:bg-[#194E3B] text-white text-xs font-black px-4 py-2"
            >
              Try again
            </button>
          </section>
        )}

        {/* Not configured yet (no RevenueCat key / no offering set up in the dashboard) */}
        {isRevenueCatReady && !isOfferingsLoading && !offeringsError && !hasOfferings && (
          <section className="rounded-3xl bg-white border border-[#EDE4D8] shadow-xs p-6 text-center">
            <p className="text-xs font-bold text-[#6B5B4F]">
              {isRevenueCatConfigured
                ? "Sprout+ isn't available yet — check back soon!"
                : 'Sprout+ purchases are not configured yet.'}
            </p>
          </section>
        )}

        {/* Sprout+ Monthly */}
        {monthlyPkg && (
          <section className="relative rounded-3xl bg-gradient-to-br from-[#EAFBF3] to-white border-2 border-[#9FD9C3] shadow-md p-5 overflow-hidden">
            <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-2xl bg-[#207559] px-3 py-1.5 text-[10px] font-black text-white">
              <Sparkles className="w-3 h-3" /> MOST FLEXIBLE
            </div>
            <div className="flex items-center justify-between pr-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#207559]">Monthly</p>
                <h2 className="text-lg font-black text-[#194E3B] font-['Nunito',sans-serif]">🌱 Sprout+</h2>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-[#194E3B]">{monthlyPkg.webBillingProduct.price.formattedPrice}</p>
                <p className="text-[10px] font-bold text-[#207559]">per month</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] font-bold text-[#207559]">Everything in Sprout, plus:</p>
            <ul className="mt-3 space-y-2.5">
              {sproutFeatures.map((feature) => (
                <li key={feature.title} className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 w-6 h-6 rounded-lg bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center">
                    {feature.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#3B2F27]">{feature.title}</p>
                    <p className="text-[11px] leading-4 text-[#7A6B5F]">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            {subscription.productIdentifier === SPROUT_PLUS_PRODUCTS.monthly && hasSproutPlus ? (
              <div className="mt-4 w-full rounded-xl bg-[#EAF6F0] border border-[#9FD9C3] py-2.5 text-center text-xs font-black text-[#194E3B]">
                Your current plan
              </div>
            ) : (
              <button
                onClick={() => handlePurchase(monthlyPkg, 'Sprout+ Monthly')}
                disabled={isPurchasingSproutPlus}
                className="btn-bouncy mt-4 w-full rounded-xl bg-[#207559] py-2.5 text-xs font-black text-white hover:bg-[#194E3B] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {purchasingPackageId === monthlyPkg.identifier ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {purchasingPackageId === monthlyPkg.identifier ? 'Processing your subscription...' : 'Upgrade to Sprout+'}
              </button>
            )}
          </section>
        )}

        {/* Sprout+ Yearly (Bloom+) */}
        {yearlyPkg && (
          <section className="relative rounded-3xl bg-gradient-to-br from-[#FFF3E0] to-[#FFEBF1] border-2 border-[#F7C948] shadow-md p-5 overflow-hidden">
            <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-2xl bg-gradient-to-r from-[#F7C948] to-[#FF8FA3] px-3 py-1.5 text-[10px] font-black text-[#3B2F27]">
              <Crown className="w-3 h-3" /> BEST VALUE
            </div>
            <div className="flex items-center justify-between pr-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#B4501C]">Yearly</p>
                <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">🌿 Bloom+</h2>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-[#3B2F27]">{yearlyPkg.webBillingProduct.price.formattedPrice}</p>
                <p className="text-[10px] font-bold text-[#B4501C]">per year</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] font-bold text-[#B4501C]">Everything in Sprout+, plus:</p>
            <ul className="mt-3 space-y-2.5">
              {bloomFeatures.map((feature) => (
                <li key={feature.title} className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 w-6 h-6 rounded-lg bg-[#FFD3BA] text-[#7A341A] flex items-center justify-center">
                    {feature.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#3B2F27]">{feature.title}</p>
                    <p className="text-[11px] leading-4 text-[#7A6B5F]">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            {subscription.productIdentifier === SPROUT_PLUS_PRODUCTS.yearly && hasSproutPlus ? (
              <div className="mt-4 w-full rounded-xl bg-white/70 border border-[#F7C948] py-2.5 text-center text-xs font-black text-[#7A341A]">
                Your current plan
              </div>
            ) : (
              <button
                onClick={() => handlePurchase(yearlyPkg, 'Bloom+')}
                disabled={isPurchasingSproutPlus}
                className="btn-bouncy mt-4 w-full rounded-xl bg-gradient-to-r from-[#F7C948] to-[#FF8FA3] py-2.5 text-xs font-black text-[#3B2F27] hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {purchasingPackageId === yearlyPkg.identifier ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Crown className="w-3.5 h-3.5" />
                )}
                {purchasingPackageId === yearlyPkg.identifier ? 'Processing your subscription...' : 'Go Bloom+ and save'}
              </button>
            )}
          </section>
        )}

        {!hasSproutPlus && (
          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="w-full rounded-xl border border-[#E5DACD] bg-white hover:bg-[#FAF7F2] text-xs font-black text-[#3B2F27] py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isRestoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {isRestoring ? 'Restoring purchases...' : 'Restore Purchases'}
          </button>
        )}

        <p className="text-center text-[10px] text-[#8C7A6D] leading-4">
          Cancel anytime · Secure checkout powered by RevenueCat · Prices in your local currency
        </p>
      </div>
    </div>
  );
};
