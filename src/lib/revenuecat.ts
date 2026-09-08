import { Capacitor } from '@capacitor/core';
import type { CustomerInfo as WebCustomerInfo, Offerings as WebOfferings, Package as WebPackage } from '@revenuecat/purchases-js';
import type { CustomerInfo as NativeCustomerInfo, PurchasesOfferings as NativeOfferings, PurchasesPackage as NativePackage } from '@revenuecat/purchases-capacitor';

// Single abstraction point for RevenueCat, on either platform. Nothing
// outside this file should import from '@revenuecat/purchases-js' or
// '@revenuecat/purchases-capacitor' directly (except for types), so either
// SDK can be swapped/upgraded without touching UI code.
//
// This is a thin runtime dispatcher, not the implementation — the actual
// logic lives in revenuecat.web.ts (Web Billing, used by the existing
// Netlify deployment) and revenuecat.native.ts (native StoreKit via
// RevenueCat's Capacitor SDK, used by the iOS app). Both are only ever
// loaded via dynamic import() based on Capacitor.isNativePlatform(), so
// whichever SDK isn't relevant to the current platform never ends up in
// that platform's loaded bundle (Vite code-splits each into its own chunk).
export * from './revenuecatConstants';

// Both real Offerings/Package/CustomerInfo shapes are structurally
// compatible for every field this app actually reads (confirmed directly
// against both SDKs' own type declarations) — a plain union lets consumers
// stay platform-agnostic without needing a bespoke shared interface.
export type Offerings = WebOfferings | NativeOfferings;
export type Package = WebPackage | NativePackage;
export type CustomerInfo = WebCustomerInfo | NativeCustomerInfo;

const REVENUECAT_WEB_PUBLIC_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY as string | undefined;
const REVENUECAT_IOS_PUBLIC_KEY = import.meta.env.VITE_REVENUECAT_IOS_PUBLIC_KEY as string | undefined;

// Doesn't need the dynamically-imported module — just needs to know which
// key applies to this platform, so UI can render a "not configured" state
// synchronously, before the platform module has necessarily loaded.
export const isRevenueCatConfigured = Boolean(
  Capacitor.isNativePlatform() ? REVENUECAT_IOS_PUBLIC_KEY : REVENUECAT_WEB_PUBLIC_KEY
);

type RevenueCatModule = typeof import('./revenuecat.web') | typeof import('./revenuecat.native');

let modulePromise: Promise<RevenueCatModule> | null = null;
function loadModule(): Promise<RevenueCatModule> {
  if (!modulePromise) {
    modulePromise = Capacitor.isNativePlatform() ? import('./revenuecat.native') : import('./revenuecat.web');
  }
  return modulePromise;
}

/**
 * Identifies (or configures, on first call) RevenueCat for the given stable
 * SproutSquad user id. Safe to call every time a user's session becomes
 * available — it only calls the network when the identified user actually
 * changes.
 */
export async function identifyRevenueCatUser(appUserId: string): Promise<CustomerInfo | null> {
  const mod = await loadModule();
  return mod.identifyRevenueCatUser(appUserId) as Promise<CustomerInfo | null>;
}

/**
 * Resets RevenueCat back to a fresh anonymous identity on sign-out, so the
 * next person to use this browser/tab/device never inherits the previous
 * user's entitlements.
 */
export async function resetRevenueCatUser(): Promise<void> {
  const mod = await loadModule();
  return mod.resetRevenueCatUser();
}

export async function fetchSproutPlusOfferings(): Promise<Offerings> {
  const mod = await loadModule();
  return mod.fetchSproutPlusOfferings() as Promise<Offerings>;
}

export async function purchaseSproutPlus(pkg: Package): Promise<{ customerInfo: CustomerInfo }> {
  const mod = await loadModule();
  return mod.purchaseSproutPlus(pkg as never) as Promise<{ customerInfo: CustomerInfo }>;
}

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  const mod = await loadModule();
  return mod.fetchCustomerInfo() as Promise<CustomerInfo | null>;
}

// Doesn't need the platform module at all — the two SDKs' Package shapes
// differ by field name only (webBillingProduct.price.formattedPrice vs.
// product.priceString), distinguishable by a plain runtime shape check, so
// this stays synchronous for use directly inside JSX render.
export function getPackagePriceString(pkg: Package): string {
  if ('webBillingProduct' in pkg) return pkg.webBillingProduct.price.formattedPrice;
  return pkg.product.priceString;
}

export async function restoreSproutPlusPurchases(): Promise<{
  success: boolean;
  message?: string;
  status?: import('./revenuecatConstants').SproutPlusStatus;
}> {
  const mod = await loadModule();
  return mod.restoreSproutPlusPurchases();
}

/**
 * Subscribes to entitlement-change pushes (native) / focus-triggered
 * refreshes (web). Returns an unsubscribe function — call it on cleanup.
 */
export async function addCustomerInfoUpdateListener(
  callback: (status: import('./revenuecatConstants').SproutPlusStatus) => void
): Promise<() => void> {
  const mod = await loadModule();
  return mod.addCustomerInfoUpdateListener(callback);
}

/** True if `error` represents the user closing/cancelling the checkout, as opposed to a real failure. */
export async function isUserCancelledError(error: unknown): Promise<boolean> {
  const mod = await loadModule();
  return mod.isUserCancelledError(error);
}

/** A short, user-safe message for a purchase/offerings failure. Never echoes raw SDK/network internals. */
export async function describePurchasesError(error: unknown): Promise<string> {
  const mod = await loadModule();
  return mod.describePurchasesError(error);
}
